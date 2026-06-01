"use client";
import { use } from "react";
import { Header } from "./components/header";
import { useAnalytics } from "@/hooks/use-analytics";
import MetricsGrid from "./components/metrics-grid";
import { StatCard } from "./components/stat-card";
import { FrequencyLineChart } from "./components/frequency-line-chart";
import { SummaryCard } from "./components/summary-card";
import { Grid } from "./components/grid";
import { cleanUrl, formatDuration } from "@repo/ui/lib/utils";
import { Error } from "@/components/error";
import { UnifiedEventSelector } from "./components/unified-event-selector";
import { useAnalyticsStore } from "@/store/use-analytics-store";

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const projectId = use(params);
  const { data, isLoading, error } = useAnalytics(projectId.id);
  const { selectedEvent, setSelectedEvent } = useAnalyticsStore();

  if (error) return <Error description="Failed to fetch analytics" />;

  // Dynamic labels based on selected event
  const getEventLabel = () => {
    if (selectedEvent === "pageview") {
      return { visits: "Total Visits", visitors: "Unique Visitors" };
    }
    return { visits: "Total Events", visitors: "Unique Users" };
  };

  const labels = getEventLabel();

  return (
    <div>
      <Header
        title={`${data?.name} Analytics`}
        url={data?.url}
        loading={isLoading}
        id={projectId.id}
        onlineVisitors={data?.onlineVisitors}
      />

      <main className="py-7 md:py-8 px-5 space-y-6 flex flex-col">
        {/* Unified Event Selector */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Event</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              View analytics for specific events
            </p>
          </div>
          <UnifiedEventSelector
            projectId={projectId.id}
            selectedValue={selectedEvent}
            onValueChange={setSelectedEvent}
          />
        </div>

        <MetricsGrid>
          <StatCard
            title={labels.visits}
            value={data?.totalVisits ?? 0}
            loading={isLoading}
            change={
              data?.totalVisitsChange
                ? parseFloat(data.totalVisitsChange)
                : null
            }
          />
          <StatCard
            title={labels.visitors}
            value={data?.uniqueVisitors ?? 0}
            loading={isLoading}
            change={
              data?.uniqueVisitorsChange
                ? parseFloat(data.uniqueVisitorsChange)
                : null
            }
          />
          <StatCard
            title="Avg Session Duration"
            value={formatDuration(data?.avgDuration ?? 0)}
            loading={isLoading}
          />
          <StatCard
            title="Total Sessions"
            value={data?.totalSessions ?? 0}
            loading={isLoading}
          />
        </MetricsGrid>

        <FrequencyLineChart
          frequency={data?.frequency ?? []}
          loading={isLoading}
        />

        <Grid columns={2} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="Browsers"
            loading={isLoading}
            data={
              data?.browserSummary?.map((b) => ({
                label: String(b.browser_name ?? "Unknown"),
                count: Number(b.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Devices"
            loading={isLoading}
            data={
              data?.deviceSummary?.map((d) => ({
                label: String(d.device_type ?? "Unknown"),
                count: Number(d.count ?? 0),
              })) ?? []
            }
          />
        </Grid>

        <Grid columns={2} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="OS"
            loading={isLoading}
            data={
              data?.osSummary?.map((o) => ({
                label: String(o.os_name ?? "Unknown"),
                count: Number(o.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top Referrers"
            loading={isLoading}
            data={
              data?.topReferrers?.map((r) => ({
                label: cleanUrl(String(r.referrer ?? "Unknown")),
                count: Number(r.count ?? 0),
              })) ?? []
            }
          />
        </Grid>

        <Grid columns={3} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="Top Countries"
            loading={isLoading}
            data={
              data?.topCountries?.map((o) => ({
                label: String(o.country ?? "Unknown"),
                count: Number(o.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top Cities"
            loading={isLoading}
            data={
              data?.topCities?.map((r) => ({
                label: String(r.city ?? "Unknown"),
                count: Number(r.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top Durations"
            loading={isLoading}
            data={
              data?.topDurations?.map((d) => ({
                label: formatDuration(Number(d.duration ?? 0)),
                count: Number(d.count ?? 0),
              })) ?? []
            }
          />
        </Grid>

        <Grid columns={3} gap="gap-2" gapSm="gap-4" gapMd="gap-6" gapLg="gap-8">
          <SummaryCard
            title="Top Hostnames"
            loading={isLoading}
            data={
              data?.topHostnames?.map((h) => ({
                label: String(h.hostname ?? "Unknown"),
                count: Number(h.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top Paths"
            loading={isLoading}
            data={
              data?.topPaths?.map((p) => ({
                label: String(p.pathname ?? "Unknown"),
                count: Number(p.count ?? 0),
              })) ?? []
            }
          />
          <SummaryCard
            title="Top UTM Sources"
            loading={isLoading}
            data={
              data?.topUtmSources?.map((u) => ({
                label: String(u.utm_source ?? "Unknown"),
                count: Number(u.count ?? 0),
              })) ?? []
            }
          />
        </Grid>
      </main>
    </div>
  );
}
