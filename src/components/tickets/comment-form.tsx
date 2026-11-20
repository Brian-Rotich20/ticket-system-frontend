"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextAreaField } from "@/components/ui/textarea-field";
import { errorMessage } from "@/lib/api";
import { COMMENT_MAX, addComment } from "@/lib/comments";
import type { TicketComment } from "@/lib/types";

type CommentFormProps = {
  ticketId: number;
  onPosted: (comment: TicketComment) => void;
  label?: string;
  placeholder?: string;
};

export function CommentForm({ ticketId, onPosted, label="Reply", placeholder="Write a message to the support team" }: CommentFormProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const trimmed = text.trim();
  const tooLong = trimmed.length > COMMENT_MAX;

  async function submit() {
    if (!trimmed || tooLong || busy) return;
    setBusy(true);
    setError(null);
    try {
      const comment = await addComment(ticketId, trimmed);
      setText("");
      onPosted(comment);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submit();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <Alert>{error}</Alert>}

      <TextAreaField
        label={label}
        name="reply"
        rows={3}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        error={tooLong ? `Keep your message under ${COMMENT_MAX} characters.` : undefined}
        hint="Press Ctrl+Enter to send"
      />

      <div className="flex justify-end">
        <Button type="submit" loading={busy} disabled={!trimmed || tooLong}>
          Send
        </Button>
      </div>
    </form>
  );
}