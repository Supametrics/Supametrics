import { create } from "zustand";

import type { Timerange } from "@repo/ui/types";

export type FrequencyFilterDimension =
  | "all"
  | "browser"
  | "device"
  | "os"
  | "country"
  | "city"
  | "pathname"
  | "referrer";

interface AnalyticsStore {
  filter: Timerange;
  from?: string;
  to?: string;
  selectedEvent: string; // Format: "pageview" | "custom:all" | "custom:eventName"
  frequencyFilter: FrequencyFilterDimension; // Dimension to filter frequency chart by

  setFilter: (filter: Timerange) => void;
  setRange: (from: string, to: string) => void;
  setSelectedEvent: (value: string) => void;
  setFrequencyFilter: (dimension: FrequencyFilterDimension) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  filter: "today",
  from: undefined,
  to: undefined,
  selectedEvent: "pageview", // Default to page views
  frequencyFilter: "all", // Default to no filtering

  setFilter: (filter) => set({ filter }),
  setRange: (from, to) => set({ from, to }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setFrequencyFilter: (frequencyFilter) => set({ frequencyFilter }),
}));
