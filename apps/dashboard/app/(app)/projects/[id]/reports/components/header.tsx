"use client";

import { useSession } from "@/store/use-session";
import { Button } from "@repo/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cleanUrl } from "@repo/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title: string;
  url?: string;
  totalReports?: number;
  loading: boolean;
  id: string;
}

export const Header = ({
  title,
  loading,
  url,
  totalReports,
  id,
}: HeaderProps) => {
  const { user } = useSession();

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
                  src={`https://icons.duckduckgo.com/ip3/${
                    (cleanUrl(url || "https://supametrics.vercel.app"), false)
                  }.ico`}
                  className="w-3 h-3 rounded-sm"
                  width={16}
                  height={16}
                  alt="Favicon"
                />
              )}

              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                cleanUrl(url || "https://example.com")
              )}
            </div>
            |
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `${totalReports ?? 0} reports`
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">&#x22EF;</Button>
            </PopoverTrigger>
            <PopoverContent className="font-normal flex space-y-1 flex-col">
              <Link
                href={`/projects/${id}/analytics`}
                className="hover:bg-accent p-1"
              >
                View Analytics
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
            </PopoverContent>
          </Popover>
        </div>
      </header>
    </div>
  );
};
