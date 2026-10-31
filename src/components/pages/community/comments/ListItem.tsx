import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { PaginationBar } from "@/components/pages/community/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentThread } from "./Thread";
import { cn } from "@/lib/utils";
import { useCommunityComments } from "@/stores/useCommunityCommentsStore";
import type { APICommunityComment, CommunityAuthorRole, CommunityCommentSort } from "@/data/community";

const PER_PAGE = 12;

interface CommentsListProps {
  postId: string;
  canComment: boolean;
  sort: CommunityCommentSort;
  authorRole: CommunityAuthorRole | "";
  initialPage?: number;
  onDelete: (comment: APICommunityComment) => void;
}

export function CommentsList({ postId, canComment, sort, authorRole, initialPage = 1, onDelete }: CommentsListProps) {
  // La page repart de 1 dès que le tri ou le filtre change
  const signature = `${sort}|${authorRole}`;
  const [pageState, setPageState] = useState({ signature, page: initialPage });
  const page = pageState.signature === signature ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ signature, page: next });

  const { items, meta, isLoading, isFetching, isError, refetch } = useCommunityComments(postId, {
    page,
    perPage: PER_PAGE,
    sort,
    authorRole: authorRole || undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={MessageSquare}
          title="Impossible de charger les commentaires"
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
    return (
      <EmptyState
        icon={MessageSquare}
        title={authorRole ? "Aucun commentaire de ce type" : "Aucun commentaire pour le moment"}
        description={
          authorRole
            ? "Changez le filtre pour voir les autres commentaires."
            : canComment
              ? "Soyez le premier à réagir."
              : "Les commentaires apparaîtront ici."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn("space-y-3 transition-opacity", isFetching && "opacity-60")}>
        {items.map((comment) => (
          <CommentThread key={comment.id} postId={postId} comment={comment} canComment={canComment} onDelete={onDelete} />
        ))}
      </div>
      <PaginationBar page={page} lastPage={meta?.lastPage ?? 1} onChange={setPage} disabled={isFetching} />
    </div>
  );
}