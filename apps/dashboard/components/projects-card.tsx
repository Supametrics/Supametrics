"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import Link from "next/link";
import { Users, Globe, Smartphone, Server, ArrowRight } from "lucide-react";
import FilterDropdown from "@repo/ui/components/ui/filter";
import { useProjects } from "@/hooks/use-projects";
import { NoDataFound } from "./no-data";
import { cleanUrl } from "@repo/ui/lib/utils";
import { Project } from "@repo/ui/types";

const filterOptions = ["Newest", "Oldest"];

const SkeletonCard = () => (
  <Card className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-shimmer" />
    <CardHeader className="pb-3">
      <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="h-4 bg-muted rounded w-full animate-pulse" />
      <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
    </CardContent>
  </Card>
);

export const ProjectsCard = () => {
  const [filter, setFilter] = useState<string[]>(["Newest"]);
  const { projects, loading, hasMore, loadMore, sort, setSort, refresh } =
    useProjects(12);

  // Sync filter with sort
  useEffect(() => {
    const current = filter[0] ?? "Newest";
    const newSort = current === "Newest" ? "newest" : "oldest";

    if (sort !== newSort) {
      setSort(newSort);
      refresh();
    }
  }, [filter, sort, setSort, refresh]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProjectRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]!.isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <FilterDropdown
          multiple={false}
          options={filterOptions}
          defaultValue={["Newest"]}
          onChange={setFilter}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => {
          const isLast = index === projects.length - 1;
          return (
            <div key={project.uuid} ref={isLast ? lastProjectRef : null}>
              <ProjectCard project={project} />
            </div>
          );
        })}

        {loading &&
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {!loading && projects.length === 0 && (
        <NoDataFound message="No projects found" />
      )}
    </section>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  // Calculate days since creation
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const timeAgo = daysSinceCreation === 0 
    ? "Today" 
    : daysSinceCreation === 1 
    ? "Yesterday" 
    : daysSinceCreation < 30 
    ? `${daysSinceCreation}d ago`
    : daysSinceCreation < 365
    ? `${Math.floor(daysSinceCreation / 30)}mo ago`
    : `${Math.floor(daysSinceCreation / 365)}y ago`;

  return (
    <Link
      href={`/projects/${project.uuid}/analytics`}
      className="block group"
      tabIndex={0}
    >
      <Card className="h-full group-hover:shadow-lg group-hover:shadow-primary/5 transition-all duration-300 border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold tracking-tight truncate" title={project.name}>
                {project.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Created {timeAgo}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 flex-shrink-0" />
            <p className="truncate" title={cleanUrl(project.url) ?? "—"}>
              {cleanUrl(project.url) ?? "—"}
            </p>
          </div>

        

          <div className="flex items-center gap-2.5 pt-3 border-t-2 border-border">
            <Users className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">
                {project.visitors?.toLocaleString() ?? 0}
              </span>
              <span className="text-muted-foreground ml-1">visitors</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
