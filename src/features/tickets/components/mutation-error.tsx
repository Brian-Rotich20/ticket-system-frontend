import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { MutationError } from '../use-ticket-mutation';

export function MutationErrorAlert({ error, onReload }: { error: MutationError | null; onReload: () => void }) {
  if (!error) return null;
  return (
    <Alert>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{error.message}</span>
        {error.conflict ? (
          <Button variant="outline" size="sm" onClick={onReload}>
            Reload ticket
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}
