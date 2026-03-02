"use client";

import { useSession } from "@/store/use-session";
import { useAnalyticsStore } from "@/store/use-analytics-store";
import { Button } from "@repo/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cleanUrl, cn } from "@repo/ui/lib/utils";
import type { Timerange } from "@repo/ui/types";
import { LockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title: string;
  url?: string;
  onlineVisitors?: number;
  loading: boolean;
  id: string;
}

export const Header = ({
  title,
  loading,
  url,
  onlineVisitors,
  id,
}: HeaderProps) => {
  const filters: { timerange: Timerange; label: string }[] = [
    { timerange: "5mins", label: "Last 5 minutes" },
    { timerange: "today", label: "Today" },
    { timerange: "yesterday", label: "Yesterday" },
    { timerange: "thisweek", label: "This week" },
    { timerange: "thismonth", label: "This month" },
    { timerange: "thisyear", label: "This year" },
    { timerange: "last3years", label: "Last 3 years" },
  ];

  const { user } = useSession();

  const { filter, setFilter } = useAnalyticsStore();

  return (
    <div>
      <header className="border-b border-border py-7 md:py-8 flex_between px-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium">
            {loading ? <Skeleton className="h-6 w-48" /> : title}
          </h2>
          <div className="text-sm text-neutral-500 flex items-center gap-2.5">
            <div className="truncate flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <Image
                  src={`https://icons.duckduckgo.com/ip3/${cleanUrl(
                    url || "https://supametrics.vercel.app",
                    false,
                  )}.ico`}
                  className="w-3 h-3 rounded-sm"
                  width={16}
                  height={16}
                  alt="Favicon"
                />
              )}

              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={url}
                  className="truncate"
                >
                  {cleanUrl(url || "https://example.com")}
                </a>
              )}
            </div>
            |
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  onlineVisitors && onlineVisitors > 0
                    ? "bg-green-500"
                    : "bg-gray-400",
                )}
              />
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `${onlineVisitors ?? 0} online`
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger style={{ width: "180px" }}>
              <SelectValue placeholder="Select timerange" />
            </SelectTrigger>
            <SelectContent>
              {filters.map((f) => {
                const isLocked =
                  ["thisyear", "last3years"].includes(f.timerange) &&
                  user?.subscriptionType === "free";
                return (
                  <SelectItem
                    key={f.timerange}
                    value={f.timerange}
                    disabled={isLocked}
                  >
                    {f.label}
                    {isLocked && <LockIcon />}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">&#x22EF;</Button>
            </PopoverTrigger>
            <PopoverContent className="font-normal flex space-y-1 flex-col">
              <Link
                href={`/projects/${id}/reports`}
                className="hover:bg-accent p-1"
              >
                View Reports
              </Link>
              <Link
                href={`/projects/${id}/settings`}
                className="hover:bg-accent p-1"
              >
                Project Settings
              </Link>

              {user?.subscriptionType === "free" && (
                <Link href="/settings#billing" className="hover:bg-accent p-1">
                  Upgrade to Pro
                </Link>
              )}
              <Link href="/docs/introduction" className="hover:bg-accent p-1">
                Go to Docs{" "}
              </Link>
            </PopoverContent>
          </Popover>
        </div>
      </header>
    </div>
  );
};
