import { create } from "zustand";

import type { Timerange } from "@repo/ui/types";

export type FilterDimension = {
  browser?: string;
  device?: string;
  os?: string;
  country?: string;
  city?: string;
  pathname?: string;
  referrer?: string;
};

interface AnalyticsStore {
  filter: Timerange;
  from?: string;
  to?: string;
  selectedEvent: string; // Format: "pageview" | "custom:all" | "custom:eventName"
  activeFilters: FilterDimension; // Global filters applied to all analytics

  setFilter: (filter: Timerange) => void;
  setRange: (from: string, to: string) => void;
  setSelectedEvent: (value: string) => void;
  setDimensionFilter: (
    dimension: keyof FilterDimension,
    value: string | undefined,
  ) => void;
  clearFilters: () => void;
  clearFilter: (dimension: keyof FilterDimension) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  filter: "today",
  from: undefined,
  to: undefined,
  selectedEvent: "pageview", // Default to page views
  activeFilters: {},

  setFilter: (filter) => set({ filter }),
  setRange: (from, to) => set({ from, to }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

  setDimensionFilter: (dimension, value) =>
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [dimension]: value,
      },
    })),

  clearFilters: () => set({ activeFilters: {} }),

  clearFilter: (dimension) =>
    set((state) => {
      const newFilters = { ...state.activeFilters };
      delete newFilters[dimension];
      return { activeFilters: newFilters };
    }),
}));
