"use client";

import { useEvents } from "@/hooks/use-events";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Eye, Activity, TrendingUp } from "lucide-react";

interface UnifiedEventSelectorProps {
  projectId: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export function UnifiedEventSelector({
  projectId,
  selectedValue,
  onValueChange,
}: UnifiedEventSelectorProps) {
  const { data, isLoading } = useEvents(projectId, "popularity");

  if (isLoading) {
    return <Skeleton className="h-10 w-[240px]" />;
  }

  const customEvents = data?.events.filter((e) => e.eventType !== "pageview") || [];

  // Get display name for selected value
  const getDisplayName = () => {
    if (selectedValue === "pageview") return "Page Views";
    if (selectedValue === "custom:all") return "All Custom Events";
    const event = customEvents.find((e) => `custom:${e.eventName}` === selectedValue);
    return event?.eventName || "Select event";
  };

  return (
    <Select value={selectedValue} onValueChange={onValueChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            {selectedValue === "pageview" ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            <span>{getDisplayName()}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Default Events</SelectLabel>
          <SelectItem value="pageview">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Page Views</span>
            </div>
          </SelectItem>
        </SelectGroup>

        {customEvents.length > 0 && (
          <SelectGroup>
            <SelectLabel>Custom Events</SelectLabel>
            <SelectItem value="custom:all">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>All Custom Events</span>
              </div>
            </SelectItem>
            {customEvents.slice(0, 10).map((event) => (
              <SelectItem key={event.eventName} value={`custom:${event.eventName}`}>
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Activity className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.eventName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <TrendingUp className="h-3 w-3" />
                    {event.count.toLocaleString()}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
