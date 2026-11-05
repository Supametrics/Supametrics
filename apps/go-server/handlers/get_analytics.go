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

	// Get dimension filters
	browserFilter := c.Query("browser")
	deviceFilter := c.Query("device")
	osFilter := c.Query("os")
	countryFilter := c.Query("country")
	cityFilter := c.Query("city")
	pathnameFilter := c.Query("pathname")
	referrerFilter := c.Query("referrer")

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

	// Apply dimension filters
	if browserFilter != "" {
		whereClause += fmt.Sprintf(" AND browser_name = $%d", argIndex)
		queryArgs = append(queryArgs, browserFilter)
		argIndex++
	}
	if deviceFilter != "" {
		whereClause += fmt.Sprintf(" AND device_type = $%d", argIndex)
		queryArgs = append(queryArgs, deviceFilter)
		argIndex++
	}
	if osFilter != "" {
		whereClause += fmt.Sprintf(" AND os_name = $%d", argIndex)
		queryArgs = append(queryArgs, osFilter)
		argIndex++
	}
	if countryFilter != "" {
		whereClause += fmt.Sprintf(" AND country = $%d", argIndex)
		queryArgs = append(queryArgs, countryFilter)
		argIndex++
	}
	if cityFilter != "" {
		whereClause += fmt.Sprintf(" AND city = $%d", argIndex)
		queryArgs = append(queryArgs, cityFilter)
		argIndex++
	}
	if pathnameFilter != "" {
		whereClause += fmt.Sprintf(" AND pathname = $%d", argIndex)
		queryArgs = append(queryArgs, pathnameFilter)
		argIndex++
	}
	if referrerFilter != "" {
		whereClause += fmt.Sprintf(" AND referrer = $%d", argIndex)
		queryArgs = append(queryArgs, referrerFilter)
		argIndex++
	}

	summaryQuery := fmt.Sprintf(`
		SELECT 
			(SELECT COUNT(*) FROM analytics_events WHERE %s AND event_type = 'pageview') as total_visits,
			COUNT(DISTINCT filtered.visitor_id) as unique_visitors,
			COUNT(DISTINCT filtered.session_id) as total_sessions,
			COALESCE(SUM(all_sessions.session_duration), 0) as total_duration,
			COALESCE(AVG(all_sessions.session_duration), 0) as avg_session_duration
		FROM (
			SELECT DISTINCT session_id, visitor_id
			FROM analytics_events 
			WHERE %s
		) filtered
		LEFT JOIN (
			SELECT 
				session_id,
				GREATEST(
					EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))),
					COALESCE(NULLIF(MAX(duration), 0), 0)
				) as session_duration
			FROM analytics_events 
			WHERE project_id = $1 AND timestamp >= $2 AND timestamp <= $3
			GROUP BY session_id
		) all_sessions ON filtered.session_id = all_sessions.session_id;
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

	rows, err := db.DB.Query(frequencyQuery, queryArgs...)
	if err != nil {
		log.Println("Analytics frequency query error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Database error fetching frequency"})
	}
	defer rows.Close()

	var frequencyData []FrequencyData
	for rows.Next() {
		var fd FrequencyData
		if err := rows.Scan(&fd.Time, &fd.TotalVisits, &fd.UniqueVisitors); err != nil {
			log.Println("Error scanning frequency row:", err)
			continue
		}
		frequencyData = append(frequencyData, fd)
	}

	responseData := fiber.Map{
		"projectId":           projectID,
		"filter":              filter,
		"eventType":           eventType,
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
