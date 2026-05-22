import { notFound } from "next/navigation";
import { getRestaurant } from "@/lib/restaurants";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar, MobileSidebarTrigger } from "@/components/app-sidebar";

export default function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <div className="flex">
        <AppSidebar slug={restaurant.slug} />
        <div className="flex-1 min-w-0">
          <div className="lg:hidden px-4 py-2 border-b border-border">
            <MobileSidebarTrigger activeLabel={restaurant.shortName} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
