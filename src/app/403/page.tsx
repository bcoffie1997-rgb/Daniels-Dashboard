import Link from "next/link";
import { Brandmark } from "@/components/brand/brandmark";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Brandmark size={64} color="cream" className="mb-6" />
      <h1 className="font-display text-display-lg text-foreground">
        You don&apos;t have access
      </h1>
      <p className="mt-3 max-w-sm text-body text-muted-foreground">
        This area is reserved for a different role. If you think that&apos;s a
        mistake, ask a manager to update your access.
      </p>
      <Link
        href="/login"
        className="mt-8 text-body text-accent underline-offset-4 hover:underline"
      >
        Return to sign in
      </Link>
    </main>
  );
}
