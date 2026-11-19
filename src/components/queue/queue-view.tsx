"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/auth-context";
import { errorMessage } from "@/lib/api";
import {
  fetchQueue,
  hasActiveFilters,
  listAgents,
  parseQueueParams,
  toSearchParams,
  type QueueFilters,
} from "@/lib/queue";
import { useQuery } from "@/lib/use-query";
import { QueueFilterBar } from "./queue-filters";
import { QueueTable } from "./queue-table";

export function QueueView() {
  const user = useUser();
  const router = useRouter();
  const params = useSearchParams();

  // the URL is the single source of truth for every filter
  const filters = useMemo(() => parseQueueParams(new URLSearchParams(params.toString())), [params]);
  const key = toSearchParams(filters).toString();
  const active = hasActiveFilters(filters);

  const [searchState, setSearchState] = useState({ query: filters.q, value: filters.q });
  if (searchState.query !== filters.q) {
    setSearchState({
      query: filters.q,
      value: searchState.value.trim() === filters.q ? searchState.value : filters.q,
    });
  }
  const search = searchState.value;

  const { data, error, loading, refetch } = useQuery(
    (signal) => fetchQueue(filters, user.id, signal),
    [key, user.id]
  );
  const agents = useQuery((signal) => listAgents(signal), []);

  function update(patch: Partial<QueueFilters>) {
    const next = { ...filters, ...patch, page: patch.page ?? 1 }; // any filter change returns to page 1
    const qs = toSearchParams(next).toString();
    router.replace(qs ? `/queue?${qs}` : "/queue", { scroll: false });
  }

  // typing updates the URL after a short pause
  useEffect(() => {
    if (search.trim() === filters.q) return;
    const timer = setTimeout(() => update({ q: search.trim() }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function clearFilters() {
    setSearchState({ query: filters.q, value: "" });
    router.replace("/queue", { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Queue</h1>
          <p className="mt-1 text-sm text-slate-500" aria-live="polite">
            {data ? `${data.total} ${data.total === 1 ? "ticket" : "tickets"}` : "Loading tickets"}
            {data && data.totalPages > 1 ? ` · Page ${data.page} of ${data.totalPages}` : ""}
          </p>
        </div>
        <Button variant="secondary" onClick={refetch} loading={loading && Boolean(data)}>
          Refresh
        </Button>
      </div>

      <QueueFilterBar
        filters={filters}
        search={search}
        onSearch={(value) => setSearchState({ query: filters.q, value })}
        onChange={update}
        onClear={clearFilters}
        hasActive={active}
        agents={agents.data ?? []}
        meId={user.id}
        showMe={user.role === "AGENT"}
      />

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
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-medium text-slate-900">
            {active ? "No tickets match your filters" : filters.page > 1 ? "No tickets on this page" : "The queue is empty"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {active ? "Try a different search or clear the filters." : "New tickets will show up here."}
          </p>
          {active || filters.page > 1 ? (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={clearFilters}>
                {active ? "Clear filters" : "Back to the first page"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <QueueTable items={data.items} loading={loading} />

          {data.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" disabled={filters.page <= 1} onClick={() => update({ page: filters.page - 1 })}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={filters.page >= data.totalPages}
                onClick={() => update({ page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}