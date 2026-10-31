import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentItem, CommentReplies, NewCommentForm } from "./";
import { useCommentFocus } from "@/components/pages/community/shared";
import { cn } from "@/lib/utils";
import type { APICommunityComment } from "@/data/community";

interface CommentThreadProps {
  postId: string;
  comment: APICommunityComment;
  canComment: boolean;
  onDelete: (comment: APICommunityComment) => void;
}

/** Un commentaire de premier niveau et son fil de réponses (2 niveaux au maximum) */
export function CommentThread({ postId, comment, canComment, onDelete }: CommentThreadProps) {
  const focus = useCommentFocus();

  const focusedReplyPage =
    focus && focus.rootId === comment.id && focus.commentId !== comment.id ? focus.replyPage : null;
  const [expanded, setExpanded] = useState(focusedReplyPage !== null);

  // Commentaire auquel la réponse en cours s'adresse (le racine ou l'une de ses réponses)
  const [replyTarget, setReplyTarget] = useState<APICommunityComment | null>(null);

  const count = comment.repliesCount;
  const showReplies = expanded && count > 0;

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-border bg-card p-4",
        comment.isBestAnswer && "border-emerald/40 bg-emerald/5"
      )}
    >
      <CommentItem comment={comment} canReply={canComment} onReply={setReplyTarget} onDelete={onDelete} />

      {count > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="ml-13 h-7 px-2 text-xs"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp className="mr-1.5 h-3.5 w-3.5" /> : <ChevronDown className="mr-1.5 h-3.5 w-3.5" />}
          {expanded ? "Masquer les réponses" : `Voir ${count} réponse${count > 1 ? "s" : ""}`}
        </Button>
      )}

      {(showReplies || replyTarget) && (
        <div className="ml-4 space-y-4 border-l pl-4 sm:ml-6 sm:pl-5">
          {showReplies && (
            <CommentReplies
              commentId={comment.id}
              initialPage={focusedReplyPage ?? 1}
              canReply={canComment}
              onReply={setReplyTarget}
              onDelete={onDelete}
            />
          )}

          {replyTarget && (
            <NewCommentForm
              postId={postId}
              replyTo={{ id: replyTarget.id, authorName: replyTarget.author.name }}
              autoFocus
              onCancel={() => setReplyTarget(null)}
              onDone={() => {
                setReplyTarget(null);
                setExpanded(true);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}