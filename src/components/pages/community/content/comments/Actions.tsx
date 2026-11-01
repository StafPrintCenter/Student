import { CheckCircle2, Pencil, Reply, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentModerationAction } from "@/components/pages/community/content/moderation/CommentAction";
import { ReportAction } from "@/components/pages/community/content/moderation/report-action";
import { ReactionControl } from "../reactions/Control";
import { cn } from "@/lib/utils";
import type { APICommunityComment } from "@/data/community";

interface CommentActionsProps {
  comment: APICommunityComment;
  /** Les réponses sont autorisées sur la publication (ni verrouillée, ni masquée) */
  canReply: boolean;
  /** L'utilisateur peut désigner ce commentaire comme meilleure réponse */
  canMarkBest: boolean;
  onReply: () => void;
  onMarkBest: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CommentActions({
  comment,
  canReply,
  canMarkBest,
  onReply,
  onMarkBest,
  onEdit,
  onDelete,
}: CommentActionsProps) {
  const { permissions } = comment;

  return (
    <div className="-ml-2 flex flex-wrap items-center gap-x-1 gap-y-0.5">
      <ReactionControl
        variant="compact"
        target={{ kind: "comment", id: comment.id }}
        myReaction={comment.myReaction}
        reactions={comment.reactions}
        reactionsTotal={comment.reactionsTotal}
        canReact={permissions.canReact}
      />
      {canReply && permissions.canReply && <ActionButton icon={Reply} label="Répondre" onClick={onReply} />}
      {canMarkBest && <ActionButton icon={CheckCircle2} label="Meilleure réponse" tone="success" onClick={onMarkBest} />}
      {permissions.canEdit && <ActionButton icon={Pencil} label="Modifier" onClick={onEdit} />}
      {permissions.canDelete && <ActionButton icon={Trash2} label="Supprimer" tone="destructive" onClick={onDelete} />}
      {permissions.canReport && <ReportAction compact target={{ kind: "comment", id: comment.id }} noun="ce commentaire" />}
      <CommentModerationAction comment={comment} />
    </div>
  );
}

const toneClass = {
  default: "",
  success: "text-emerald hover:text-emerald",
  destructive: "text-destructive hover:text-destructive",
} as const;

function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: keyof typeof toneClass;
}) {
  return (
    <Button type="button" size="sm" variant="ghost" className={cn("h-7 px-2 text-xs", toneClass[tone])} onClick={onClick}>
      <Icon className="mr-1.5 h-3.5 w-3.5" /> {label}
    </Button>
  );
}