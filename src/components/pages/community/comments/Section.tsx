import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { COMMENTS_PER_PAGE, REPLIES_PER_PAGE, CommentFocusProvider, useCommentFocusState } from "@/components/pages/community/shared";
import { CommentComposerCard, CommentsList, CommentsToolbar, DeleteCommentDialog } from "./";
import { useCommentLocator } from "@/stores/useCommunityCommentLocatorStore";
import type { APICommunityComment, APICommunityPostDetail, CommunityAuthorRole, CommunityCommentSort } from "@/data/community";

interface CommentsSectionProps {
  post: APICommunityPostDetail;
  /** Commentaire à afficher en priorité (paramètre ?comment= de l'URL) */
  targetCommentId?: string;
}

export function CommentsSection({ post, targetCommentId }: CommentsSectionProps) {
  const [sort, setSort] = useState<CommunityCommentSort>("oldest");
  const [authorRole, setAuthorRole] = useState<CommunityAuthorRole | "">("");
  const [deleting, setDeleting] = useState<APICommunityComment | null>(null);

  const locator = useCommentLocator({
    postId: post.id,
    commentId: targetCommentId,
    listPerPage: COMMENTS_PER_PAGE,
    repliesPerPage: REPLIES_PER_PAGE,
  });
  const focus = useCommentFocusState(targetCommentId, locator.location);

  useEffect(() => {
    if (locator.notFound) {
      toast.info("Ce commentaire est introuvable : il a peut-être été supprimé ou masqué.");
    } else if (locator.isError) {
      toast.error("Impossible de retrouver ce commentaire.");
    }
  }, [locator.notFound, locator.isError]);

  // Publication masquée : fermée à tous. Verrouillée : fermée, sauf aux modérateurs.
  const canComment =
    post.permissions.canComment && post.status === "published" && (!post.isLocked || post.permissions.canModerate);

  return (
    <CommentFocusProvider value={focus}>
      <section className="space-y-4">
        <CommentsToolbar
          count={post.commentsCount}
          sort={sort}
          authorRole={authorRole}
          onSortChange={setSort}
          onAuthorRoleChange={setAuthorRole}
        />

        <CommentComposerCard post={post} canComment={canComment} />

        {locator.isLocating ? (
          // La liste attend de savoir sur quelle page s'ouvrir
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <CommentsList
            postId={post.id}
            canComment={canComment}
            sort={sort}
            authorRole={authorRole}
            initialPage={locator.location?.rootPage}
            onDelete={setDeleting}
          />
        )}

        {deleting && <DeleteCommentDialog comment={deleting} onClose={() => setDeleting(null)} />}
      </section>
    </CommentFocusProvider>
  );
}