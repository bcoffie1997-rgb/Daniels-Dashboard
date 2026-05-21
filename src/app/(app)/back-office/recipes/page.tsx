"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export default function RecipesPage() {
  const recipes = useMockStore((s) => s.recipes);
  const menuItems = useMockStore((s) => s.menuItems);
  const recipeLines = useMockStore((s) => s.recipeLines);
  const products = useMockStore((s) => s.products);

  const rows = useMemo(
    () => [...recipes].filter((r) => r.active),
    [recipes],
  );

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Recipe costing — plate costs update when invoice prices change. Linked
        to Toast menu items for AvT.
      </p>
      <div className="grid grid-cols-1 gap-4">
        {rows.map((recipe) => {
          const menu = menuItems.find((m) => m.id === recipe.menu_item_id);
          const lines = recipeLines.filter((l) => l.recipe_id === recipe.id);
          const margin =
            menu && recipe.plate_cost
              ? (menu.menu_price - recipe.plate_cost) / menu.menu_price
              : null;

          return (
            <Card key={recipe.id} className="bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-display-md text-foreground">
                    {recipe.name}
                  </h2>
                  {menu && (
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      Menu: {menu.name} · {formatMoney(menu.menu_price)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="caption text-muted-foreground">Plate cost</p>
                  <p className="tabular font-mono text-body text-foreground">
                    {recipe.plate_cost
                      ? formatMoney(recipe.plate_cost)
                      : "—"}
                  </p>
                  {margin !== null && (
                    <p className="caption mt-1 text-accent">
                      {(margin * 100).toFixed(1)}% margin
                    </p>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-border pt-4">
                {lines.map((line) => {
                  const product = products.find((p) => p.id === line.product_id);
                  return (
                    <li
                      key={line.id}
                      className="flex justify-between gap-4 text-body-sm"
                    >
                      <span className="text-foreground">
                        {product?.name ?? line.product_id}
                      </span>
                      <span className="tabular font-mono text-muted-foreground">
                        {line.quantity} {line.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
      <p className="mt-6 text-body-sm text-muted-foreground">
        Full recipe editor ships in Sprint 13.{" "}
        <Link href="/back-office/toast" className="text-accent underline">
          Toast menu sync
        </Link>{" "}
        required to map new dishes.
      </p>
    </>
  );
}
