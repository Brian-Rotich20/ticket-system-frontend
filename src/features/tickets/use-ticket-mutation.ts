'use client';

import { useState } from 'react';
import { errorMessage, isApiError } from '@/lib/api/client';
import type { Ticket } from '@/types/api';
import { updateTicket, type TicketPatch } from './api';

export type MutationError = { message: string; conflict: boolean };

/**
 * Sends a PATCH with the version the user is looking at. A concurrent change (409 VERSION_CONFLICT) is reported
 * as a conflict so the UI can offer a reload instead of silently overwriting someone else's work.
 */
export function useTicketMutation(ticket: Ticket, onUpdated: (t: Ticket) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MutationError | null>(null);

  async function apply(patch: TicketPatch): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      onUpdated(await updateTicket(ticket.ticketId, { ...patch, version: ticket.version }));
      return true;
    } catch (err) {
      setError(
        isApiError(err, 409, 'VERSION_CONFLICT')
          ? { conflict: true, message: 'Someone else changed this ticket while you were looking at it, so your change was not saved. Reload to see the latest version.' }
          : { conflict: false, message: errorMessage(err) },
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { apply, busy, error, clearError: () => setError(null) };
}
