import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { APICommunityCategory } from "@/data/community";

interface CategorySidebarProps {
  categories: APICommunityCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function CategorySidebar({ categories, selectedId, onSelect, isLoading }: CategorySidebarProps) {
  return (
    <Card className="h-fit">
      <CardContent className="space-y-2 p-3">
        <p className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Catégories</p>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            <CategoryButton label="Toutes les catégories" active={selectedId === ""} onClick={() => onSelect("")} />
            {categories.map((c) => (
              <CategoryButton
                key={c.id}
                label={c.name}
                color={c.color}
                description={c.description}
                active={selectedId === c.id}
                onClick={() => onSelect(selectedId === c.id ? "" : c.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CategoryButton({
  label,
  color,
  description,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  description?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={description ?? undefined}
      className={cn(
        "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted/50",
        active ? "border-primary/40 bg-muted font-medium" : "border-transparent"
      )}
    >
      {color ? (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
      ) : (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-muted-foreground/40" />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}