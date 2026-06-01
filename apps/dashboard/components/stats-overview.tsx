"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Users, FileText, Folder, TrendingUp, TrendingDown } from "lucide-react";
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
      icon: <Users className="h-5 w-5" />,
      value: (stats?.data?.totalVisitors ?? "0").toLocaleString(),
      change: stats?.data?.totalVisitorsThisWeek?.change,
      changeLabel: "vs last week",
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      value: stats?.data?.totalReports ?? "0",
      subtitle: "This week",
    },
    {
      title: "Active Projects",
      icon: <Folder className="h-5 w-5" />,
      value: stats?.data?.totalProjects ?? "0",
      subtitle: "Total projects",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(isLoading ? Array(3).fill(null) : cards).map((card, index) => (
          <div
            key={card?.title ?? index}
            className="animate-in fade-in slide-in-from-bottom-2 duration-700"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {isLoading ? (
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-shimmer" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ) : (
              <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-semibold tracking-tight">
                    {card.value}
                  </div>
                  {card.change !== undefined ? (
                    <div className="flex items-center gap-1.5 text-sm">
                      {(() => {
                        const { trend, className } = getTrend(card.change);
                        
                        if (trend === "neutral") {
                          return (
                            <span className="text-muted-foreground">
                              No change {card.changeLabel}
                            </span>
                          );
                        }

                        return (
                          <>
                            {trend === "uptrend" ? (
                              <TrendingUp className={`h-4 w-4 ${className}`} />
                            ) : (
                              <TrendingDown className={`h-4 w-4 ${className}`} />
                            )}
                            <span className={`font-medium ${className}`}>
                              {card.change}
                            </span>
                            <span className="text-muted-foreground">
                              {card.changeLabel}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {card.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
