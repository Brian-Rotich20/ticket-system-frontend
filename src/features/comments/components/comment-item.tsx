import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icons';
import { ROLE_LABEL } from '@/lib/constants/roles';
import { cx, formatDate } from '@/lib/utils';
import type { Comment } from '@/types/api';

/** Customer messages on the left, staff on the right; internal notes are amber and marked as private. */
export function CommentItem({ comment, isOwn }: { comment: Comment; isOwn: boolean }) {
  const fromCustomer = comment.authorType === 'CONTACT' || comment.authorRole === 'CUSTOMER';
  const internal = comment.visibility === 'INTERNAL';

  return (
    <li className={cx('flex gap-3', !fromCustomer && 'flex-row-reverse')}>
      <Avatar name={comment.authorName} tone={fromCustomer ? 'neutral' : isOwn ? 'primary' : 'secondary'} size="sm" />
      <div className={cx('min-w-0 max-w-[85%]', !fromCustomer && 'text-right')}>
        <div className={cx('flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted', !fromCustomer && 'justify-end')}>
          <span className="font-medium text-ink">{isOwn ? 'You' : comment.authorName}</span>
          <Badge tone={fromCustomer ? 'info' : 'neutral'}>{fromCustomer ? 'Customer' : ROLE_LABEL[comment.authorRole]}</Badge>
          {internal ? (
            <Badge tone="note">
              <Icon name="lock" className="h-3 w-3" /> Internal note
            </Badge>
          ) : null}
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
        </div>
        <div
          className={cx(
            'mt-1 inline-block whitespace-pre-wrap break-words rounded-card px-4 py-2.5 text-left text-sm leading-6',
            internal ? 'border border-note/20 bg-note-soft text-ink' : fromCustomer ? 'bg-hover text-ink' : 'bg-primary text-on-primary',
          )}
        >
          {comment.text}
        </div>
      </div>
    </li>
  );
}
