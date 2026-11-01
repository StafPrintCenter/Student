import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HideReasonDialog } from "./hide-reason-dialog";
import {
  communityCommentModerationMessages,
  type APICommunityComment,
  type CommunityCommentModerationAction,
} from "@/data/community";
import { useModerateCommunityComment } from "@/stores/useCommunityModerationStore";

/** Masquer / rétablir un commentaire. N'affiche rien sans permissions.canHide. */
export function CommentModerationAction({ comment }: { comment: APICommunityComment }) {
  const [hiding, setHiding] = useState(false);
  const moderate = useModerateCommunityComment();

  if (!comment.permissions.canHide) return null;

  const hidden = comment.status === "hidden";

  const run = (action: CommunityCommentModerationAction, reason?: string, onDone?: () => void) =>
    moderate.mutate(
      { id: comment.id, action, reason },
      {
        onSuccess: () => {
          toast.success(communityCommentModerationMessages[action]);
          onDone?.();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Action impossible"),
      }
    );

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs"
        disabled={moderate.isPending}
        onClick={() => (hidden ? run("unhide") : setHiding(true))}
      >
        {moderate.isPending && !hiding ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : hidden ? (
          <Eye className="mr-1.5 h-3.5 w-3.5" />
        ) : (
          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
        )}
        {hidden ? "Rétablir" : "Masquer"}
      </Button>

      {hiding && (
        <HideReasonDialog
          noun="ce commentaire"
          isPending={moderate.isPending}
          onClose={() => setHiding(false)}
          onConfirm={(reason) => run("hide", reason, () => setHiding(false))}
        />
      )}
    </>
  );
}