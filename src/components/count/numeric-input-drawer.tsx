"use client";

import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatQuantity } from "@/lib/format";
import type { Item } from "@/lib/mock/types";

interface NumericInputDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  previousQuantity: number | null;
  currentQuantity: number | null;
  onSave: (qty: number) => void;
  onSaveAndNext: (qty: number) => void;
  onSkip: () => void;
  hasNext: boolean;
}

export function NumericInputDrawer({
  open,
  onOpenChange,
  item,
  previousQuantity,
  currentQuantity,
  onSave,
  onSaveAndNext,
  onSkip,
  hasNext,
}: NumericInputDrawerProps) {
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(currentQuantity !== null ? String(currentQuantity) : "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, currentQuantity, item?.id]);

  if (!item) return null;

  const parsed = parseFloat(value);
  const valid = !Number.isNaN(parsed) && parsed >= 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-popover">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle className="text-heading-lg font-medium text-foreground">
            {item.name}
          </DrawerTitle>
          <DrawerDescription className="caption text-muted-foreground">
            Unit: {item.unit}
            {previousQuantity !== null
              ? ` · Last: ${formatQuantity(previousQuantity, item.unit)}`
              : ""}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-4">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            className="tabular block w-full rounded-lg border border-border bg-card px-4 py-4 text-center font-mono text-display-md text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          />
          <p className="mt-2 text-center text-body-sm text-muted-foreground">
            in {item.unit}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 px-6 pb-4">
          {previousQuantity !== null && (
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => setValue(String(previousQuantity))}
            >
              Same as last ({formatQuantity(previousQuantity, item.unit)})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onSkip}
          >
            Skip
          </Button>
        </div>

        <div className="flex gap-3 border-t border-border bg-card px-6 py-4">
          <Button
            variant="outline"
            className="h-12 flex-1 border-border"
            disabled={!valid}
            onClick={() => valid && onSave(parsed)}
          >
            Save & close
          </Button>
          <Button
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!valid || !hasNext}
            onClick={() => valid && onSaveAndNext(parsed)}
          >
            Save & next
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
