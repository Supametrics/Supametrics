import { create } from "zustand";

import type { Timerange } from "@repo/ui/types";

interface AnalyticsStore {
  filter: Timerange;
  from?: string;
  to?: string;
  selectedEvent: string; // Format: "pageview" | "custom:all" | "custom:eventName"

  setFilter: (filter: Timerange) => void;
  setRange: (from: string, to: string) => void;
  setSelectedEvent: (value: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  filter: "today",
  from: undefined,
  to: undefined,
  selectedEvent: "pageview", // Default to page views

  setFilter: (filter) => set({ filter }),
  setRange: (from, to) => set({ from, to }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
}));
