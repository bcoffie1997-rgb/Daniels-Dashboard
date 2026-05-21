"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useMockStore, selectLastCounted } from "@/lib/mock/store";
import { relativeFromNow } from "@/lib/format";

export default function StationPickerPage() {
  const stations = useMockStore((s) =>
    s.stations
      .filter((st) => st.active)
      .sort((a, b) => a.sort_order - b.sort_order),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6 lg:mb-8">
        <p className="caption text-muted-foreground">Tonight&apos;s count</p>
        <h1 className="mt-1 font-display text-display-lg text-foreground lg:text-display-xl">
          Choose a station
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          Tap the station you&apos;re standing at.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {stations.map((station) => (
          <StationRow key={station.id} stationId={station.id} />
        ))}
      </ul>
    </div>
  );
}

function StationRow({ stationId }: { stationId: string }) {
  const station = useMockStore((s) =>
    s.stations.find((st) => st.id === stationId),
  );
  const last = useMockStore(selectLastCounted(stationId));

  if (!station) return null;

  const subtitle = last
    ? `Last counted by ${last.user?.full_name ?? "—"} · ${relativeFromNow(
        last.session.submitted_at ?? last.session.started_at,
      )}`
    : "No counts yet for this station.";

  return (
    <li>
      <Link
        href={`/count/${station.id}`}
        className="flex min-h-[88px] items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/40 hover:bg-popover"
      >
        <div className="flex-1">
          <p className="text-heading-lg font-medium text-foreground">
            {station.name}
          </p>
          <p className="caption mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </li>
  );
}
