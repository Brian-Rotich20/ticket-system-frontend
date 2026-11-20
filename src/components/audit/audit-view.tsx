"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api";
import { fetchAudit, parseAuditParams, toAuditSearchParams, type AuditFilters, type EntityType } from "@/lib/audit";
import { useQuery } from "@/lib/use-query";
import { AuditTable } from "./audit-table";

export function AuditView() {
  const router = useRouter();
  const params = useSearchParams();

  const filters = useMemo(() => parseAuditParams(new URLSearchParams(params.toString())), [params]);
  const key = toAuditSearchParams(filters).toString();
  const filtered = Boolean(filters.entityType);

  const [ticketNo, setTicketNo] = useState(filters.entityId);
  const { data, error, loading, refetch } = useQuery((signal) => fetchAudit(filters, signal), [key]);

  function update(patch: Partial<AuditFilters>) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    if (next.entityType !== "TICKET") next.entityId = "";
    const qs = toAuditSearchParams(next).toString();
    router.replace(qs ? `/audit?${qs}` : "/audit", { scroll: false });
  }

  // keep the box in step with the URL (back/forward, links from a ticket)
  useEffect(() => {
    setTicketNo((v) => (v === filters.entityId ? v : filters.entityId));
  }, [filters.entityId]);

  // typing a ticket number updates the URL after a short pause
  useEffect(() => {
    if (ticketNo === filters.entityId) return;
    const timer = setTimeout(() => update({ entityId: ticketNo.replace(/\D/g, "") }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Audit log</h1>
          <p className="mt-1 text-sm text-slate-500" aria-live="polite">
            {data ? `${data.total} ${data.total === 1 ? "event" : "events"}` : "Loading events"}
          </p>
        </div>
        <Button variant="secondary" onClick={refetch} loading={loading && Boolean(data)}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-[220px_220px_auto]">
        <SelectField
          label="Show"
          name="entityType"
          value={filters.entityType ?? ""}
          onChange={(e) => update({ entityType: (e.target.value || undefined) as EntityType | undefined })}
        >
          <option value="">Everything</option>
          <option value="TICKET">Ticket activity</option>
          <option value="USER">Accounts created</option>
        </SelectField>

        {filters.entityType === "TICKET" ? (
          <Field
            label="Ticket number"
            name="ticketNo"
            inputMode="numeric"
            placeholder="e.g. 12"
            value={ticketNo}
            onChange={(e) => setTicketNo(e.target.value.replace(/\D/g, ""))}
          />
        ) : null}

        {filtered ? (
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => router.replace("/audit", { scroll: false })}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{errorMessage(error)}</span>
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-medium text-slate-900">{filtered ? "No events match these filters" : "No activity yet"}</p>
          <p className="mt-1 text-sm text-slate-500">{filtered ? "Try a different ticket number or clear the filters." : "Actions on tickets will be recorded here."}</p>
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <AuditTable items={data.items} loading={loading} />
          <Pagination page={data.page} totalPages={data.totalPages} onPage={(p) => update({ page: p })} />
        </>
      ) : null}
    </div>
  );
}