import { Pencil, Reply, ThumbsUp, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { APICommunityComment } from "@/data/community";

interface CommentActionsProps {
  comment: APICommunityComment;
  /** Les réponses sont autorisées sur la publication (ni verrouillée, ni masquée) */
  canReply: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CommentActions({ comment, canReply, onReply, onEdit, onDelete }: CommentActionsProps) {
  const { permissions } = comment;

  return (
    <div className="-ml-2 flex flex-wrap items-center gap-1">
      {comment.reactionsTotal > 0 && (
        <span
          className={cn(
            "mr-1 inline-flex items-center gap-1 px-2 text-xs text-muted-foreground",
            comment.myReaction && "text-primary"
          )}
          title="Réactions"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span className="tabular-nums">{comment.reactionsTotal}</span>
        </span>
      )}
      {canReply && permissions.canReply && <ActionButton icon={Reply} label="Répondre" onClick={onReply} />}
      {permissions.canEdit && <ActionButton icon={Pencil} label="Modifier" onClick={onEdit} />}
      {permissions.canDelete && <ActionButton icon={Trash2} label="Supprimer" destructive onClick={onDelete} />}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn("h-7 px-2 text-xs", destructive && "text-destructive hover:text-destructive")}
      onClick={onClick}
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" /> {label}
    </Button>
  );
}