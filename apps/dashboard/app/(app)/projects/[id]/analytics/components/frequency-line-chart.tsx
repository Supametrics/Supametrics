"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

type FrequencyItem = {
  time: string;
  totalVisits: number;
  uniqueVisitors: number;
};

type FrequencyLineChartProps = {
  frequency: FrequencyItem[];
  loading: boolean;
};

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
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{entry.value}</span>
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
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Check if data exists and has valid values
  const hasData = frequency && frequency.length > 0;
  const hasNonZeroData = hasData && 
    frequency.some(item => (item.totalVisits || 0) > 0 || (item.uniqueVisitors || 0) > 0);

  // If no data, show empty state
  if (!hasData || !hasNonZeroData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] border border-dashed rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">No activity data available</p>
              <p className="text-xs text-muted-foreground">Data will appear here once events are tracked</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Activity Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={frequency}
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
            
            <Tooltip
              content={<CustomTooltip />}
            />
            
            <Legend 
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
              }}
              iconType="line"
            />
            
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
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
