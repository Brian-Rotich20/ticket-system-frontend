import { Badge } from '@/components/ui/badge';
import { CHANNEL_LABEL, PRIORITY_LABEL, PRIORITY_TONE, STATUS_LABEL, STATUS_TONE, TYPE_LABEL } from '@/lib/constants/tickets';
import type { Channel, Priority, TicketStatus, TicketType } from '@/types/api';

export const StatusBadge = ({ status }: { status: TicketStatus }) => <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
export const PriorityBadge = ({ priority }: { priority: Priority }) => <Badge tone={PRIORITY_TONE[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
export const TypeBadge = ({ type }: { type: TicketType }) => <Badge tone="neutral">{TYPE_LABEL[type]}</Badge>;
export const ChannelBadge = ({ channel }: { channel: Channel }) => <Badge tone="neutral">{CHANNEL_LABEL[channel]}</Badge>;

/** "#42": the per-organization ticket number. */
export const ticketRef = (n: number) => `#${n}`;
