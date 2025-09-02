import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardClient } from '@/components/dashboard/client';
import { DashboardNav } from '@/components/dashboard/nav';
import { Logo } from '@/components/dashboard/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <Logo />
            <h1 className="font-headline font-semibold text-lg tracking-tight text-foreground hidden sm:inline">
              FinBoard
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col">
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8">
            <DashboardClient />
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
