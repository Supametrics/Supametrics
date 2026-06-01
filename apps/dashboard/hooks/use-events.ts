import axiosFetch from "@repo/ui/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface EventItem {
  eventType: string;
  eventName: string;
  count: number;
  uniqueVisitors: number;
  lastSeen: string;
  firstSeen: string;
}

interface EventsResponse {
  events: EventItem[];
  total: number;
}

export const useEvents = (projectId: string, sortBy: "popularity" | "recent" = "popularity") => {
  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ["events", projectId, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("sortBy", sortBy);

      const { data: res } = await axiosFetch(
        `analytics/${projectId}/events/list?${params.toString()}`
      );
      return res.data;
    },
    enabled: !!projectId,
  });

  return { data, isLoading, error };
};
