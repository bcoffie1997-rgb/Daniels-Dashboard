"use client";

import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";

export default function VendorsPage() {
  const vendors = useMockStore((s) => s.vendors);
  const productVendors = useMockStore((s) => s.productVendors);

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Vendor hub — account numbers, contacts, and linked products.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {vendors.map((v) => {
          const linked = productVendors.filter((pv) => pv.vendor_id === v.id);
          return (
            <Card key={v.id} className="bg-card p-5">
              <h2 className="font-display text-display-md text-foreground">
                {v.name}
              </h2>
              <dl className="mt-4 space-y-2 text-body-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Account</dt>
                  <dd className="tabular font-mono text-foreground">
                    {v.account_number ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="text-foreground">
                    {v.contact_email ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Products</dt>
                  <dd className="tabular text-foreground">
                    {linked.length} linked
                  </dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>
    </>
  );
}
