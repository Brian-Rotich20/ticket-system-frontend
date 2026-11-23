/**
 * The contact form has no backend endpoint: it opens the visitor's email app with the message filled in.
 * Kept pure so it can be tested.
 */
export interface ContactMessage {
  name: string;
  email: string;
  business: string;
  topic: string;
  message: string;
}

export function buildContactMailto(to: string, m: ContactMessage): string {
  const subject = `${m.topic}: ${m.business.trim() || m.name.trim()}`;
  const body = [m.message.trim(), '', '—', `Name: ${m.name.trim()}`, `Email: ${m.email.trim()}`, m.business.trim() ? `Business: ${m.business.trim()}` : null]
    .filter((line) => line !== null)
    .join('\n');
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const whatsappLink = (number: string, text?: string) => `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
