export const metadata = {
  title: "Dashboard - Supametrics",
  description: "Overview of your projects and stats",
};

import { ProjectsCard } from "@/components/projects-card";
import { StatsOverview } from "@/components/stats-overview";

export default function Page() {
  return (
    <div className="flex flex-col gap-12 p-8 md:p-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Monitor your projects and track key metrics
        </p>
      </div>

      <StatsOverview />

      <ProjectsCard />
    </div>
  );
}
