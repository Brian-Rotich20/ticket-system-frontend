import { Avatar } from "@/components/ui/avatar";
import type { TicketComment } from "@/lib/types";
import { cx, formatDate } from "@/lib/utils";

type CommentItemProps = {
  comment: TicketComment;
  isOwn: boolean;
};

export function CommentItem({ comment, isOwn }: CommentItemProps) {
  const fromSupport = comment.authorRole !== "CUSTOMER";

  return (
    <li className={cx("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar name={comment.authorName} tone={isOwn ? "indigo" : "slate"} />

      <div className="min-w-0 max-w-[85%]">
        <div className={cx("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500", isOwn && "justify-end")}>
          <span className="font-medium text-slate-700">{isOwn ? "You" : comment.authorName}</span>
          {fromSupport && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Support</span>
          )}
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
        </div>

        <div
          className={cx(
            "mt-1 whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-left text-sm leading-6",
            isOwn ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-900"
          )}
        >
          {comment.text}
        </div>
      </div>
    </li>
  );
}