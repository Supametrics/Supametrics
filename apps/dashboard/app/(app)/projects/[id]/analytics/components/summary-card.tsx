"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import ReactCountryFlag from "react-country-flag";
import {
  useAnalyticsStore,
  type FilterDimension,
} from "@/store/use-analytics-store";

export type SummaryItem = {
  label: string;
  count: number;
};

type SummaryCardProps = {
  title: string;
  data: SummaryItem[];
  className?: string;
  maxVisible?: number;
  loading: boolean;
  dimension?: keyof FilterDimension; // Which dimension this card represents
};

export const SummaryCard = ({
  title,
  data,
  className,
  maxVisible = 2,
  loading,
  dimension,
}: SummaryCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const { setDimensionFilter, activeFilters } = useAnalyticsStore();

  const totalCount = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const visibleData = showAll ? data : data.slice(0, maxVisible);

  const isCountryCode = (label: string) => /^[A-Z]{2}$/i.test(label.trim()); // Detect if it's 2-letter country code

  const handleItemClick = (label: string) => {
    if (!dimension || label === "Unknown") return;

    // Toggle filter: if same value is clicked, remove it; otherwise set it
    const currentValue = activeFilters[dimension];
    if (currentValue === label) {
      setDimensionFilter(dimension, undefined);
    } else {
      setDimensionFilter(dimension, label);
    }
  };

  const isActive = (label: string) => {
    return dimension && activeFilters[dimension] === label;
  };

  const renderLabel = (label: string) => {
    if (isCountryCode(label)) {
      return (
        <span className="flex items-center gap-2">
          <ReactCountryFlag
            countryCode={label.toUpperCase()}
            svg
            style={{
              width: "1.25em",
              height: "1.25em",
              borderRadius: "2px",
            }}
          />
          <span>{label}</span>
        </span>
      );
    }
    return label;
  };

  const renderBar = (item: SummaryItem, height: number = 28) => {
    const percentage = (item.count / totalCount) * 100;
    const active = isActive(item.label);
    const clickable = dimension && item.label !== "Unknown";

    return (
      <div
        className={cn("relative mb-2", clickable && "cursor-pointer group")}
        onClick={() => handleItemClick(item.label)}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-sm",
            active ? "bg-main/30" : "bg-main/10",
            clickable && "group-hover:bg-main/20 transition-colors",
          )}
          style={{ height: `${height}px` }}
        >
          <div
            className={cn(
              "relative flex h-full items-center rounded-sm px-2",
              active ? "bg-main" : "bg-main/65",
              clickable && "group-hover:bg-main/80 transition-colors",
            )}
            style={{ width: `${percentage}%` }}
          >
            <p
              className={cn(
                "absolute left-2 z-10 whitespace-nowrap text-xs font-medium",
                active ? "text-white" : "text-primary",
              )}
            >
              {renderLabel(item.label)}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "absolute right-2 top-0 z-20 flex h-full items-center text-xs font-medium",
            active ? "text-main" : "text-gray-900 dark:text-white",
          )}
        >
          {item.count.toLocaleString()}
        </div>
      </div>
    );
  };

  if (loading) return <Skeleton className="!h-10" />;

  return (
    <>
      <Card className={cn("py-4", className)}>
        <CardContent>
          <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <h3>{title}</h3>
            <h3>Visitors</h3>
          </div>

          <ul className="mt-4 min-h-30">
            {visibleData.map((item) => (
              <li key={item.label}>{renderBar(item)}</li>
            ))}
          </ul>

          {data.length > maxVisible && !showAll && (
            <div className="mt-2 text-right">
              <button
                className="text-sm text-main hover:underline"
                onClick={() => setShowAll(true)}
              >
                View More
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAll && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{title} - All Items</h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {data.map((item) => (
                <li key={item.label}>{renderBar(item)}</li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-main text-white rounded hover:bg-purple-700"
                onClick={() => setShowAll(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
