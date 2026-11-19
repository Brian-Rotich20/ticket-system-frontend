"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileButton } from "@/components/ui/file-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/auth-context";
import { errorMessage } from "@/lib/api";
import {
  ACCEPT,
  ALLOWED_HINT,
  MAX_FILES_PER_TICKET,
  MAX_FILE_BYTES,
  listAttachments,
  uploadAttachment,
  validateFile,
} from "@/lib/attachments";
import { useQuery } from "@/lib/use-query";
import { AttachmentItem } from "./attachment-item";

type AttachmentListProps = {
  ticketId: number;
  /** Closed tickets are read-only: files can still be downloaded but not added. */
  closed: boolean;
  /** Bump to reload the list (the page's Refresh button). */
  refreshKey: number;
};

export function AttachmentList({ ticketId, closed, refreshKey }: AttachmentListProps) {
  const user = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data, error, loading, refetch, setData } = useQuery(
    (signal) => listAttachments(ticketId, signal),
    [ticketId, refreshKey]
  );

  const count = data?.length ?? 0;

  async function handleFiles(files: File[]) {
    setUploadError(null);
    setUploading(true);

    const failures: string[] = [];
    let current = count;
    for (const file of files) {
      const problem = validateFile(file, current);
      if (problem) {
        failures.push(`${file.name}: ${problem}`);
        continue;
      }
      try {
        const saved = await uploadAttachment(ticketId, file);
        setData((prev) => [...(prev ?? []), saved]);
        current += 1;
      } catch (err) {
        failures.push(`${file.name}: ${errorMessage(err)}`);
      }
    }

    setUploading(false);
    if (failures.length > 0) setUploadError(failures.join("\n"));
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            Files{data ? <span className="ml-2 text-sm font-normal text-slate-500">{count}</span> : null}
          </h2>
          {!closed ? (
            <p className="mt-0.5 text-xs text-slate-500">
              {ALLOWED_HINT} · up to {MAX_FILE_BYTES / 1024 / 1024} MB each · max {MAX_FILES_PER_TICKET} files
            </p>
          ) : null}
        </div>

        {!closed ? (
          <FileButton accept={ACCEPT} multiple loading={uploading} onFiles={handleFiles}>
            {uploading ? "Uploading…" : "Add files"}
          </FileButton>
        ) : null}
      </div>

      {uploadError ? (
        <Alert>
          <span className="whitespace-pre-line">{uploadError}</span>
        </Alert>
      ) : null}

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
          <Skeleton className="h-14 w-full" />
        </div>
      ) : null}

      {data && data.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
          {closed ? "No files were attached to this ticket." : "No files yet. Add screenshots, PDFs or logs that help us understand the issue."}
        </p>
      ) : null}

      {data && data.length > 0 ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl ring-1 ring-slate-200">
          {data.map((a) => (
            <AttachmentItem key={a.attachmentId} attachment={a} isOwn={a.uploadedBy === user.id} />
          ))}
        </ul>
      ) : null}
    </Card>
  );
}