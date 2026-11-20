"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { useUser } from "@/context/auth-context";
import { ApiError, errorMessage } from "@/lib/api";
import { ACTION_LABEL, canPickUp, canReassign, canWorkTicket, nextStatus } from "@/lib/ticket-permissions";
import { updateTicket, type TicketPatch } from "@/lib/tickets";
import type { StaffUser, TicketListItem } from "@/lib/types";
import { TicketPropertiesForm } from "./ticket-properties-form";

type ManagePanelProps = {
  ticket: TicketListItem;
  agents: StaffUser[];
  onUpdated: (ticket: TicketListItem) => void;
  onReload: () => void;
};

type PanelError = { message: string; conflict: boolean };

function toPanelError(err: unknown): PanelError {
  if (err instanceof ApiError && err.status === 409) {
    return {
      conflict: true,
      message:
        err.code === "VERSION_CONFLICT"
          ? "Someone else changed this ticket while you were looking at it, so your change was not saved. Reload to see the latest version."
          : errorMessage(err),
    };
  }
  return { conflict: false, message: errorMessage(err) };
}

export function ManagePanel({ ticket, agents, onUpdated, onReload }: ManagePanelProps) {
  const user = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PanelError | null>(null);

  async function apply(patch: TicketPatch) {
    setBusy(true);
    setError(null);
    try {
      onUpdated(await updateTicket(ticket.ticketId, { ...patch, version: ticket.version }));
    } catch (err) {
      setError(toPanelError(err));
    } finally {
      setBusy(false);
    }
  }

  function reload() {
    setError(null);
    onReload();
  }

  const closed = ticket.status === "CLOSED";
  const canWork = canWorkTicket(user, ticket);
  const pickUp = canPickUp(user, ticket);
  const next = nextStatus(ticket.status);
  const needsAssignee = next === "IN_PROGRESS" && !ticket.assigneeId;

  return (
    <Card className="space-y-5">
      <h2 className="text-base font-semibold">Manage</h2>

      {error ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error.message}</span>
            {error.conflict ? (
              <Button variant="secondary" onClick={reload}>
                Reload ticket
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : null}

      {closed ? (
        <p className="text-sm text-slate-600">This ticket is closed and can no longer be changed.</p>
      ) : (
        <>
          {pickUp ? (
            <div className="space-y-2">
              <Button className="w-full" loading={busy} onClick={() => apply({ status: "IN_PROGRESS" })}>
                Pick up this ticket
              </Button>
              <p className="text-xs text-slate-500">Assigns it to you and starts work.</p>
            </div>
          ) : next && canWork ? (
            <div className="space-y-2">
              {next === "CLOSED" ? (
                <ConfirmButton confirmLabel="Yes, close it" loading={busy} onConfirm={() => apply({ status: next })} className="w-full">
                  {ACTION_LABEL[next]}
                </ConfirmButton>
              ) : (
                <Button className="w-full" loading={busy} disabled={needsAssignee} onClick={() => apply({ status: next })}>
                  {ACTION_LABEL[next]}
                </Button>
              )}
              {needsAssignee ? <p className="text-xs text-slate-500">Assign an agent below before starting work.</p> : null}
              {next === "CLOSED" ? <p className="text-xs text-slate-500">Closing is permanent. The customer can no longer reply.</p> : null}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {ticket.assigneeId
                ? `Only ${ticket.assigneeName ?? "the assigned agent"} or an admin can update this ticket.`
                : "Only agents can pick up tickets. Admins assign them to an agent."}
            </p>
          )}

          <hr className="border-slate-100" />

          {/* remounts whenever the version changes, so drafts always start from the saved ticket */}
          <TicketPropertiesForm
            key={ticket.version}
            ticket={ticket}
            agents={agents}
            editable={canWork}
            assignable={canReassign(user, ticket)}
            busy={busy}
            onSave={apply}
          />

          {!canWork && !canReassign(user, ticket) && pickUp ? (
            <p className="text-xs text-slate-500">Pick up the ticket to change its priority and type.</p>
          ) : null}
        </>
      )}
    </Card>
  );
}