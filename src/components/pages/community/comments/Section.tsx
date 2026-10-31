import { useState } from "react";

import { CommentComposerCard } from "./ComposerCard";
import { CommentsList } from "./ListItem";
import { CommentsToolbar } from "./Toolbar";
import { DeleteCommentDialog } from "./DeleteDialog";
import type {
  APICommunityComment,
  APICommunityPostDetail,
  CommunityAuthorRole,
  CommunityCommentSort,
} from "@/data/community";

export function CommentsSection({ post }: { post: APICommunityPostDetail }) {
  const [sort, setSort] = useState<CommunityCommentSort>("oldest");
  const [authorRole, setAuthorRole] = useState<CommunityAuthorRole | "">("");
  const [deleting, setDeleting] = useState<APICommunityComment | null>(null);

  // Publication masquée : fermée à tous. Verrouillée : fermée, sauf aux modérateurs.
  const canComment =
    post.permissions.canComment && post.status === "published" && (!post.isLocked || post.permissions.canModerate);

  return (
    <section className="space-y-4">
      <CommentsToolbar
        count={post.commentsCount}
        sort={sort}
        authorRole={authorRole}
        onSortChange={setSort}
        onAuthorRoleChange={setAuthorRole}
      />

      <CommentComposerCard post={post} canComment={canComment} />

      <CommentsList postId={post.id} canComment={canComment} sort={sort} authorRole={authorRole} onDelete={setDeleting} />

      {deleting && <DeleteCommentDialog comment={deleting} onClose={() => setDeleting(null)} />}
    </section>
  );
}