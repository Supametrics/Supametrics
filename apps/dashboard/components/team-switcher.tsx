"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { useWorkspace } from "@/store/use-workspace";
import { TeamLogo } from "./team-logo";

export function TeamSwitcher({
  teams,
  isLoading,
}: {
  teams: {
    uuid: string;
    name: string;
    logo: {
      src: string;
    };
    subscriptionType: string;
    isPersonal?: boolean;
  }[];
  isLoading: boolean;
}) {
  const { isMobile } = useSidebar();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();

  React.useEffect(() => {
    if (teams.length > 0) {
      setActiveWorkspace(teams[0]!);
    }
  }, [teams, setActiveWorkspace]);

  const activeTeam = activeWorkspace ?? teams[0];
  if (!activeTeam) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-7 items-center justify-center rounded-lg">
                <TeamLogo src={activeTeam.logo.src} name={activeTeam.name} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs capitalize">
                  {isLoading ? <Skeleton /> : activeTeam.subscriptionType}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>

            {teams.map((team) => (
              <DropdownMenuItem
                key={team.uuid}
                onClick={() => setActiveWorkspace(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-border">
                  <TeamLogo src={team.logo.src} name={team.name} />
                </div>
                <div className="flex flex-col">
                  <span>{team.name}</span>
                  {team.isPersonal && (
                    <span className="text-muted-foreground text-xs">
                      (Personal)
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border border-border bg-transparent">
                <Plus className="size-4" />
              </div>
              <Link
                href="/new/team"
                className="text-muted-foreground font-medium"
              >
                Add team
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
