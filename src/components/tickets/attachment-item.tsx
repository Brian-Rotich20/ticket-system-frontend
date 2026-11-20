"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { downloadAttachment, fileTypeLabel } from "@/lib/attachments";
import type { TicketAttachment } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type AttachmentItemProps = {
  attachment: TicketAttachment;
  uploader: string;
};

export function AttachmentItem({ attachment, uploader }: AttachmentItemProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    setBusy(true);
    setError(null);
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
        {fileTypeLabel(attachment.fileType)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900" title={attachment.fileName}>
          {attachment.fileName}
        </p>
        <p className="text-xs text-slate-500">
          Added by {uploader} · {formatDate(attachment.createdAt)}
        </p>
        {error ? (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>

      <Button variant="secondary" onClick={onDownload} loading={busy} aria-label={`Download ${attachment.fileName}`}>
        Download
      </Button>
    </li>
  );
}