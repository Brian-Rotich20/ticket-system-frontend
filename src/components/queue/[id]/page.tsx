import type { Metadata } from "next";
import type { ComponentType } from "react";
import { TicketDetail } from "@/components/tickets/ticket-detail";

export const metadata: Metadata = { title: "Ticket · Support Desk" };

const QueueTicketDetail = TicketDetail as unknown as ComponentType<{
  backHref: string;
  backLabel: string;
  viewer: "staff";
}>;

export default function QueueTicketPage() {
  return <QueueTicketDetail backHref="/queue" backLabel="Queue" viewer="staff" />;
}