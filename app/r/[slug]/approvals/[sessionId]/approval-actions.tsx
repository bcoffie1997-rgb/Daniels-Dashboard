"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ApprovalActions({
  restaurantSlug,
  sessionId,
  stationName,
}: {
  restaurantSlug: string;
  sessionId: string;
  stationName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    setBusy("approve");
    // Mock — wires to server action in production
    setTimeout(() => {
      setBusy(null);
      setDone("approved");
    }, 600);
  }

  function submitRejection() {
    if (reason.trim().length < 4) {
      alert("Please give the counter a real reason for the reject.");
      return;
    }
    setBusy("reject");
    setTimeout(() => {
      setBusy(null);
      setDone("rejected");
    }, 600);
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <div
          className={`h-12 w-12 rounded-full ${
            done === "approved"
              ? "bg-success/20 border border-success/40"
              : "bg-destructive-bg border border-destructive/40"
          } flex items-center justify-center mx-auto`}
        >
          {done === "approved" ? (
            <CheckCircle2 className="h-6 w-6 text-success" />
          ) : (
            <XCircle className="h-6 w-6 text-destructive" />
          )}
        </div>
        <div className="font-display text-display-md mt-3">
          {done === "approved" ? "Count approved" : "Count rejected"}
        </div>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
          {done === "approved"
            ? `${stationName} variance is committed. The audit log captured this approval.`
            : `Sent back to the counter with your reason. They'll see it in the count flow.`}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => router.push(`/r/${restaurantSlug}/approvals`)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm hover:border-accent/60 transition-colors"
          >
            Back to queue
          </button>
          <button
            onClick={() => router.push(`/r/${restaurantSlug}`)}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showRejectForm) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive-bg p-5">
        <div className="font-medium">Reject this count</div>
        <p className="text-sm text-muted-foreground mt-1.5">
          Tell the counter what to fix. They'll see this in the count flow.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Recount Maine Lobster in `each` not `lb`. Sub-recipe entries look wrong."
          rows={4}
          className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowRejectForm(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={submitRejection}
            disabled={busy === "reject"}
            className="inline-flex items-center gap-2 rounded-md bg-destructive text-destructive-foreground px-4 py-2.5 text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {busy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Send back to counter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowRejectForm(true)}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-card px-4 py-2.5 text-sm text-destructive hover:bg-destructive-bg transition-colors disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" /> Reject with reason
        </button>
        <button
          onClick={approve}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-md bg-success text-success-foreground px-5 py-2.5 text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
        >
          {busy === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Approve count
        </button>
      </div>
    </div>
  );
}
