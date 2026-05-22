import { SiteHeader } from "@/components/site-header";
import { AdminSidebar } from "@/components/app-sidebar";
import { MobileSidebarTrigger } from "@/components/app-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="h-1 w-full" style={{ backgroundColor: "#C9A86B" }} />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <div className="lg:hidden px-4 py-2 border-b border-border">
            <MobileSidebarTrigger activeLabel="Group · admin" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
