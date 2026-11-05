"use client";

import { useAnalyticsStore, type FilterDimension } from "@/store/use-analytics-store";
import { X } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";

const dimensionLabels: Record<keyof FilterDimension, string> = {
  browser: "Browser",
  device: "Device",
  os: "OS",
  country: "Country",
  city: "City",
  pathname: "Path",
  referrer: "Referrer",
};

export function ActiveFilters() {
  const { activeFilters, clearFilter, clearFilters } = useAnalyticsStore();

  // Get array of active filters
  const activeFilterEntries = Object.entries(activeFilters).filter(
    ([_, value]) => value !== undefined
  ) as [keyof FilterDimension, string][];

  // If no filters, don't render anything
  if (activeFilterEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">
        Active filters:
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {activeFilterEntries.map(([dimension, value]) => (
          <Badge
            key={dimension}
            variant="secondary"
            className="pl-3 pr-2 py-1.5 gap-2 text-sm"
          >
            <span className="font-medium">{dimensionLabels[dimension]}:</span>
            <span className="font-normal">{value}</span>
            <button
              onClick={() => clearFilter(dimension)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
              aria-label={`Remove ${dimension} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {activeFilterEntries.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
