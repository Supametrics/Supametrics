import { Hono } from "hono";
import type { Context } from "hono";
import { db } from "../db/index.js";
import { analyticsEvents, projects } from "../db/schema.js";
import { sql, eq, gte, lte, and, desc, isNotNull } from "drizzle-orm";
import { getUserOrNull, getProjectMembership } from "../helpers/projects.js";
import type { AuthType } from "../lib/auth.js";
import { isValidUUID } from "@/lib/zod.js";

const analyticsRoutes = new Hono<{ Variables: AuthType }>();

const allowedFilters = [
  "10secs",
  "5mins",
  "today",
  "yesterday",
  "thisweek",
  "thismonth",
  "thisyear",
  "last3years",
];

// date helpers
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const startOfWeek = (d: Date) => {
  const day = d.getDay() || 7; // Sunday=0 -> 7
  const diff = 1 - day; // Monday start
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
};
const endOfWeek = (d: Date) => {
  const monday = startOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return endOfDay(sunday);
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
const endOfYear = (d: Date) =>
  new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
const startOfYearNYearsAgo = (d: Date, n: number) =>
  new Date(d.getFullYear() - n, 0, 1);

// time range helpers
function getTimeRange(filter: string) {
  const now = new Date(); // fresh per request
  let startTime: Date, endTime: Date | undefined, bucketFormat: string;

  switch (filter) {
    case "10secs":
      startTime = new Date(now.getTime() - 10 * 1000);
      bucketFormat = "second";
      break;
    case "5mins":
      startTime = new Date(now.getTime() - 5 * 60 * 1000);
      bucketFormat = "minute";
      break;
    case "today":
      startTime = startOfDay(now);
      endTime = endOfDay(now);
      bucketFormat = "hour";
      break;
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      startTime = startOfDay(y);
      endTime = endOfDay(y);
      bucketFormat = "hour";
      break;
    }
    case "thisweek":
      startTime = startOfWeek(now);
      endTime = endOfWeek(now);
      bucketFormat = "day";
      break;
    case "thismonth":
      startTime = startOfMonth(now);
      endTime = endOfMonth(now);
      bucketFormat = "day";
      break;
    case "thisyear":
      startTime = startOfYear(now);
      endTime = endOfYear(now);
      bucketFormat = "month";
      break;
    case "last3years":
      startTime = startOfYearNYearsAgo(now, 3);
      endTime = now;
      bucketFormat = "month";
      break;
    default:
      throw new Error("Invalid filter");
  }
  return { startTime, endTime, bucketFormat };
}

