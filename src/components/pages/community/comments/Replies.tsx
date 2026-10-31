import { useState } from "react";

import { PaginationBar } from "@/components/pages/community/home";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentItem } from "./Item";
import { cn } from "@/lib/utils";
import { useCommunityReplies } from "@/stores/useCommunityCommentsStore";
import type { APICommunityComment } from "@/data/community";

const PER_PAGE = 12;

interface CommentRepliesProps {
  commentId: string;
  canReply: boolean;
  onReply: (comment: APICommunityComment) => void;
  onDelete: (comment: APICommunityComment) => void;
}

export function CommentReplies({ commentId, canReply, onReply, onDelete }: CommentRepliesProps) {
  const [page, setPage] = useState(1);
  const { items, meta, isLoading, isFetching, isError, refetch } = useCommunityReplies(commentId, {
    page,
    perPage: PER_PAGE,
  });

  if (isLoading) return <Skeleton className="h-16 w-full" />;

  if (isError) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-destructive">Impossible de charger les réponses.</span>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn("space-y-4 transition-opacity", isFetching && "opacity-60")}>
        {items.map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply canReply={canReply} onReply={onReply} onDelete={onDelete} />
        ))}
      </div>
      <PaginationBar page={page} lastPage={meta?.lastPage ?? 1} onChange={setPage} disabled={isFetching} />
    </div>
  );
}