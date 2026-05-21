"use client";

import { useMemo } from "react";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";

export default function AdminStationsPage() {
  const stationList = useMockStore((s) => s.stations);
  const items = useMockStore((s) => s.items);
  const stations = useMemo(
    () => [...stationList].sort((a, b) => a.sort_order - b.sort_order),
    [stationList],
  );

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Stations group items in physical walk order. Edit and reorder are wired
        up in the catalog sprint.
      </p>
      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {stations.map((st) => {
            const count = items.filter(
              (i) => i.station_id === st.id && i.active,
            ).length;
            return (
              <li
                key={st.id}
                className="flex items-center justify-between gap-3 px-4 py-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-foreground">
                    {st.name}
                  </p>
                  <p className="caption mt-1 text-muted-foreground">
                    Sort order: {st.sort_order} · {count} items
                  </p>
                </div>
                <span
                  className={`caption rounded-md border px-2 py-0.5 ${
                    st.active
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {st.active ? "Active" : "Archived"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
