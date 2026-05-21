"use client";

import { useState } from "react";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminItemsPage() {
  const stations = useMockStore((s) =>
    [...s.stations].sort((a, b) => a.sort_order - b.sort_order),
  );
  const items = useMockStore((s) => s.items);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");

  const filtered = items
    .filter((i) => i.station_id === stationId)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Items by station, in walk order. Bulk import and inline editing arrive
        in the catalog sprint.
      </p>

      <div className="mb-4 max-w-xs">
        <Select
          value={stationId}
          onValueChange={(v) => v && setStationId(v)}
        >
          <SelectTrigger className="border-border bg-card">
            <SelectValue placeholder="Choose a station" />
          </SelectTrigger>
          <SelectContent>
            {stations.map((st) => (
              <SelectItem key={st.id} value={st.id}>
                {st.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-body text-foreground">
                  {item.name}
                </p>
                <p className="caption mt-0.5 text-muted-foreground">
                  Sort: {item.sort_order} · Unit: {item.unit}
                </p>
              </div>
              <span className="tabular font-mono text-body text-muted-foreground">
                {item.par_level !== null
                  ? `Par ${item.par_level} ${item.unit}`
                  : "—"}
              </span>
              <span
                className={`caption rounded-md border px-2 py-0.5 ${
                  item.active
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {item.active ? "Active" : "Archived"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
