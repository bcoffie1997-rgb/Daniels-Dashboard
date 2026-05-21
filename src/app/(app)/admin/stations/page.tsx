"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Archive, ArchiveRestore } from "lucide-react";
import { isMockMode } from "@/lib/auth/config";
import { useMockStore } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSortableContext } from "@/components/admin/sortable-context";
import { SortableRow } from "@/components/admin/sortable-row";
import {
  createStation,
  updateStation,
  archiveStation,
  reorderStations,
} from "@/app/(admin)/actions";

type Station = Database["public"]["Tables"]["stations"]["Row"];

export default function AdminStationsPage() {
  const isMock = isMockMode();
  const mockStations = useMockStore((s) => s.stations);
  const mockCreateStation = useMockStore((s) => s.createStation);
  const mockUpdateStation = useMockStore((s) => s.updateStation);
  const mockArchiveStation = useMockStore((s) => s.archiveStation);
  const mockReorderStations = useMockStore((s) => s.reorderStations);

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(!isMock);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const sortedStations = useMemo(
    () => [...stations].sort((a, b) => a.sort_order - b.sort_order),
    [stations],
  );

  // Load data
  useEffect(() => {
    if (isMock) {
      setStations(mockStations as Station[]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("stations")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error("Could not load stations");
        } else {
          setStations(data ?? []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isMock, mockStations]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setName("");
    setNameError("");
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((station: Station) => {
    setEditing(station);
    setName(station.name);
    setNameError("");
    setSheetOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setNameError("Required");
      return;
    }
    setSaving(true);

    if (isMock) {
      if (editing) {
        mockUpdateStation(editing.id, { name: name.trim() });
      } else {
        mockCreateStation(name.trim());
      }
      setSheetOpen(false);
      setSaving(false);
      toast.success(editing ? "Station updated" : "Station created");
      return;
    }

    if (editing) {
      const res = await updateStation(editing.id, name.trim());
      if (res.success) {
        setStations((prev) =>
          prev.map((s) =>
            s.id === editing.id ? { ...s, name: name.trim() } : s,
          ),
        );
        toast.success("Station updated");
        setSheetOpen(false);
      } else {
        setNameError(res.error);
      }
    } else {
      const maxOrder = Math.max(0, ...stations.map((s) => s.sort_order));
      const res = await createStation(name.trim(), maxOrder + 10);
      if (res.success) {
        setStations((prev) => [...prev, res.data]);
        toast.success("Station created");
        setSheetOpen(false);
      } else {
        setNameError(res.error);
      }
    }
    setSaving(false);
  }, [name, editing, isMock, mockCreateStation, mockUpdateStation, stations]);

  const handleArchive = useCallback(
    async (station: Station, active: boolean) => {
      if (isMock) {
        mockArchiveStation(station.id, active);
        toast.success(active ? "Station restored" : "Station archived");
        return;
      }
      const res = await archiveStation(station.id, active);
      if (res.success) {
        setStations((prev) =>
          prev.map((s) => (s.id === station.id ? { ...s, active } : s)),
        );
        toast.success(active ? "Station restored" : "Station archived");
      } else {
        toast.error(res.error);
      }
    },
    [isMock, mockArchiveStation],
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      if (isMock) {
        mockReorderStations(orderedIds);
        return;
      }
      const res = await reorderStations(orderedIds);
      if (res.success) {
        setStations((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]));
          return orderedIds
            .map((id) => map.get(id))
            .filter(Boolean)
            .map((s, i) => ({ ...s, sort_order: (i + 1) * 10 })) as Station[];
        });
      } else {
        toast.error(res.error);
      }
    },
    [isMock, mockReorderStations],
  );

  const itemCountByStation = useMemo(() => {
    if (isMock) {
      const items = useMockStore.getState().items;
      const map = new Map<string, number>();
      items.forEach((i) => {
        if (i.active) map.set(i.station_id, (map.get(i.station_id) ?? 0) + 1);
      });
      return map;
    }
    return new Map<string, number>();
  }, [isMock]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-body text-muted-foreground">
          {sortedStations.length}{" "}
          {sortedStations.length === 1 ? "station" : "stations"}
        </p>
        <Button size="sm" onClick={openCreate} className="gap-1">
          <Plus className="h-4 w-4" />
          Add station
        </Button>
      </div>

      <Card className="overflow-hidden bg-card p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Items</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <AdminSortableContext
            itemIds={sortedStations.map((s) => s.id)}
            onReorder={handleReorder}
          >
            <TableBody>
              {sortedStations.map((station) => (
                <SortableRow key={station.id} id={station.id}>
                  <TableCell>
                    <span className="text-body font-medium text-foreground">
                      {station.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-body-sm text-muted-foreground">
                      {itemCountByStation.get(station.id) ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span
                      className={`caption rounded-md border px-2 py-0.5 ${
                        station.active
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {station.active ? "Active" : "Archived"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(station)}
                        aria-label="Edit station"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleArchive(station, !station.active)}
                        aria-label={
                          station.active ? "Archive station" : "Restore station"
                        }
                      >
                        {station.active ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <ArchiveRestore className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </SortableRow>
              ))}
            </TableBody>
          </AdminSortableContext>
        </Table>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="border-border bg-card">
          <SheetHeader>
            <SheetTitle className="font-display text-display-md text-foreground">
              {editing ? "Edit station" : "Add station"}
            </SheetTitle>
            <SheetDescription className="text-body-sm text-muted-foreground">
              {editing
                ? "Update the station name."
                : "Create a new counting station."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="station-name" className="text-body">
                Name
              </Label>
              <Input
                id="station-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError("");
                }}
                placeholder="e.g. Walk-in 1 — Proteins"
                className="border-input bg-background"
              />
              {nameError && (
                <p className="text-body-sm text-destructive">{nameError}</p>
              )}
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setSheetOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create station"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
