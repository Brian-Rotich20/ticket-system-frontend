import { api, request } from "@/lib/api";
import type { TicketAttachment } from "@/lib/types";

/** Keep in sync with the backend (MAX_UPLOAD_BYTES, MAX_ATTACHMENTS_PER_TICKET). */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_TICKET = 10;

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".log": "text/plain",
};

export const ACCEPT = Object.keys(MIME_BY_EXT).join(",");
export const ALLOWED_HINT = "PNG, JPG, WebP, GIF, PDF, TXT or LOG";

const extensionOf = (name: string) => {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
};

/** Returns a message when the file should not be uploaded, or null when it is fine. */
export function validateFile(file: File, existingCount: number): string | null {
  if (existingCount >= MAX_FILES_PER_TICKET) return `This ticket already has the maximum of ${MAX_FILES_PER_TICKET} files.`;
  if (!MIME_BY_EXT[extensionOf(file.name)]) return `Unsupported file type. Use ${ALLOWED_HINT}.`;
  if (file.size === 0) return "The file is empty.";
  if (file.size > MAX_FILE_BYTES) return `Too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB).`;
  return null;
}

/** Browsers report an empty type for .log files, but the backend needs an explicit one. */
function withMimeType(file: File): File {
  return new File([file], file.name, { type: MIME_BY_EXT[extensionOf(file.name)] });
}

const TYPE_LABEL: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WEBP",
  "image/gif": "GIF",
  "application/pdf": "PDF",
  "text/plain": "TXT",
};
export const fileTypeLabel = (mime: string) => TYPE_LABEL[mime] ?? "FILE";

export const listAttachments = (ticketId: number, signal?: AbortSignal) =>
  api<TicketAttachment[]>(`/api/v1/tickets/${ticketId}/attachments`, { signal });

export function uploadAttachment(ticketId: number, file: File) {
  const formData = new FormData();
  formData.append("file", withMimeType(file));
  return api<TicketAttachment>(`/api/v1/tickets/${ticketId}/attachments`, { method: "POST", formData });
}

/** Fetches the file with the session token, then hands the blob to the browser as a download. */
export async function downloadAttachment(attachment: TicketAttachment): Promise<void> {
  const res = await request(attachment.url);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}