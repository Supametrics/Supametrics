import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Bell } from "lucide-react";
import AddNewDropdown from "@/components/add-new-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex justify-end w-full pr-4 gap-2">
            <ThemeToggle />
            <Link href="/notifications">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
            <AddNewDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
