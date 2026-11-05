import axiosFetch from "@repo/ui/lib/axios";
import { Analytics } from "@repo/ui/types";
import { useQuery } from "@tanstack/react-query";
import { useAnalyticsStore } from "@/store/use-analytics-store";

export const useAnalytics = (projectId: string) => {
  const { filter, from, to, selectedEvent, activeFilters } =
    useAnalyticsStore();

  const { data, isLoading, error } = useQuery<Analytics>({
    queryKey: [
      "analytics",
      projectId,
      filter,
      from,
      to,
      selectedEvent,
      activeFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("filter", filter);

      // Parse selectedEvent to determine eventType and eventName
      if (selectedEvent === "pageview") {
        params.append("eventType", "pageview");
      } else if (selectedEvent === "custom:all") {
        params.append("eventType", "custom");
      } else if (selectedEvent.startsWith("custom:")) {
        const eventName = selectedEvent.replace("custom:", "");
        params.append("eventType", "custom");
        params.append("eventName", eventName);
      }

      // Add dimension filters
      if (activeFilters.browser)
        params.append("browser", activeFilters.browser);
      if (activeFilters.device) params.append("device", activeFilters.device);
      if (activeFilters.os) params.append("os", activeFilters.os);
      if (activeFilters.country)
        params.append("country", activeFilters.country);
      if (activeFilters.city) params.append("city", activeFilters.city);
      if (activeFilters.pathname)
        params.append("pathname", activeFilters.pathname);
      if (activeFilters.referrer)
        params.append("referrer", activeFilters.referrer);

      if (from && to) {
        params.append("from", from);
        params.append("to", to);
      }

      const { data: res } = await axiosFetch(
        `analytics/${projectId}?${params.toString()}`,
      );
      return res.data;
    },
    enabled: !!projectId,
  });

  return { data, isLoading, error };
};
