"use client";

import { useSession } from "@/store/use-session";
import * as React from "react";
import {
  BookOpen,
  Sparkle,
  LayoutDashboard,
  LifeBuoy,
  Settings2,
  Activity,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "@repo/ui/components/ui/logo";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useSession();

  const personalWorkspace = {
    uuid: "personal",
    name: "My Workspace",
    logo: {
      src: `https://avatar.idolo.dev/${user?.email}`,
      alt: "My Workspace",
    },
    subscriptionType: user?.subscriptionType ?? "free",
    isPersonal: true,
  };

  const mappedTeams =
    user?.teams?.map((t) => {
      const team = t.team;
      return {
        uuid: team.uuid,
        name: team.name,
        logo: {
          src: `https://avatar.idolo.dev/${team.uuid}`,
          alt: team.name,
        },
        subscriptionType: user.subscriptionType ?? "free",
        role: t.role,
        isPersonal: false,
      };
    }) ?? [];

  const data = {
    user: {
      name: user?.name ?? "--",
      email: user?.email ?? "--",
      avatar: `https://avatar.vercel.sh/${user?.email ?? "placeholder"}`,
    },
    teams: [personalWorkspace, ...mappedTeams],
    navLinks: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Activity", url: "/activity", icon: Activity },
      { title: "AI", url: "/ai", icon: Sparkle },
      { title: "Support", url: "mailto:hello@idolo.dev", icon: LifeBuoy },
    ],
    navMain: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          { title: "General", url: "/settings#general" },
          { title: "Team", url: "/settings#teams" },
          { title: "Billing", url: "/settings#billing" },
        ],
      },
      {
        title: "Documentation",
        url: "/docs",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "https://supametricsdocs.vercel.app/docs/introduction",
          },
          {
            title: "Installations",
            url: "https://supametricsdocs.vercel.app/docs/introduction/installation",
          },
          { title: "Setup", url: "/docs/introduction/setup" },
          {
            title: "Viewing Analytics",
            url: "https://supametricsdocs.vercel.app/docs/introduction/viewanalytics",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="w-full p-2 my-1 group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>
        <div className="hidden w-full p-2 my-1 group-data-[collapsible=icon]:block">
          <Logo showText={false} />
        </div>
        <TeamSwitcher teams={data.teams} isLoading={isLoading} />
      </SidebarHeader>

      <SidebarContent className="!font-medium">
        <NavMain
          navLinks={data.navLinks}
          navMain={data.navMain}
          isLoading={isLoading}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} isLoading={isLoading} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
