"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Archive, ArchiveRestore, Upload } from "lucide-react";
import { isMockMode } from "@/lib/auth/config";
import { useMockStore } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { AdminSortableContext } from "@/components/admin/sortable-context";
import { SortableRow } from "@/components/admin/sortable-row";
import {
  createItem,
  updateItem,
  archiveItem,
  reorderItems,
  bulkImportItems,
} from "@/app/(admin)/actions";

type Station = Database["public"]["Tables"]["stations"]["Row"];
type Item = Database["public"]["Tables"]["items"]["Row"];
type UnitType = Database["public"]["Enums"]["unit_type"];

const UNITS: UnitType[] = [
  "lb",
  "oz",
  "each",
  "bottle",
  "case",
  "gal",
  "qt",
  "l",
  "ml",
  "kg",
  "g",
];

export default function AdminItemsPage() {
  const isMock = isMockMode();
  const mockStations = useMockStore((s) => s.stations);
  const mockItems = useMockStore((s) => s.items);
  const mockCreateItem = useMockStore((s) => s.createItem);
  const mockUpdateItem = useMockStore((s) => s.updateItem);
  const mockArchiveItem = useMockStore((s) => s.archiveItem);
  const mockReorderItems = useMockStore((s) => s.reorderItems);
  const mockBulkImportItems = useMockStore((s) => s.bulkImportItems);

  const [stations, setStations] = useState<Station[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(!isMock);
  const [stationId, setStationId] = useState<string>("");

  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<UnitType | "">("");
  const [parLevel, setParLevel] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<
    { name: string; unit: string; par_level?: number | null; error?: string }[]
  >([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [importing, setImporting] = useState(false);

  const sortedStations = useMemo(
    () => [...stations].sort((a, b) => a.sort_order - b.sort_order),
    [stations],
  );

  const activeStations = useMemo(
    () => sortedStations.filter((s) => s.active),
    [sortedStations],
  );

  // Load data
  useEffect(() => {
    if (isMock) {
      setStations(mockStations as Station[]);
      setItems(mockItems as Item[]);
      setLoading(false);
      if (!stationId && mockStations.length > 0) {
        setStationId(mockStations[0].id);
      }
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    Promise.all([
      supabase
        .from("stations")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("items").select("*").order("sort_order", { ascending: true }),
    ]).then(([stationsRes, itemsRes]) => {
      if (cancelled) return;
      if (stationsRes.error || itemsRes.error) {
        toast.error("Could not load catalog");
      } else {
        const st = (stationsRes.data ?? []) as Station[];
        const it = (itemsRes.data ?? []) as Item[];
        setStations(st);
        setItems(it);
        if (!stationId && st.length > 0) {
          const firstActive = st.find((s) => s.active);
          setStationId(firstActive?.id ?? st[0].id);
        }
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // stationId is intentionally omitted; it is set inside this effect on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMock, mockStations, mockItems]);

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => i.station_id === stationId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [items, stationId]);

  const currentStation = useMemo(
    () => stations.find((s) => s.id === stationId),
    [stations, stationId],
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setName("");
    setUnit("");
    setParLevel("");
    setErrors({});
    setItemSheetOpen(true);
  }, []);

  const openEdit = useCallback((item: Item) => {
    setEditing(item);
    setName(item.name);
    setUnit(item.unit);
    setParLevel(item.par_level?.toString() ?? "");
    setErrors({});
    setItemSheetOpen(true);
  }, []);

  const validateItemForm = useCallback(() => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Required";
    if (!unit) next.unit = "Select a unit";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, unit]);

  const handleSave = useCallback(async () => {
    if (!validateItemForm()) return;
    setSaving(true);

    const par = parLevel.trim() === "" ? null : Number(parLevel);

    if (isMock) {
      const unitVal = unit as UnitType;
      if (editing) {
        mockUpdateItem(editing.id, {
          name: name.trim(),
          unit: unitVal,
          par_level: par,
          station_id: stationId,
        });
      } else {
        mockCreateItem(stationId, name.trim(), unitVal, par);
      }
      setItemSheetOpen(false);
      setSaving(false);
      toast.success(editing ? "Item updated" : "Item created");
      return;
    }

    if (editing) {
      const res = await updateItem(editing.id, {
        name: name.trim(),
        unit: unit as UnitType,
        par_level: par,
        station_id: stationId,
      });
      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editing.id
              ? { ...i, name: name.trim(), unit: unit as UnitType, par_level: par, station_id: stationId }
              : i,
          ),
        );
        toast.success("Item updated");
        setItemSheetOpen(false);
      } else {
        setErrors({ form: res.error });
      }
    } else {
      const maxOrder = Math.max(
        0,
        ...items
          .filter((i) => i.station_id === stationId)
          .map((i) => i.sort_order),
      );
      const res = await createItem(stationId, name.trim(), unit as UnitType, par, maxOrder + 10);
      if (res.success) {
        setItems((prev) => [...prev, res.data]);
        toast.success("Item created");
        setItemSheetOpen(false);
      } else {
        setErrors({ form: res.error });
      }
    }
    setSaving(false);
  }, [
    name,
    unit,
    parLevel,
    stationId,
    editing,
    isMock,
    mockCreateItem,
    mockUpdateItem,
    items,
    validateItemForm,
  ]);

  const handleArchive = useCallback(
    async (item: Item, active: boolean) => {
      if (isMock) {
        mockArchiveItem(item.id, active);
        toast.success(active ? "Item restored" : "Item archived");
        return;
      }
      const res = await archiveItem(item.id, active);
      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, active } : i)),
        );
        toast.success(active ? "Item restored" : "Item archived");
      } else {
        toast.error(res.error);
      }
    },
    [isMock, mockArchiveItem],
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      if (isMock) {
        mockReorderItems(stationId, orderedIds);
        return;
      }
      const res = await reorderItems(stationId, orderedIds);
      if (res.success) {
        setItems((prev) => {
          const stationItems = prev.filter((i) => i.station_id === stationId);
          const otherItems = prev.filter((i) => i.station_id !== stationId);
          const map = new Map(stationItems.map((i) => [i.id, i]));
          const reordered = orderedIds
            .map((id) => map.get(id))
            .filter(Boolean)
            .map((i, idx) => ({ ...i, sort_order: (idx + 1) * 10 })) as Item[];
          return [...otherItems, ...reordered];
        });
      } else {
        toast.error(res.error);
      }
    },
    [isMock, mockReorderItems, stationId],
  );

  const parseCsv = useCallback(() => {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const rows = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const [namePart, unitPart, parPart] = parts;
      const row: {
        name: string;
        unit: string;
        par_level?: number | null;
        error?: string;
      } = {
        name: namePart ?? "",
        unit: unitPart ?? "",
        par_level: parPart ? Number(parPart) : null,
      };
      if (!row.name) row.error = "Name is required";
      else if (!UNITS.includes(row.unit as UnitType))
        row.error = `Unit must be one of: ${UNITS.join(", ")}`;
      else if (parPart && Number.isNaN(row.par_level))
        row.error = "Par level must be a number";
      return row;
    });

    setCsvPreview(rows);
    setPreviewVisible(true);
  }, [csvText]);

  const handleImport = useCallback(async () => {
    const validRows = csvPreview.filter((r) => !r.error);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    setImporting(true);

    if (isMock) {
      const count = mockBulkImportItems(
        stationId,
        validRows.map((r) => ({
          name: r.name,
          unit: r.unit,
          par_level: r.par_level,
        })),
      );
      toast.success(`${count} items imported`);
      setImportSheetOpen(false);
      setCsvText("");
      setCsvPreview([]);
      setPreviewVisible(false);
      setImporting(false);
      return;
    }

    const res = await bulkImportItems(
      stationId,
      validRows.map((r) => ({
        name: r.name,
        unit: r.unit,
        par_level: r.par_level,
      })),
    );
    if (res.success) {
      setItems((prev) => [...prev, ...(res.data ?? [])]);
      toast.success(`${res.count} items imported`);
      setImportSheetOpen(false);
      setCsvText("");
      setCsvPreview([]);
      setPreviewVisible(false);
    } else {
      toast.error(res.error);
    }
    setImporting(false);
  }, [csvPreview, stationId, isMock, mockBulkImportItems]);

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
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Select
            value={stationId}
            onValueChange={(v) => v && setStationId(v)}
          >
            <SelectTrigger className="border-border bg-card w-full sm:w-72">
              <SelectValue placeholder="Choose a station" />
            </SelectTrigger>
            <SelectContent>
              {activeStations.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportSheetOpen(true)}
            className="gap-1"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk import</span>
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add item</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden bg-card p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Unit</TableHead>
              <TableHead className="hidden sm:table-cell">Par</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <AdminSortableContext
            itemIds={filteredItems.map((i) => i.id)}
            onReorder={handleReorder}
          >
            <TableBody>
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No items in this station yet.
                  </TableCell>
                </TableRow>
              )}
              {filteredItems.map((item) => (
                <SortableRow key={item.id} id={item.id}>
                  <TableCell>
                    <span className="text-body text-foreground">
                      {item.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="caption text-muted-foreground uppercase">
                      {item.unit}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="tabular font-mono text-body-sm text-muted-foreground">
                      {item.par_level !== null
                        ? `${item.par_level} ${item.unit}`
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span
                      className={`caption rounded-md border px-2 py-0.5 ${
                        item.active
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {item.active ? "Active" : "Archived"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(item)}
                        aria-label="Edit item"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleArchive(item, !item.active)}
                        aria-label={
                          item.active ? "Archive item" : "Restore item"
                        }
                      >
                        {item.active ? (
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

      {/* Add/Edit Item Sheet */}
      <Sheet open={itemSheetOpen} onOpenChange={setItemSheetOpen}>
        <SheetContent className="border-border bg-card">
          <SheetHeader>
            <SheetTitle className="font-display text-display-md text-foreground">
              {editing ? "Edit item" : "Add item"}
            </SheetTitle>
            <SheetDescription className="text-body-sm text-muted-foreground">
              {editing
                ? "Update this inventory item."
                : `Add an item to ${currentStation?.name ?? "this station"}.`}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-body">
                Name
              </Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="e.g. Ribeye, 14 oz"
                className="border-input bg-background"
              />
              {errors.name && (
                <p className="text-body-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-unit" className="text-body">
                Unit
              </Label>
              <Select
                value={unit}
                onValueChange={(v) => {
                  setUnit(v as UnitType);
                  setErrors((p) => ({ ...p, unit: "" }));
                }}
              >
                <SelectTrigger
                  id="item-unit"
                  className="border-input bg-background"
                >
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-body-sm text-destructive">{errors.unit}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-par" className="text-body">
                Par level
              </Label>
              <Input
                id="item-par"
                type="number"
                min={0}
                step="any"
                value={parLevel}
                onChange={(e) => setParLevel(e.target.value)}
                placeholder="Optional"
                className="border-input bg-background"
              />
              <p className="text-body-sm text-muted-foreground">
                Optional. The target quantity for this item.
              </p>
            </div>

            {errors.form && (
              <p className="text-body-sm text-destructive">{errors.form}</p>
            )}
          </div>
          <SheetFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setItemSheetOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create item"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Bulk Import Sheet */}
      <Sheet open={importSheetOpen} onOpenChange={setImportSheetOpen}>
        <SheetContent className="border-border bg-card sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-display text-display-md text-foreground">
              Bulk import
            </SheetTitle>
            <SheetDescription className="text-body-sm text-muted-foreground">
              Paste CSV for {currentStation?.name ?? "this station"}. Format: name, unit, par_level
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setPreviewVisible(false);
              }}
              placeholder={`Ribeye, each, 40\nFilet mignon, each, 32\nNY Strip, each, 28`}
              className="min-h-[160px] border-input bg-background font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={parseCsv}
              disabled={!csvText.trim()}
              className="w-full"
            >
              Preview
            </Button>

            {previewVisible && (
              <div className="space-y-2">
                <p className="caption text-muted-foreground">
                  {csvPreview.filter((r) => !r.error).length} valid,{" "}
                  {csvPreview.filter((r) => r.error).length} errors
                </p>
                <div className="max-h-64 overflow-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Par</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvPreview.map((row, idx) => (
                        <TableRow
                          key={idx}
                          className={
                            row.error ? "bg-warning-bg" : "hover:bg-muted/50"
                          }
                        >
                          <TableCell>
                            <span
                              className={
                                row.error
                                  ? "text-destructive"
                                  : "text-foreground"
                              }
                            >
                              {row.name || "—"}
                            </span>
                            {row.error && (
                              <p className="text-body-sm text-destructive mt-0.5">
                                {row.error}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.unit || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.par_level ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={
                    importing ||
                    csvPreview.filter((r) => !r.error).length === 0
                  }
                  className="w-full"
                >
                  {importing
                    ? "Importing..."
                    : `Import ${csvPreview.filter((r) => !r.error).length} items`}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
