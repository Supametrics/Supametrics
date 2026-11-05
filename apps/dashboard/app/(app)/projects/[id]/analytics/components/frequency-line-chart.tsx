"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { FrequencyFilterSelector } from "./frequency-filter-selector";
import { useAnalyticsStore } from "@/store/use-analytics-store";

type FrequencyItem = {
  time: string;
  totalVisits: number;
  uniqueVisitors: number;
};

type GroupedFrequencySeries = {
  name: string;
  data: FrequencyItem[];
};

type FrequencyLineChartProps = {
  frequency: FrequencyItem[] | GroupedFrequencySeries[];
  loading: boolean;
};

// Generate distinct colors for multiple series
const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#a855f7", // purple
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function FrequencyLineChart({
  frequency,
  loading,
}: FrequencyLineChartProps) {
  const { frequencyFilter } = useAnalyticsStore();

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-[220px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Determine if data is grouped or simple
  const isGrouped = frequency.length > 0 && "name" in frequency[0];

  // Check if data exists and has valid values
  let hasData = false;
  let chartData: any[] = [];
  let seriesKeys: string[] = [];

  if (isGrouped) {
    // Grouped data format
    const groupedFrequency = frequency as GroupedFrequencySeries[];

    // Check if there's any non-zero data
    hasData = groupedFrequency.some((series) =>
      series.data.some(
        (item) => (item.totalVisits || 0) > 0 || (item.uniqueVisitors || 0) > 0,
      ),
    );

    if (hasData) {
      // Transform grouped data into chart format
      // Create a map of time -> { time, [seriesName]: value }
      const timeMap = new Map<string, any>();

      groupedFrequency.forEach((series) => {
        series.data.forEach((item) => {
          if (!timeMap.has(item.time)) {
            timeMap.set(item.time, { time: item.time });
          }
          const entry = timeMap.get(item.time);
          if (entry) {
            entry[`${series.name}_visits`] = item.totalVisits;
            entry[`${series.name}_visitors`] = item.uniqueVisitors;
          }
        });
      });

      chartData = Array.from(timeMap.values()).sort((a, b) =>
        a.time.localeCompare(b.time),
      );

      // Extract series keys for rendering lines
      seriesKeys = groupedFrequency.map((s) => s.name);
    }
  } else {
    // Simple data format
    const simpleFrequency = frequency as FrequencyItem[];
    hasData =
      simpleFrequency.length > 0 &&
      simpleFrequency.some(
        (item) => (item.totalVisits || 0) > 0 || (item.uniqueVisitors || 0) > 0,
      );

    if (hasData) {
      chartData = simpleFrequency;
    }
  }

  // If no data, show empty state
  if (!hasData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            Activity Over Time
          </CardTitle>
          <FrequencyFilterSelector />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] border border-dashed rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No activity data available
              </p>
              <p className="text-xs text-muted-foreground">
                Data will appear here once events are tracked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Activity Over Time
        </CardTitle>
        <FrequencyFilterSelector />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="stroke-muted"
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "currentColor" }}
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "currentColor" }}
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
              }}
              iconType="line"
            />

            {isGrouped ? (
              // Render multiple lines for grouped data
              <>
                {seriesKeys.map((seriesName, index) => (
                  <React.Fragment key={seriesName}>
                    <Line
                      name={`${seriesName} (Visits)`}
                      dataKey={`${seriesName}_visits`}
                      type="linear"
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                    <Line
                      name={`${seriesName} (Visitors)`}
                      dataKey={`${seriesName}_visitors`}
                      type="linear"
                      stroke={CHART_COLORS[(index + 1) % CHART_COLORS.length]}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  </React.Fragment>
                ))}
              </>
            ) : (
              // Render default two lines for simple data
              <>
                <Line
                  name="Total Visits"
                  dataKey="totalVisits"
                  type="linear"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />

                <Line
                  name="Unique Visitors"
                  dataKey="uniqueVisitors"
                  type="linear"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
