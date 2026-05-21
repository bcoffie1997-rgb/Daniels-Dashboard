import { Brandmark } from "@/components/brand/brandmark";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Brandmark size={88} color="cream" className="mb-8" />
      <h1 className="font-display text-display-2xl text-foreground">Mise</h1>
      <p className="caption mt-4 text-muted-foreground">
        Inventory for Daniel&apos;s
      </p>
      <p className="mt-10 text-body text-muted-foreground">Coming soon.</p>
    </main>
  );
}
