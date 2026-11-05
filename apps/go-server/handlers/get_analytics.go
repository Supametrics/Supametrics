package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"supametrics/db"
	"supametrics/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
)

var allowedFilters = []string{
	"today",
	"yesterday",
	"thisweek",
	"thismonth",
	"thisyear",
}

func getTimeRange(filter string) (time.Time, time.Time, string) {
	now := time.Now().UTC()
	var startTime, endTime time.Time
	var bucketFormat string

	startOfDay := func(t time.Time) time.Time {
		return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
	}
	endOfDay := func(t time.Time) time.Time {
		return time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999000000, time.UTC)
	}

	switch filter {
	case "today":
		startTime = startOfDay(now)
		endTime = endOfDay(now)
		bucketFormat = "hour"
	case "yesterday":
		y := now.AddDate(0, 0, -1)
		startTime = startOfDay(y)
		endTime = endOfDay(y)
		bucketFormat = "hour"
	case "thisweek":
		// Assumes Monday start 
		weekday := now.Weekday()
		daysToMonday := int(weekday - time.Monday)
		if daysToMonday < 0 {
			daysToMonday += 7
		}
		startTime = startOfDay(now.AddDate(0, 0, -daysToMonday))
		endTime = endOfDay(now)
		bucketFormat = "day"
	case "thismonth":
		startTime = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		endTime = endOfMonth(now)
		bucketFormat = "day"
	case "thisyear":
		startTime = time.Date(now.Year(), time.January, 1, 0, 0, 0, 0, time.UTC)
		endTime = endOfYear(now)
		bucketFormat = "month"
	default: 
		return getTimeRange("today")
	}
	return startTime, endTime, bucketFormat
}

func endOfMonth(t time.Time) time.Time {
	y, m, _ := t.Date()
	return time.Date(y, m+1, 0, 23, 59, 59, 999000000, time.UTC)
}

func endOfYear(t time.Time) time.Time {
	return time.Date(t.Year(), time.December, 31, 23, 59, 59, 999000000, time.UTC)
}

type AnalyticsSummary struct {
	TotalVisits         int     `json:"totalVisits"`
	UniqueVisitors      int     `json:"uniqueVisitors"`
	TotalSessions       int     `json:"totalSessions"`
	TotalDuration       int     `json:"totalDuration"`
	AvgSessionDuration  float64 `json:"avgSessionDuration"`
}

type FrequencyData struct {
	Time           time.Time `json:"time"`
	TotalVisits    int       `json:"totalVisits"`
	UniqueVisitors int       `json:"uniqueVisitors"`
}

