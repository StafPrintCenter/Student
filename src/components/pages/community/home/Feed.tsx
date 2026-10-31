import { useState } from "react";
import { MessagesSquare, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard, hasActiveFilters, toListParams, type CommunityFilters } from "@/components/pages/community/home";
import { PaginationBar } from "@/components/pages/community/shared";
import { cn } from "@/lib/utils";
import { useCommunityPostsList } from "@/stores/useCommunityPostsStore";
import type { APICommunityPostListItem } from "@/data/community";

const PER_PAGE = 12;

interface CommunityFeedProps {
  filters: CommunityFilters;
  onCreate: () => void;
  onEdit: (postId: string) => void;
  onDelete: (post: APICommunityPostListItem) => void;
}

export function CommunityFeed({ filters, onCreate, onEdit, onDelete }: CommunityFeedProps) {
  const query = filters.query.trim();

  // La page repart de 1 dès qu'un filtre change, sans effet ni requête superflue
  const signature = JSON.stringify(toListParams(filters, query, 1, PER_PAGE));
  const [pageState, setPageState] = useState({ signature, page: 1 });
  const page = pageState.signature === signature ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ signature, page: next });

  const { items, meta, isLoading, isFetching, isError, refetch } = useCommunityPostsList(
    toListParams(filters, query, page, PER_PAGE)
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={MessagesSquare}
          title="Impossible de charger les publications"
          description="Vérifiez votre connexion, puis réessayez."
        />
        <div className="flex justify-center">
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    const filtered = hasActiveFilters(filters);
    return (
      <EmptyState
        icon={MessagesSquare}
        title={filtered ? "Aucune publication ne correspond" : "Aucune publication pour le moment"}
        description={
          filtered ? "Modifiez vos filtres pour élargir la recherche." : "Lancez la conversation avec votre première publication."
        }
        action={
          <Button onClick={onCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Publier
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {meta && (
        <p className="text-xs text-muted-foreground">
          {meta.total} publication{meta.total > 1 ? "s" : ""}
          {query && (
            <>
              {" "}
              pour « <span className="font-medium text-foreground">{query}</span> »
            </>
          )}
        </p>
      )}

      <div className={cn("space-y-3 transition-opacity", isFetching && "opacity-60")}>
        {items.map((post) => (
          <PostCard key={post.id} post={post} onEdit={() => onEdit(post.id)} onDelete={() => onDelete(post)} />
        ))}
      </div>

      <PaginationBar page={page} lastPage={meta?.lastPage ?? 1} onChange={setPage} disabled={isFetching} />
    </div>
  );
}