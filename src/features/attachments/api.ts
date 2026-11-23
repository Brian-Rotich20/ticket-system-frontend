import { api, request } from '@/lib/api/client';
import { UPLOAD_TIMEOUT_MS } from '@/lib/config';
import type { Attachment, Visibility } from '@/types/api';

/** Keep in sync with the backend (MAX_UPLOAD_BYTES, MAX_ATTACHMENTS_PER_TICKET, allowed types). */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_TICKET = 10;

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.log': 'text/plain',
};
export const ACCEPT = Object.keys(MIME_BY_EXT).join(',');
export const ALLOWED_HINT = 'PNG, JPG, WebP, GIF, PDF, TXT or LOG';

const extensionOf = (name: string) => {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
};

/** A message when the file should not be uploaded, or null when it is fine. */
export function validateFile(file: File, existingCount: number): string | null {
  if (existingCount >= MAX_FILES_PER_TICKET) return `This ticket already has the maximum of ${MAX_FILES_PER_TICKET} files.`;
  if (!MIME_BY_EXT[extensionOf(file.name)]) return `Unsupported file type. Use ${ALLOWED_HINT}.`;
  if (file.size === 0) return 'The file is empty.';
  if (file.size > MAX_FILE_BYTES) return `Too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB).`;
  return null;
}

/** Browsers report an empty type for .log files, but the backend needs an explicit one. */
const withMimeType = (file: File) => new File([file], file.name, { type: MIME_BY_EXT[extensionOf(file.name)] });

const TYPE_LABEL: Record<string, string> = { 'image/png': 'PNG', 'image/jpeg': 'JPG', 'image/webp': 'WEBP', 'image/gif': 'GIF', 'application/pdf': 'PDF', 'text/plain': 'TXT' };
export const fileTypeLabel = (mime: string) => TYPE_LABEL[mime] ?? 'FILE';

export const listAttachments = (ticketId: number, signal?: AbortSignal) => api<Attachment[]>(`/api/v1/tickets/${ticketId}/attachments`, { signal });

/** multipart/form-data: the FormData body is sent as is and the browser sets the boundary. */
export function uploadAttachment(ticketId: number, file: File, visibility: Visibility) {
  const formData = new FormData();
  formData.append('file', withMimeType(file));
  return api<Attachment>(`/api/v1/tickets/${ticketId}/attachments?visibility=${visibility}`, { method: 'POST', formData, timeoutMs: UPLOAD_TIMEOUT_MS });
}

export const deleteAttachment = (id: number) => api(`/api/v1/attachments/${id}`, { method: 'DELETE' });

/** Hands a downloaded blob to the browser as a file. */
export function saveBlob(blob: Blob, fileName: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/** Authorised download: fetched with the session and organization headers, then saved. */
export async function downloadAttachment(attachment: Attachment): Promise<void> {
  const res = await request(attachment.url);
  saveBlob(await res.blob(), attachment.fileName);
}
