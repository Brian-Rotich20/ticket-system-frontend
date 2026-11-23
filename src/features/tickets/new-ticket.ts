import type { ContactChoice } from '@/features/contacts/components/contact-picker';
import { isValidPhone, normalizePhone } from '@/features/contacts/api';
import { LIMITS } from '@/lib/constants/tickets';
import type { Channel, Priority, TicketType } from '@/types/api';
import type { CreateTicketInput } from './api';

export interface NewTicketForm {
  contact: ContactChoice;
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  channel: Channel | '';
  orderRef: string;
  assigneeId: string;
}

export type NewTicketErrors = Partial<Record<'contact' | 'name' | 'phone' | 'email' | 'title' | 'description' | 'channel' | 'orderRef', string>>;

export const emptyTicketForm = (): NewTicketForm => ({
  contact: { mode: 'existing', contact: null },
  title: '',
  description: '',
  type: 'OTHER',
  priority: 'NORMAL',
  channel: '',
  orderRef: '',
  assigneeId: '',
});

/** Validates the form and builds the exact POST /tickets body of the v2 API. */
export function buildTicketRequest(f: NewTicketForm): { input: CreateTicketInput; errors?: never } | { errors: NewTicketErrors; input?: never } {
  const errors: NewTicketErrors = {};
  const title = f.title.trim();
  const description = f.description.trim();
  const orderRef = f.orderRef.trim();

  if (f.contact.mode === 'existing' && !f.contact.contact) errors.contact = 'Choose the customer, or add them as a new contact.';
  if (f.contact.mode === 'new') {
    if (!f.contact.name.trim()) errors.name = 'Enter the customer name.';
    if (!isValidPhone(f.contact.phone)) errors.phone = 'Enter a phone number of 7 to 15 digits.';
    if (f.contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contact.email.trim())) errors.email = 'Enter a valid email or leave it empty.';
  }
  if (!title) errors.title = 'Give the ticket a short subject.';
  else if (title.length > LIMITS.title) errors.title = `Keep the subject under ${LIMITS.title} characters.`;
  if (!description) errors.description = 'Describe the issue.';
  else if (description.length > LIMITS.description) errors.description = `Keep the description under ${LIMITS.description} characters.`;
  if (!f.channel) errors.channel = 'Where did the customer contact you?';
  if (orderRef.length > LIMITS.orderRef) errors.orderRef = `Keep the order reference under ${LIMITS.orderRef} characters.`;
  if (Object.keys(errors).length > 0) return { errors };

  const common = {
    title,
    description,
    type: f.type,
    priority: f.priority,
    channel: f.channel as Channel,
    ...(orderRef ? { orderRef } : {}),
    ...(f.assigneeId ? { assigneeId: f.assigneeId } : {}),
  };
  if (f.contact.mode === 'existing') return { input: { ...common, contactId: f.contact.contact!.contactId } };
  const email = f.contact.email.trim().toLowerCase();
  return { input: { ...common, contact: { name: f.contact.name.trim(), phone: normalizePhone(f.contact.phone), ...(email ? { email } : {}) } } };
}
