"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Eye, Activity } from "lucide-react";

export type EventType = "pageview" | "custom";

interface EventTypeSelectorProps {
  selected: EventType;
  onChange: (type: EventType) => void;
}

const eventTypes: { type: EventType; label: string; icon: React.ReactNode }[] = [
  { type: "pageview", label: "Page Views", icon: <Eye className="h-4 w-4" /> },
  { type: "custom", label: "Custom Events", icon: <Activity className="h-4 w-4" /> },
];

export function EventTypeSelector({ selected, onChange }: EventTypeSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {eventTypes.map((event) => (
        <Button
          key={event.type}
          variant={selected === event.type ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(event.type)}
          className={cn(
            "gap-2 transition-all",
            selected === event.type && "shadow-sm"
          )}
        >
          {event.icon}
          <span className="hidden sm:inline">{event.label}</span>
        </Button>
      ))}
    </div>
  );
}
