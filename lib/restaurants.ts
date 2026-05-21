export type RestaurantSlug = "miami" | "fort-lauderdale" | "ds-sports";

export type Restaurant = {
  slug: RestaurantSlug;
  name: string;
  shortName: string;
  city: string;
  address: string;
  phone: string;
  concept: string;
  accent: "miami" | "ftl" | "ds";
  accentHex: string;
  accentDeepHex: string;
  website: string;
};

export const RESTAURANTS: Restaurant[] = [
  {
    slug: "miami",
    name: "Daniel's Miami",
    shortName: "Miami",
    city: "Coral Gables, FL",
    address: "Former Fiola Miami space, Coral Gables",
    phone: "—",
    concept: "Refined steakhouse · caviar program · raw bar · Italian-leaning",
    accent: "miami",
    accentHex: "#E78F8E",
    accentDeepHex: "#9C3F3D",
    website: "https://www.danielssteak.com/miami/",
  },
  {
    slug: "fort-lauderdale",
    name: "Daniel's, A Florida Steakhouse",
    shortName: "Fort Lauderdale",
    city: "Fort Lauderdale, FL",
    address: "620 S Federal Hwy, Fort Lauderdale, FL 33301",
    phone: "(954) 451-1200",
    concept: "MICHELIN-recommended Florida steakhouse · locally-sourced",
    accent: "ftl",
    accentHex: "#7BA890",
    accentDeepHex: "#004539",
    website: "https://www.danielssteak.com/",
  },
  {
    slug: "ds-sports",
    name: "D's Sports Bar",
    shortName: "D's Sports",
    city: "Fort Lauderdale, FL",
    address: "Adjacent to Daniel's, A Florida Steakhouse",
    phone: "(954) 960-4888",
    concept: "Elevated sports bar · chef-driven game day comfort food",
    accent: "ds",
    accentHex: "#D4A24A",
    accentDeepHex: "#8B2A26",
    website: "https://www.danielssteak.com/fort-lauderdale/ds-sports-bar/",
  },
];

export function getRestaurant(slug: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.slug === slug);
}
