import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { ReviewForm } from "./review-form";

export default function ReviewPage({
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
      <ReviewForm
        restaurantSlug={restaurant.slug}
        restaurantShortName={restaurant.shortName}
        station={station}
      />
    </div>
  );
}
