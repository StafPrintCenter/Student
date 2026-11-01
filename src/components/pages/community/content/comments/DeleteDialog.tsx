import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteCommunityComment } from "@/stores/useCommunityCommentsStore";
import type { APICommunityComment } from "@/data/community";

interface DeleteCommentDialogProps {
  comment: APICommunityComment;
  onClose: () => void;
}

export function DeleteCommentDialog({ comment, onClose }: DeleteCommentDialogProps) {
  const deleteMutation = useDeleteCommunityComment();
  const isReply = comment.parentId !== null;
  // Supprimer un commentaire racine supprime aussi ses réponses
  const replies = isReply ? 0 : comment.repliesCount;

  const handleDelete = () =>
    deleteMutation.mutate(
      { id: comment.id },
      {
        onSuccess: () => {
          toast.success(isReply ? "Réponse supprimée." : "Commentaire supprimé.");
          onClose();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression"),
      }
    );

  return (
    <Dialog open onOpenChange={(o) => !o && !deleteMutation.isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isReply ? "Supprimer cette réponse ?" : "Supprimer ce commentaire ?"}</DialogTitle>
          <DialogDescription>
            {isReply ? "Cette réponse sera supprimée définitivement." : "Ce commentaire sera supprimé définitivement."}
            {replies > 0 && (replies === 1 ? " Sa réponse sera aussi supprimée." : ` Ses ${replies} réponses seront aussi supprimées.`)}
          </DialogDescription>
        </DialogHeader>

        <p className="line-clamp-3 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
          {comment.body}
        </p>

        <DialogFooter>
          <Button variant="outline" disabled={deleteMutation.isPending} onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" disabled={deleteMutation.isPending} onClick={handleDelete}>
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Suppression…
              </>
            ) : (
              "Supprimer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}