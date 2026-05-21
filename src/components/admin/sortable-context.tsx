"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SortableContextProps {
  itemIds: string[];
  onReorder: (orderedIds: string[]) => void;
  children: React.ReactNode;
}

export function AdminSortableContext({
  itemIds,
  onReorder,
  children,
}: SortableContextProps) {
  const [ids, setIds] = useState(itemIds);

  useEffect(() => {
    setIds((prev) => {
      if (
        prev.length !== itemIds.length ||
        prev.some((id, i) => id !== itemIds[i])
      ) {
        return itemIds;
      }
      return prev;
    });
  }, [itemIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        const next = arrayMove(ids, oldIndex, newIndex);
        setIds(next);
        onReorder(next);
      }
    },
    [ids, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
