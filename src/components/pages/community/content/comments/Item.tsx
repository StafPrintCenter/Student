import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CornerDownRight, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CommentActions } from "./Actions";
import { EditCommentForm } from "./EditForm";
import { useCommentsContext } from "./Context";
import { MarkBestAnswerDialog } from "./MarkBestAnswer";
import { CommunityAvatar, fullDate, timeAgo, AuthorRoleBadge, MineBadge, useCommentFocus } from "@/components/pages/community/shared";
import type { APICommunityComment } from "@/data/community";

function CommentFlagBadges({
  comment,
}: {
  comment: Pick<APICommunityComment, "isPostAuthor" | "isBestAnswer" | "status">;
}) {
  return (
    <>
      {comment.isPostAuthor && (
        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
          Auteur
        </Badge>
      )}
      {comment.isBestAnswer && (
        <Badge variant="outline" className="gap-1 border-emerald/40 bg-emerald/15 text-[10px] text-emerald">
          <CheckCircle2 className="h-3 w-3" /> Meilleure réponse
        </Badge>
      )}
      {comment.status === "hidden" && (
        <Badge variant="outline" className="gap-1 border-destructive/40 bg-destructive/10 text-[10px] text-destructive">
          <EyeOff className="h-3 w-3" /> Masqué
        </Badge>
      )}
    </>
  );
}

interface CommentItemProps {
  comment: APICommunityComment;
  canReply: boolean;
  isReply?: boolean;
  onReply: (comment: APICommunityComment) => void;
  onDelete: (comment: APICommunityComment) => void;
}

export function CommentItem({ comment, canReply, isReply = false, onReply, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const { postId, canMarkBest } = useCommentsContext();
  const [markingBest, setMarkingBest] = useState(false);
  const canBeBest = canMarkBest && comment.parentId === null && comment.status === "published" && !comment.isBestAnswer;
  const hidden = comment.status === "hidden";
  const focus = useCommentFocus();
  const isTarget = focus?.commentId === comment.id;
  const highlighted = isTarget && !!focus?.active;
  const ref = useRef<HTMLDivElement>(null);

  // Une réponse au commentaire racine n'a pas besoin de mention : il est affiché juste au-dessus
  const mention = comment.replyTo && comment.replyTo.commentId !== comment.parentId ? comment.replyTo : null;

  useEffect(() => {
    if (!isTarget || !focus?.active) return;
    focus.onShown();
    const timer = setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTarget]);

  return (
    <div
      ref={ref}
      id={`comment-${comment.id}`}
      className={cn(
        "-mx-2 -my-1 flex gap-3 rounded-lg px-2 py-1 transition-[background-color,box-shadow] duration-500",
        hidden && "opacity-80",
        highlighted && "bg-primary/10 ring-2 ring-primary/40"
      )}
    >
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
              canMarkBest={canBeBest}
              onReply={() => onReply(comment)}
              onMarkBest={() => setMarkingBest(true)}
              onEdit={() => setEditing(true)}
              onDelete={() => onDelete(comment)}
            />

            {markingBest && <MarkBestAnswerDialog postId={postId} comment={comment} onClose={() => setMarkingBest(false)} />}
          </>
        )}
      </div>
    </div>
  );
}