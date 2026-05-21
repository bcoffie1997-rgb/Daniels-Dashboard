"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useMockStore,
  selectCurrentUser,
  computeEntriesForSession,
} from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VarianceBadge } from "@/components/count/variance-badge";
import { classifyVariance } from "@/lib/variance";
import { formatDuration, formatQuantity } from "@/lib/format";

export default function ReviewPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const router = useRouter();
  const user = useMockStore(selectCurrentUser);
  const station = useMockStore((s) =>
    s.stations.find((st) => st.id === stationId),
  );
  const activeSession = useMockStore((s) =>
    s.sessions.find(
      (sess) =>
        sess.station_id === stationId &&
        sess.user_id === user?.id &&
        sess.status === "in_progress",
    ),
  );
  const sessionId = activeSession?.id ?? "__none__";
  const allEntries = useMockStore((s) => s.entries);
  const entries = useMemo(
    () => computeEntriesForSession(allEntries, sessionId),
    [allEntries, sessionId],
  );
  const items = useMockStore((s) => s.items);
  const setSessionNotes = useMockStore((s) => s.setSessionNotes);
  const setEntryReason = useMockStore((s) => s.setEntryReason);
  const submitSession = useMockStore((s) => s.submitSession);

  const [notes, setNotes] = useState(activeSession?.notes ?? "");

  const flagged = useMemo(
    () =>
      entries.filter((e) => {
        const c = classifyVariance(e.variance_pct);
        return c === "warn" || c === "danger";
      }),
    [entries],
  );

  if (!activeSession || !station) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-body text-muted-foreground">
          No active count found. Start one from the station picker.
        </p>
      </div>
    );
  }

  const counted = entries.length;
  const skipped = 0;
  const duration = formatDuration(
    activeSession.started_at,
    new Date().toISOString(),
  );

  const onSubmit = () => {
    setSessionNotes(activeSession.id, notes);
    submitSession(activeSession.id);
    toast.success("Count submitted for review.");
    router.push(`/sessions/${activeSession.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-32 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="caption text-muted-foreground">{station.name}</p>
        <h1 className="mt-1 font-display text-display-lg text-foreground">
          Review & submit
        </h1>
      </header>

      <Card className="mb-6 bg-card p-5">
        <div className="grid grid-cols-3 gap-4">
          <Summary label="Counted" value={`${counted}`} />
          <Summary label="Skipped" value={`${skipped}`} />
          <Summary label="Time spent" value={duration} />
        </div>
      </Card>

      {flagged.length > 0 && (
        <section className="mb-6">
          <h2 className="caption mb-3 text-muted-foreground">Flagged items</h2>
          <div className="flex flex-col gap-3">
            {flagged.map((e) => {
              const item = items.find((i) => i.id === e.item_id);
              if (!item) return null;
              return (
                <Card key={e.id} className="bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-body font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="caption mt-0.5 text-muted-foreground">
                        Counted {formatQuantity(e.quantity, item.unit)} ·
                        Last {formatQuantity(e.previous_quantity, item.unit)}
                      </p>
                    </div>
                    <VarianceBadge variance_pct={e.variance_pct} />
                  </div>
                  <Textarea
                    placeholder="Reason (optional)"
                    defaultValue={e.reason ?? ""}
                    onBlur={(ev) =>
                      setEntryReason(
                        activeSession.id,
                        e.item_id,
                        ev.target.value,
                      )
                    }
                    className="mt-3 min-h-[64px] resize-none border-border bg-background text-body"
                  />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="caption mb-3 text-muted-foreground">Session notes</h2>
        <Textarea
          placeholder="Anything the manager should know."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[96px] resize-none border-border bg-card text-body"
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Button
            onClick={onSubmit}
            className="h-14 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit count
          </Button>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="caption text-muted-foreground">{label}</p>
      <p className="tabular mt-1 font-display text-display-md text-foreground">
        {value}
      </p>
    </div>
  );
}
