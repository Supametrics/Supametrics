"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useAnalyticsStore, type FrequencyFilterDimension } from "@/store/use-analytics-store";
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  MapPin, 
  FileText, 
  Link,
  LayoutGrid 
} from "lucide-react";

const filterOptions: Array<{
  value: FrequencyFilterDimension;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: "all",
    label: "All Activity",
    icon: LayoutGrid,
    description: "View overall activity",
  },
  {
    value: "browser",
    label: "By Browser",
    icon: Monitor,
    description: "Group by browser type",
  },
  {
    value: "device",
    label: "By Device",
    icon: Smartphone,
    description: "Group by device type",
  },
  {
    value: "os",
    label: "By OS",
    icon: Monitor,
    description: "Group by operating system",
  },
  {
    value: "country",
    label: "By Country",
    icon: Globe,
    description: "Group by country",
  },
  {
    value: "city",
    label: "By City",
    icon: MapPin,
    description: "Group by city",
  },
  {
    value: "pathname",
    label: "By Path",
    icon: FileText,
    description: "Group by page path",
  },
  {
    value: "referrer",
    label: "By Referrer",
    icon: Link,
    description: "Group by referrer source",
  },
];

export function FrequencyFilterSelector() {
  const { frequencyFilter, setFrequencyFilter } = useAnalyticsStore();

  const selectedOption = filterOptions.find(
    (option) => option.value === frequencyFilter
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Group by:
      </span>
      <Select
        value={frequencyFilter}
        onValueChange={(value) => setFrequencyFilter(value as FrequencyFilterDimension)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {selectedOption && (
              <div className="flex items-center gap-2">
                <selectedOption.icon className="h-4 w-4" />
                <span>{selectedOption.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