func GetAnalytics(c *fiber.Ctx) error {
	ctx, ok := c.Locals("project_ctx").(middleware.ProjectContext)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Project context missing"})
	}

	projectID := ctx.ProjectID
	filter := c.Query("filter", "today")
	eventType := c.Query("eventType", "pageview")
	eventName := c.Query("eventName")
	frequencyGroupBy := c.Query("frequencyGroupBy", "all")

	allowedGroupBy := []string{"all", "browser", "device", "os", "country", "city", "pathname", "referrer"}
	isValidGroupBy := false
	for _, g := range allowedGroupBy {
		if g == frequencyGroupBy {
			isValidGroupBy = true
			break
		}
	}
	if !isValidGroupBy {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid frequencyGroupBy provided",
		})
	}

	isValidFilter := false
	for _, f := range allowedFilters {
		if f == filter {
			isValidFilter = true
			break
		}
	}
	if !isValidFilter {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid filter provided",
		})
	}

	startTime, endTime, bucketFormat := getTimeRange(filter)

	whereClause := "project_id = $1 AND timestamp >= $2 AND timestamp <= $3"
	queryArgs := []interface{}{projectID, startTime, endTime}
	argIndex := 4

	// Filter by event type
	if eventType == "pageview" {
		whereClause += fmt.Sprintf(" AND event_type = $%d", argIndex)
		queryArgs = append(queryArgs, "pageview")
		argIndex++
	} else if eventType == "custom" {
		whereClause += fmt.Sprintf(" AND event_type != $%d", argIndex)
		queryArgs = append(queryArgs, "pageview")
		argIndex++
	}

	// Filter by specific event name if provided
	if eventName != "" {
		whereClause += fmt.Sprintf(" AND event_name = $%d", argIndex)
		queryArgs = append(queryArgs, eventName)
		argIndex++
	}

	summaryQuery := fmt.Sprintf(`
		SELECT 
			(SELECT COUNT(*) FROM analytics_events WHERE %s AND event_type = 'pageview') as total_visits,
			COUNT(DISTINCT visitor_id) as unique_visitors,
			COUNT(DISTINCT session_id) as total_sessions,
			COALESCE(SUM(session_duration), 0) as total_duration,
			COALESCE(AVG(session_duration), 0) as avg_session_duration
		FROM (
			SELECT 
				session_id,
				visitor_id,
				GREATEST(
					EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))),
					COALESCE(NULLIF(MAX(duration), 0), 0)
				) as session_duration
			FROM analytics_events 
			WHERE %s
			GROUP BY session_id, visitor_id
		) s;
	`, whereClause, whereClause)

	var summary AnalyticsSummary
	err := db.DB.QueryRow(summaryQuery, queryArgs...).Scan(
		&summary.TotalVisits,
		&summary.UniqueVisitors,
		&summary.TotalSessions,
		&summary.TotalDuration,
		&summary.AvgSessionDuration,
	)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Analytics summary query error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error fetching summary"})
	}

	frequencyQuery := fmt.Sprintf(`
		SELECT 
			date_trunc('%s', timestamp) AS time_bucket,
			COUNT(CASE WHEN event_type = 'pageview' THEN 1 END) AS total_visits, 
			COUNT(DISTINCT visitor_id) AS unique_visitors 
		FROM analytics_events 
		WHERE %s 
		GROUP BY time_bucket 
		ORDER BY time_bucket;
	`, bucketFormat, whereClause)

	// Map dimension to database column
	dimensionColumnMap := map[string]string{
		"browser":  "browser_name",
		"device":   "device_type",
		"os":       "os_name",
		"country":  "country",
		"city":     "city",
		"pathname": "pathname",
		"referrer": "referrer",
	}

	var rows *sql.Rows
	var err error

	if frequencyGroupBy == "all" {
		// Default behavior: group only by time
		rows, err = db.DB.Query(frequencyQuery, queryArgs...)
	} else {
		// Group by time AND dimension
		dimensionColumn := dimensionColumnMap[frequencyGroupBy]
		frequencyQueryGrouped := fmt.Sprintf(`
			SELECT 
				date_trunc('%s', timestamp) AS time_bucket,
				%s AS dimension,
				COUNT(CASE WHEN event_type = 'pageview' THEN 1 END) AS total_visits,
				COUNT(DISTINCT visitor_id) AS unique_visitors
			FROM analytics_events 
			WHERE %s AND %s IS NOT NULL
			GROUP BY time_bucket, dimension
			ORDER BY time_bucket, dimension;
		`, bucketFormat, dimensionColumn, whereClause, dimensionColumn)
		
		rows, err = db.DB.Query(frequencyQueryGrouped, queryArgs...)
	}

	if err != nil {
		log.Println("Analytics frequency query error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error fetching frequency"})
	}
	defer rows.Close()

	type FrequencyPoint struct {
		Time           time.Time `json:"time"`
		Dimension      *string   `json:"dimension,omitempty"`
		TotalVisits    int       `json:"totalVisits"`
		UniqueVisitors int       `json:"uniqueVisitors"`
	}

	var frequencyPoints []FrequencyPoint
	for rows.Next() {
		var fp FrequencyPoint
		if frequencyGroupBy == "all" {
			if err := rows.Scan(&fp.Time, &fp.TotalVisits, &fp.UniqueVisitors); err != nil {
				log.Println("Error scanning frequency row:", err)
				continue
			}
		} else {
			if err := rows.Scan(&fp.Time, &fp.Dimension, &fp.TotalVisits, &fp.UniqueVisitors); err != nil {
				log.Println("Error scanning frequency row:", err)
				continue
			}
		}
		frequencyPoints = append(frequencyPoints, fp)
	}

	// Format the response based on groupBy
	var frequencyData interface{}
	
	if frequencyGroupBy == "all" {
		// Simple array format
		formattedFrequency := make([]FrequencyData, 0, len(frequencyPoints))
		for _, fp := range frequencyPoints {
			formattedFrequency = append(formattedFrequency, FrequencyData{
				Time:           fp.Time,
				TotalVisits:    fp.TotalVisits,
				UniqueVisitors: fp.UniqueVisitors,
			})
		}
		frequencyData = formattedFrequency
	} else {
		// Grouped series format
		seriesMap := make(map[string][]FrequencyData)
		
		for _, fp := range frequencyPoints {
			dimensionValue := "Unknown"
			if fp.Dimension != nil {
				dimensionValue = *fp.Dimension
			}
			
			if _, exists := seriesMap[dimensionValue]; !exists {
				seriesMap[dimensionValue] = []FrequencyData{}
			}
			
			seriesMap[dimensionValue] = append(seriesMap[dimensionValue], FrequencyData{
				Time:           fp.Time,
				TotalVisits:    fp.TotalVisits,
				UniqueVisitors: fp.UniqueVisitors,
			})
		}
		
		// Convert map to array of series
		type Series struct {
			Name string          `json:"name"`
			Data []FrequencyData `json:"data"`
		}
		
		series := make([]Series, 0, len(seriesMap))
		for name, data := range seriesMap {
			series = append(series, Series{
				Name: name,
				Data: data,
			})
		}
		
		frequencyData = series
	}

	responseData := fiber.Map{
		"projectId":           projectID,
		"filter":              filter,
		"eventType":           eventType,
		"frequencyGroupBy":    frequencyGroupBy,
		"totalVisits":         summary.TotalVisits,
		"uniqueVisitors":      summary.UniqueVisitors,
		"totalSessions":       summary.TotalSessions,
		"totalDuration":       summary.TotalDuration,
		"avgSessionDuration":  summary.AvgSessionDuration,
		"frequency":           frequencyData,
	}

	if eventName != "" {
		responseData["eventName"] = eventName
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Analytics fetched successfully",
		"data":    responseData,
	})
}
