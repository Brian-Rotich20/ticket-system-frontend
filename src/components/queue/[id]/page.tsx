import type { Metadata } from "next";
import { TicketWorkspace } from "@/components/queue/ticket-workspace";

export const metadata: Metadata = { title: "Ticket · Support Desk" };

export default function QueueTicketPage() {
  return <TicketWorkspace />;
}