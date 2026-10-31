import { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentActions } from "./Actions";
import { CommentFlagBadges } from "./Badges";
import { EditCommentForm } from "./EditForm";
import { CommunityAvatar, fullDate, timeAgo, AuthorRoleBadge, MineBadge } from "@/components/pages/community/shared";
import type { APICommunityComment } from "@/data/community";

interface CommentItemProps {
  comment: APICommunityComment;
  canReply: boolean;
  isReply?: boolean;
  onReply: (comment: APICommunityComment) => void;
  onDelete: (comment: APICommunityComment) => void;
}

export function CommentItem({ comment, canReply, isReply = false, onReply, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const hidden = comment.status === "hidden";

  // Une réponse au commentaire racine n'a pas besoin de mention : il est affiché juste au-dessus
  const mention = comment.replyTo && comment.replyTo.commentId !== comment.parentId ? comment.replyTo : null;

  return (
    <div className={cn("flex gap-3", hidden && "opacity-80")}>
      <CommunityAvatar name={comment.author.name} photo={comment.author.photo} size={isReply ? "sm" : "md"} />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="text-sm font-medium text-foreground">{comment.author.name}</span>
          {comment.isMine && <MineBadge />}
          <AuthorRoleBadge role={comment.author.role} />
          <CommentFlagBadges comment={comment} />
          <span title={fullDate(comment.createdAt)}>{timeAgo(comment.createdAt)}</span>
          {comment.editedAt && <span title={fullDate(comment.editedAt)}>· modifié</span>}
        </div>

        {mention && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CornerDownRight className="h-3.5 w-3.5" />
            en réponse à <span className="font-medium text-foreground">{mention.authorName}</span>
          </p>
        )}

        {editing ? (
          <EditCommentForm comment={comment} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
        ) : (
          <>
            {/* Texte brut : seuls les retours à la ligne sont conservés */}
            <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">{comment.body}</p>

            {hidden && (
              <p className="rounded-md bg-destructive/5 p-2 text-xs text-destructive">
                Masqué par la modération{comment.hiddenReason ? ` : ${comment.hiddenReason}` : ""}
              </p>
            )}

            <CommentActions
              comment={comment}
              canReply={canReply}
              onReply={() => onReply(comment)}
              onEdit={() => setEditing(true)}
              onDelete={() => onDelete(comment)}
            />
          </>
        )}
      </div>
    </div>
  );
}