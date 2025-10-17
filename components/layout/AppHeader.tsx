"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/layout/UserMenu";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-full items-center gap-4 px-4">
        <SidebarTrigger />
        
        <div className="flex-1" />
        
        <UserMenu />
      </div>
    </header>
  );
}
