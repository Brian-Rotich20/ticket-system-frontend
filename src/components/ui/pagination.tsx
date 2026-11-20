import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
};

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="mr-2 text-sm text-slate-500">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}