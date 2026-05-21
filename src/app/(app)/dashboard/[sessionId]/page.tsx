"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  useMockStore,
  computeEntriesForSession,
} from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/count/status-badge";
import { VarianceBadge } from "@/components/count/variance-badge";
import { StatCard } from "@/components/manager/stat-card";
import { absoluteTime, formatDuration, formatQuantity, relativeFromNow } from "@/lib/format";
import { classifyVariance } from "@/lib/variance";

export default function ManagerSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const session = useMockStore((s) =>
    s.sessions.find((sess) => sess.id === sessionId),
  );
  const station = useMockStore((s) =>
    session ? s.stations.find((st) => st.id === session.station_id) : null,
  );
  const counter = useMockStore((s) =>
    session ? s.users.find((u) => u.id === session.user_id) : null,
  );
  const items = useMockStore((s) => s.items);
  const allEntries = useMockStore((s) => s.entries);
  const entries = useMemo(
    () => computeEntriesForSession(allEntries, sessionId ?? "__none__"),
    [allEntries, sessionId],
  );
  const approveSession = useMockStore((s) => s.approveSession);
  const rejectSession = useMockStore((s) => s.rejectSession);
  const setManagerNotes = useMockStore((s) => s.setManagerNotes);

  const [managerNotes, setLocalManagerNotes] = useState(
    session?.manager_notes ?? "",
  );
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => Math.abs(b.variance_pct ?? 0) - Math.abs(a.variance_pct ?? 0),
      ),
    [entries],
  );

  if (!session || !station) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-body text-muted-foreground">Session not found.</p>
        <Link
          href="/dashboard"
          className="mt-3 inline-block text-body text-accent underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const counted = entries.length;
  const flaggedCount = entries.filter((e) => {
    const c = classifyVariance(e.variance_pct);
    return c === "warn" || c === "danger";
  }).length;
  const duration = formatDuration(
    session.started_at,
    session.submitted_at ?? null,
  );

  const onApprove = () => {
    setManagerNotes(session.id, managerNotes);
    approveSession(session.id, managerNotes);
    toast.success("Count approved.");
    router.push("/dashboard");
  };

  const onReject = () => {
    if (!rejectReason.trim()) return;
    setManagerNotes(session.id, managerNotes);
    rejectSession(session.id, rejectReason.trim());
    setRejectOpen(false);
    toast.success("Count rejected. The counter will see your note.");
    router.push("/dashboard");
  };

  const isPending = session.status === "submitted";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-32 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="caption text-muted-foreground">{station.name}</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-display text-display-lg text-foreground">
            Review session
          </h1>
          <StatusBadge status={session.status} />
        </div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          {counter?.full_name ?? "Unknown counter"} ·{" "}
          {session.submitted_at
            ? `Submitted ${absoluteTime(session.submitted_at)} (${relativeFromNow(session.submitted_at)})`
            : `Started ${absoluteTime(session.started_at)}`}
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Counted" value={counted} />
        <StatCard label="Flagged" value={flaggedCount} hint=">20% variance" />
        <StatCard label="Duration" value={duration} />
        <StatCard
          label="Status"
          value={
            session.status === "in_progress"
              ? "In progress"
              : session.status === "submitted"
                ? "Submitted"
                : session.status === "approved"
                  ? "Approved"
                  : "Rejected"
          }
        />
      </div>

      {session.notes && (
        <Card className="mb-6 bg-card p-4">
          <p className="caption text-muted-foreground">Counter notes</p>
          <p className="mt-1 text-body text-foreground">{session.notes}</p>
        </Card>
      )}

      <h2 className="caption mb-3 text-muted-foreground">
        Entries — sorted by variance
      </h2>
      <Card className="mb-6 overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {sorted.map((e) => {
            const item = items.find((i) => i.id === e.item_id);
            if (!item) return null;
            return (
              <li
                key={e.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-body text-foreground">
                    {item.name}
                  </p>
                  {e.reason && (
                    <p className="caption mt-1 text-muted-foreground">
                      “{e.reason}”
                    </p>
                  )}
                </div>
                <div className="hidden text-right lg:block">
                  <p className="caption text-muted-foreground">Counted</p>
                  <p className="tabular font-mono text-body text-foreground">
                    {formatQuantity(e.quantity, item.unit)}
                  </p>
                </div>
                <div className="text-right lg:hidden">
                  <p className="tabular font-mono text-body text-foreground">
                    {formatQuantity(e.quantity, item.unit)}
                  </p>
                  <p className="caption text-muted-foreground">
                    Last {formatQuantity(e.previous_quantity, item.unit)}
                  </p>
                </div>
                <div className="hidden text-right lg:block">
                  <p className="caption text-muted-foreground">Previous</p>
                  <p className="tabular font-mono text-body text-muted-foreground">
                    {formatQuantity(e.previous_quantity, item.unit)}
                  </p>
                </div>
                <VarianceBadge variance_pct={e.variance_pct} />
              </li>
            );
          })}
        </ul>
      </Card>

      <section className="mb-6">
        <h2 className="caption mb-3 text-muted-foreground">Manager notes</h2>
        <Textarea
          placeholder="Notes for the team or for your own records."
          value={managerNotes}
          onChange={(e) => setLocalManagerNotes(e.target.value)}
          className="min-h-[96px] resize-none border-border bg-card text-body"
        />
      </section>

      {isPending && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-4xl gap-3">
            <Button
              variant="outline"
              className="h-12 flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
            <Button
              className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onApprove}
            >
              Approve
            </Button>
          </div>
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle className="font-display text-display-md text-foreground">
              Reject this count
            </DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              The counter will see your note and can re-count to resubmit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection. Required."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[120px] resize-none border-border bg-background text-body"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={onReject}
              disabled={!rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Reject count
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
