import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { CountForm } from "./count-form";

export default function CountStationPage({
  params,
}: {
  params: { slug: string; stationId: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;
  const stationName = decodeURIComponent(params.stationId);
  const station = seed.stations.find((s) => s.name === stationName);
  if (!station) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <CountForm
        restaurantSlug={restaurant.slug}
        restaurantAccent={restaurant.accentHex}
        station={station}
      />
    </div>
  );
}