function getPreviousTimeRange(
  filter: string,
  currentStart: Date,
  currentEnd?: Date
) {
  switch (filter) {
    case "10secs":
      return {
        startTime: new Date(currentStart.getTime() - 10 * 1000),
        endTime: currentStart,
      };
    case "5mins":
      return {
        startTime: new Date(currentStart.getTime() - 5 * 60 * 1000),
        endTime: currentStart,
      };
    case "today":
    case "yesterday":
      return {
        startTime: new Date(currentStart.getTime() - 24 * 60 * 60 * 1000),
        endTime: new Date(
          (currentEnd || currentStart).getTime() - 24 * 60 * 60 * 1000
        ),
      };
    case "thisweek":
      return {
        startTime: new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(
          (currentEnd || currentStart).getTime() - 7 * 24 * 60 * 60 * 1000
        ),
      };
    case "thismonth": {
      const prevMonthStart = new Date(currentStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(currentEnd!);
      prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
      return { startTime: prevMonthStart, endTime: prevMonthEnd };
    }
    case "thisyear": {
      const prevYearStart = new Date(currentStart);
      prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
      const prevYearEnd = new Date(currentEnd!);
      prevYearEnd.setFullYear(prevYearEnd.getFullYear() - 1);
      return { startTime: prevYearStart, endTime: prevYearEnd };
    }
    case "last3years": {
      const prevEnd = new Date(currentStart.getTime() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setFullYear(prevStart.getFullYear() - 3);
      return { startTime: prevStart, endTime: prevEnd };
    }
    default:
      throw new Error("Invalid filter");
  }
}

function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

async function getOnlineVisitors(projectId: string) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

  const result = await db
    .select({
      onlineVisitors: sql`count(distinct ${analyticsEvents.visitorId})`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        gte(analyticsEvents.timestamp, twoMinutesAgo)
      )
    );

  return Number(result[0]?.onlineVisitors || 0);
}

// Aggregations helper
async function getCommonAggregations(conditions: any[]) {
  const commonSelect = (groupByCols: any[]) =>
    db
      .select({
        count: sql`count(*)`,
        ...groupByCols.reduce(
          (acc, col) => {
            // alias column with its base name (e.g., event_type -> eventType)
            const alias = String(col.name).split(".").pop()!;
            return { ...acc, [alias]: col };
          },
          {} as Record<string, any>
        ),
      })
      .from(analyticsEvents)
      .where(and(...conditions, isNotNull(groupByCols[0])))
      .groupBy(...groupByCols)
      .orderBy(desc(sql`count(*)`));

  const [
    eventSummary,
    osSummary,
    deviceSummary,
    browserSummary,
    topPaths,
    topReferrers,
    topDurations,
    topHostnames,
    topUtmSources,
    topCountries,
    topCities,
    totalVisitsRes,
    uniqueVisitorsRes,
    totalDurationRes,
  ] = await Promise.all([
    commonSelect([analyticsEvents.eventType, analyticsEvents.eventName]),
    commonSelect([analyticsEvents.osName]),
    commonSelect([analyticsEvents.deviceType]),
    commonSelect([analyticsEvents.browserName]),
    commonSelect([analyticsEvents.pathname]).limit(15),
    commonSelect([analyticsEvents.referrer]).limit(15),
    commonSelect([analyticsEvents.duration]).limit(10),
    commonSelect([analyticsEvents.hostname]).limit(10),
    commonSelect([analyticsEvents.utmSource]).limit(5),
    commonSelect([analyticsEvents.country]).limit(10),
    commonSelect([analyticsEvents.city]).limit(10),
    db
      .select({
        totalVisits: sql`count(*)`,
      })
      .from(analyticsEvents)
      .where(and(...conditions)),
    db
      .select({
        uniqueVisitors: sql`count(distinct ${analyticsEvents.visitorId})`,
        totalSessions: sql`count(distinct ${analyticsEvents.sessionId})`,
      })
      .from(analyticsEvents)
      .where(and(...conditions)),
    db
      .select({
        totalDuration: sql`sum(session_duration)`,
        avgDuration: sql`avg(session_duration)`,
      })
      .from(
        db
          .select({
            session_duration:
              sql`coalesce(nullif(max(${analyticsEvents.duration}), 0), 1)`.as(
                "session_duration"
              ),
          })
          .from(analyticsEvents)
          .where(and(...conditions))
          .groupBy(analyticsEvents.sessionId)
          .as("s")
      ),
  ]);

  return {
    osSummary,
    deviceSummary,
    browserSummary,
    topPaths,
    topReferrers,
    topDurations,
    topHostnames,
    topUtmSources,
    topCountries,
    topCities,
    totalVisits: Number(totalVisitsRes[0]?.totalVisits || 0),
    uniqueVisitors: Number(uniqueVisitorsRes[0]?.uniqueVisitors || 0),
    totalSessions: Number(uniqueVisitorsRes[0]?.totalSessions || 0),
    totalDuration: Number(totalDurationRes[0]?.totalDuration || 0),
    avgDuration: Number(totalDurationRes[0]?.avgDuration || 0),
  };
}

// Main fetcher
async function fetchAnalytics(c: Context<{ Variables: AuthType }>) {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");

  if (!isValidUUID.safeParse(projectId).success) {
    return c.json(
      {
        error: "Invalid project ID",
        data: null,
        success: false,
        message: "The provided project ID is not a valid UUID",
      },
      400
    );
  }

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.uuid, projectId))
    .limit(1)
    .then((r) => r[0]);

  if (!(await getProjectMembership(projectId, currentUser!.uuid))) {
    return c.json(
      {
        error: "Forbidden",
        data: null,
        message: "You do not have access to this project",
        success: false,
      },
      403
    );
  }

  const onlineVisitors = await getOnlineVisitors(projectId);

  const filter = (c.req.query("filter") || "today").toLowerCase();
  const eventType = (c.req.query("eventType") || "pageview").toLowerCase();
  const eventName = c.req.query("eventName"); // Get specific event name from query
  
  if (!allowedFilters.includes(filter)) {
    return c.json(
      {
        error: "Invalid filter",
        data: null,
        message: "The specified filter is not valid",
        success: false,
      },
      400
    );
  }

  const { startTime, endTime, bucketFormat } = getTimeRange(filter);
  const prevRange = getPreviousTimeRange(filter, startTime, endTime);

  const conditionsCurrent: any[] = [
    eq(analyticsEvents.projectId, projectId),
    gte(analyticsEvents.timestamp, startTime),
  ];
  if (endTime) conditionsCurrent.push(lte(analyticsEvents.timestamp, endTime));
  
  // Filter by event type
  if (eventType === "pageview") {
    conditionsCurrent.push(eq(analyticsEvents.eventType, "pageview"));
  } else if (eventType === "custom") {
    conditionsCurrent.push(sql`${analyticsEvents.eventType} != 'pageview'`);
  }
  
  // Filter by specific event name if provided
  if (eventName) {
    conditionsCurrent.push(eq(analyticsEvents.eventName, eventName));
  }

  const conditionsPrevious: any[] = [
    eq(analyticsEvents.projectId, projectId),
    gte(analyticsEvents.timestamp, prevRange.startTime),
    lte(analyticsEvents.timestamp, prevRange.endTime),
  ];
  
  // Apply same event type filter to previous period
  if (eventType === "pageview") {
    conditionsPrevious.push(eq(analyticsEvents.eventType, "pageview"));
  } else if (eventType === "custom") {
    conditionsPrevious.push(sql`${analyticsEvents.eventType} != 'pageview'`);
  }
  
  if (eventName) {
    conditionsPrevious.push(eq(analyticsEvents.eventName, eventName));
  }

  const [commonData, previousTotalsRes] = await Promise.all([
    getCommonAggregations(conditionsCurrent),
    db
      .select({
        totalVisits: sql`count(*)`,
        uniqueVisitors: sql`count(distinct ${analyticsEvents.visitorId})`,
      })
      .from(analyticsEvents)
      .where(and(...conditionsPrevious)),
  ]);

  const previousTotals = {
    totalVisits: Number(previousTotalsRes[0]?.totalVisits || 0),
    uniqueVisitors: Number(previousTotalsRes[0]?.uniqueVisitors || 0),
  };

  const formatChange = (val: number | null) =>
    val === null ? null : `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;

  const totalVisitsChange = formatChange(
    calcPercentChange(commonData.totalVisits, previousTotals.totalVisits)
  );
  const uniqueVisitorsChange = formatChange(
    calcPercentChange(commonData.uniqueVisitors, previousTotals.uniqueVisitors)
  ); // frequency: group by time buckets using date_trunc
  // Note: bucketFormat is a string like 'hour', 'day', 'month'

  const frequency = await db
    .select({
      time: sql.raw(`date_trunc('${bucketFormat}', "timestamp")`),
      totalVisits: sql`count(*)`,
      uniqueVisitors: sql`count(distinct ${analyticsEvents.visitorId})`,
    })
    .from(analyticsEvents)
    .where(and(...conditionsCurrent))
    .groupBy(sql.raw(`date_trunc('${bucketFormat}', "timestamp")`))
    .orderBy(sql.raw(`date_trunc('${bucketFormat}', "timestamp")`));

  let formatOptions: Intl.DateTimeFormatOptions;

  switch (bucketFormat) {
    case "second":
      formatOptions = {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      break;
    case "minute":
      formatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
      break;
    case "hour":
      formatOptions = { hour: "numeric", hour12: true };
      break;
    case "day":
      formatOptions = { month: "short", day: "numeric" };
      break;
    case "month":
      formatOptions = { month: "short", year: "2-digit" };
      break;
    default:
      formatOptions = { month: "short", day: "numeric" };
  }

  const formatter = new Intl.DateTimeFormat("en-US", formatOptions);

  const formattedFrequency = frequency.map((item) => ({
    time: formatter.format(new Date(item.time as string | Date)),
    totalVisits: Number(item.totalVisits),
    uniqueVisitors: Number(item.uniqueVisitors),
  }));

  return c.json({
    success: true,
    message: "Analytics fetched successfully",
    data: {
      url: project.url,
      onlineVisitors,
      name: project.name,
      filter,
      eventType,
      ...(eventName ? { eventName } : {}),
      ...commonData,
      totalVisitsChange,
      uniqueVisitorsChange,
      frequency: formattedFrequency,
    },
  });
}

analyticsRoutes.get("/:id", (c) => fetchAnalytics(c));

// Get all available events for a project
analyticsRoutes.get("/:id/events/list", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");

  if (!isValidUUID.safeParse(projectId).success) {
    return c.json(
      {
        error: "Invalid project ID",
        data: null,
        success: false,
        message: "The provided project ID is not a valid UUID",
      },
      400
    );
  }

  if (!(await getProjectMembership(projectId, currentUser!.uuid))) {
    return c.json(
      {
        error: "Forbidden",
        data: null,
        message: "You do not have access to this project",
        success: false,
      },
      403
    );
  }

  const sortBy = (c.req.query("sortBy") || "popularity").toLowerCase();
  
  // Get all unique events with their counts
  const events = await db
    .select({
      eventType: analyticsEvents.eventType,
      eventName: analyticsEvents.eventName,
      count: sql`count(*)`,
      uniqueVisitors: sql`count(distinct ${analyticsEvents.visitorId})`,
      lastSeen: sql`max(${analyticsEvents.timestamp})`,
      firstSeen: sql`min(${analyticsEvents.timestamp})`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.projectId, projectId),
        isNotNull(analyticsEvents.eventName)
      )
    )
    .groupBy(analyticsEvents.eventType, analyticsEvents.eventName)
    .orderBy(
      sortBy === "recent"
        ? desc(sql`max(${analyticsEvents.timestamp})`)
        : desc(sql`count(*)`)
    )
    .limit(100);

  const formattedEvents = events.map((event) => ({
    eventType: event.eventType,
    eventName: event.eventName,
    count: Number(event.count),
    uniqueVisitors: Number(event.uniqueVisitors),
    lastSeen: event.lastSeen,
    firstSeen: event.firstSeen,
  }));

  return c.json({
    success: true,
    message: "Events fetched successfully",
    data: {
      events: formattedEvents,
      total: formattedEvents.length,
    },
  });
});

export default analyticsRoutes;
