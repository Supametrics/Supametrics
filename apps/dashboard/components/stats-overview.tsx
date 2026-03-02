"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Users, FileText, Folder } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { useStats } from "@/hooks/use-stats";
import { getTrend } from "@/lib/get-trend";

export const StatsOverview = () => {
  const { getUserStats } = useStats();
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const data = await getUserStats();
      setStats(data);
    }
    fetchStats();
  }, [getUserStats]);

  const isLoading = !stats;

  const cards = [
    {
      title: "Total Visitors",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      value: (stats?.data?.totalVisitors ?? "0").toLocaleString(),
      subtitle: (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {(() => {
            const { trend, className, label } = getTrend(
              stats?.data?.totalVisitorsThisWeek?.change,
            );

            if (trend === "neutral") {
              return <span>{label}</span>;
            }

            return (
              <>
                {trend === "uptrend" && (
                  <ArrowUpRight className={`h-3 w-3 ${className}`} />
                )}
                {trend === "downtrend" && (
                  <ArrowUpRight className={`h-3 w-3 rotate-180 ${className}`} />
                )}
                {stats?.data?.totalVisitorsThisWeek?.change} this week
              </>
            );
          })()}
        </p>
      ),
    },
    {
      title: "Reports",
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      value: stats?.data?.totalReports,
      subtitle: <p className="text-xs text-muted-foreground">This week</p>,
    },
    {
      title: "Projects",
      icon: <Folder className="h-4 w-4 text-muted-foreground" />,
      value: stats?.data?.totalProjects,
      subtitle: <p className="text-xs text-muted-foreground">All active</p>,
    },
  ];

  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(isLoading ? Array(3).fill(null) : cards).map((card, index) => (
          <div
            key={card?.title ?? index}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {isLoading ? (
              <Card className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-4 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-7 w-16 bg-muted rounded mb-2" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  {card.subtitle}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
