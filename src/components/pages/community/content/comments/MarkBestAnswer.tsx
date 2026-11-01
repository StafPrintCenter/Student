import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMarkBestAnswer } from "@/stores/useCommunityBestAnswerStore";
import type { APICommunityComment } from "@/data/community";

interface MarkBestAnswerDialogProps {
  postId: string;
  comment: APICommunityComment;
  onClose: () => void;
}

export function MarkBestAnswerDialog({ postId, comment, onClose }: MarkBestAnswerDialogProps) {
  const mutation = useMarkBestAnswer();

  const handleConfirm = () =>
    mutation.mutate(
      { postId, commentId: comment.id },
      {
        onSuccess: () => {
          toast.success("Réponse marquée comme meilleure réponse.");
          onClose();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Impossible de marquer cette réponse"),
      }
    );

  return (
    <Dialog open onOpenChange={(o) => !o && !mutation.isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Marquer comme meilleure réponse ?</DialogTitle>
          <DialogDescription>
            Le commentaire de {comment.author.name} sera mis en avant en tête de la discussion, et la question passera en
            « Résolue ».
          </DialogDescription>
        </DialogHeader>

        <p className="line-clamp-3 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
          {comment.body}
        </p>

        <DialogFooter>
          <Button variant="outline" disabled={mutation.isPending} onClick={onClose}>
            Annuler
          </Button>
          <Button disabled={mutation.isPending} onClick={handleConfirm}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Enregistrement…
              </>
            ) : (
              "Confirmer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}