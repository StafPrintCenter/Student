import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationBarProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export function PaginationBar({ page, lastPage, onChange, disabled }: PaginationBarProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <Button size="sm" variant="outline" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
      </Button>
      <span className="text-xs text-muted-foreground">
        Page {page} / {lastPage}
      </span>
      <Button size="sm" variant="outline" disabled={disabled || page >= lastPage} onClick={() => onChange(page + 1)}>
        Suivant <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}