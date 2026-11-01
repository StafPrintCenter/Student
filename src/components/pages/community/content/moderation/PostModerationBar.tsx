import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Pin, PinOff, Unlock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HideReasonDialog } from "./HideReason";
import {
  communityPostModerationMessages,
  type APICommunityPostDetail,
  type CommunityPostModerationAction,
} from "@/data/community";
import { useModerateCommunityPost } from "@/stores/useCommunityModerationStore";

type ModeratedPost = Pick<APICommunityPostDetail, "id" | "isPinned" | "isLocked" | "status" | "permissions">;

export function PostModerationBar({ post }: { post: ModeratedPost }) {
  const [hiding, setHiding] = useState(false);
  const moderate = useModerateCommunityPost();
  const { canModerate, canLock, canHide } = post.permissions;
  const hidden = post.status === "hidden";

  if (!canModerate && !canLock && !canHide) return null;

  const run = (action: CommunityPostModerationAction, reason?: string, onDone?: () => void) =>
    moderate.mutate(
      { id: post.id, action, reason },
      {
        onSuccess: () => {
          toast.success(communityPostModerationMessages[action]);
          onDone?.();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Action impossible"),
      }
    );

  const loading = (action: CommunityPostModerationAction) => moderate.isPending && moderate.variables?.action === action;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Gestion</span>

        {canModerate && (
          <BarButton
            icon={post.isPinned ? PinOff : Pin}
            label={post.isPinned ? "Désépingler" : "Épingler"}
            loading={loading(post.isPinned ? "unpin" : "pin")}
            disabled={moderate.isPending}
            onClick={() => run(post.isPinned ? "unpin" : "pin")}
          />
        )}

        {canLock && (
          <BarButton
            icon={post.isLocked ? Unlock : Lock}
            label={post.isLocked ? "Rouvrir les commentaires" : "Fermer les commentaires"}
            loading={loading(post.isLocked ? "unlock" : "lock")}
            disabled={moderate.isPending}
            onClick={() => run(post.isLocked ? "unlock" : "lock")}
          />
        )}

        {canHide &&
          (hidden ? (
            <BarButton
              icon={Eye}
              label="Rétablir"
              loading={loading("unhide")}
              disabled={moderate.isPending}
              onClick={() => run("unhide")}
            />
          ) : (
            <BarButton icon={EyeOff} label="Masquer" disabled={moderate.isPending} onClick={() => setHiding(true)} />
          ))}
      </div>

      {hiding && (
        <HideReasonDialog
          noun="cette publication"
          isPending={moderate.isPending}
          onClose={() => setHiding(false)}
          onConfirm={(reason) => run("hide", reason, () => setHiding(false))}
        />
      )}
    </>
  );
}

function BarButton({
  icon: Icon,
  label,
  onClick,
  loading,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onClick}>
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Icon className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}