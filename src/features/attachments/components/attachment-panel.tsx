'use client';

import { useState } from 'react';
import { ErrorState, LoadingRows } from '@/components/shared/states';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { FileButton } from '@/components/ui/file-button';
import { Icon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/select-field';
import { useUser } from '@/context/auth-context';
import { useOrganization } from '@/context/organization-context';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils';
import type { Attachment, Visibility } from '@/types/api';
import { ACCEPT, ALLOWED_HINT, MAX_FILE_BYTES, MAX_FILES_PER_TICKET, deleteAttachment, downloadAttachment, fileTypeLabel, listAttachments, uploadAttachment, validateFile } from '../api';

function AttachmentRow({ attachment, canDelete, onDeleted }: { attachment: Attachment; canDelete: boolean; onDeleted: () => void }) {
  const [busy, setBusy] = useState<'download' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: 'download' | 'delete') {
    setBusy(kind);
    setError(null);
    try {
      if (kind === 'download') await downloadAttachment(attachment);
      else {
        await deleteAttachment(attachment.attachmentId);
        onDeleted();
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-hover text-[11px] font-semibold text-muted">{fileTypeLabel(attachment.fileType)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink" title={attachment.fileName}>
          {attachment.fileName}
        </p>
        <p className="text-xs text-muted">{formatDate(attachment.createdAt)}</p>
        {error ? (
          <p role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
      <Badge tone={attachment.visibility === 'PUBLIC' ? 'info' : 'note'}>{attachment.visibility === 'PUBLIC' ? 'Shared with customer' : 'Internal'}</Badge>
      <Button variant="outline" size="sm" onClick={() => run('download')} loading={busy === 'download'} aria-label={`Download ${attachment.fileName}`}>
        Download
      </Button>
      {canDelete ? (
        <ConfirmButton variant="danger" size="sm" confirmLabel="Delete" loading={busy === 'delete'} onConfirm={() => run('delete')}>
          Delete
        </ConfirmButton>
      ) : null}
    </li>
  );
}

export function AttachmentPanel({ ticketId, closed }: { ticketId: number; closed: boolean }) {
  const user = useUser();
  const { role } = useOrganization();
  const { data, error, loading, refetch, setData } = useQuery((signal) => listAttachments(ticketId, signal), [ticketId]);
  const [visibility, setVisibility] = useState<Visibility>('INTERNAL');
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const count = data?.length ?? 0;

  async function handleFiles(files: File[]) {
    setUploadError(null);
    const failures: string[] = [];
    let current = count;
    for (const file of files) {
      const problem = validateFile(file, current);
      if (problem) {
        failures.push(`${file.name}: ${problem}`);
        continue;
      }
      setUploading(file.name);
      try {
        const saved = await uploadAttachment(ticketId, file, visibility);
        setData((prev) => [...(prev ?? []), saved]);
        current += 1;
      } catch (err) {
        failures.push(`${file.name}: ${errorMessage(err)}`);
      }
    }
    setUploading(null);
    if (failures.length > 0) setUploadError(failures.join('\n'));
  }

  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Icon name="paperclip" className="h-4 w-4 text-muted" /> Files {data ? <span className="text-sm font-normal text-muted">{count}</span> : null}
          </span>
        }
        description={closed ? undefined : `${ALLOWED_HINT} · up to ${MAX_FILE_BYTES / 1024 / 1024} MB each · max ${MAX_FILES_PER_TICKET} files`}
      />

      {!closed ? (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-56">
            <SelectField label="Who can see new files" name="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
              <option value="INTERNAL">Internal (team only)</option>
              <option value="PUBLIC">Shared with the customer</option>
            </SelectField>
          </div>
          <FileButton accept={ACCEPT} multiple loading={uploading !== null} onFiles={handleFiles}>
            {uploading ? `Uploading ${uploading}…` : 'Add files'}
          </FileButton>
        </div>
      ) : null}

      {uploadError ? (
        <Alert className="mb-4">
          <span className="whitespace-pre-line">{uploadError}</span>
        </Alert>
      ) : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {loading && !data ? <LoadingRows rows={1} className="h-14" /> : null}
      {data && data.length === 0 ? <p className="rounded-control bg-canvas px-4 py-5 text-center text-sm text-muted">No files yet.</p> : null}
      {data && data.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-control border border-line">
          {data.map((a) => (
            <AttachmentRow
              key={a.attachmentId}
              attachment={a}
              canDelete={!closed && (a.uploadedBy === user.id || role === 'ADMIN')}
              onDeleted={() => setData((prev) => (prev ?? []).filter((x) => x.attachmentId !== a.attachmentId))}
            />
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
