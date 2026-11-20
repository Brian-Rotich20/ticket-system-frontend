"use client";

import { useRef } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/auth-context";
import { errorMessage } from "@/lib/api";
import { THREAD_PAGE_SIZE, listComments } from "@/lib/comments";
import type { TicketComment } from "@/lib/types";
import { useQuery } from "@/lib/use-query";
import { cx } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

type CommentThreadProps = {
  ticketId: number;
  closed: boolean;
  refreshKey: number;
  viewer?: "customer" | "staff";
};

export function CommentThread({ ticketId, closed, refreshKey, viewer="customer" }: CommentThreadProps) {
  const user = useUser();
  const endRef = useRef<HTMLDivElement>(null);

  const { data, error, loading, refetch, setData } = useQuery(
    (signal) => listComments(ticketId, signal),
    [ticketId, refreshKey]
  );

  function handlePosted(comment: TicketComment) {
    setData((prev) =>
      prev
        ? { ...prev, items: [...prev.items, comment], total: prev.total + 1 }
        : { items: [comment], page: 1, pageSize: THREAD_PAGE_SIZE, total: 1, totalPages: 1 }
    );
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  const count = data?.total ?? 0;

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Conversation</h2>
        {data ? (
          <span className="text-xs text-slate-500">
            {count} {count === 1 ? "message" : "messages"}
          </span>
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
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="ml-auto h-14 w-1/2" />
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {closed ? "There are no messages on this ticket." :  viewer==="staff" ? "No messages yet. Write to the support team below." : "No messages yet. Write to the support team below."}
        </p>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          {data.total > data.items.length ? (
            <p className="text-xs text-slate-500">
              Showing the first {data.items.length} of {data.total} messages.
            </p>
          ) : null}
          <ol aria-label="Conversation" className={cx("space-y-5 transition-opacity", loading && "opacity-60")}>
            {data.items.map((c) => (
              <CommentItem key={c.commentId} comment={c} isOwn={c.authorId === user.id} />
            ))}
          </ol>
        </>
      ) : null}

      <div ref={endRef} />

      {closed ? (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p>This ticket is closed, so new messages cannot be added.</p>
          {viewer === "customer" ? (
            
          <div className="mt-3">
            <LinkButton href="/tickets/new" variant="secondary">
              Create a new ticket
            </LinkButton>
          </div>
          ): null}
        </div>
      ) : (
        <CommentForm 
        ticketId={ticketId} 
        onPosted={handlePosted} 
        label={viewer === "staff" ? "Reply to customer" : "Reply"}
        placeholder={viewer === "staff" ? "Write a message to the customer" : undefined}
        />
      )}
    </Card>
  );
}