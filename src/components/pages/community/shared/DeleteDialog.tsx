import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteCommunityPost } from "@/stores/useCommunityPostsStore";

interface DeletePostDialogProps {
  post: { id: string; title: string };
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeletePostDialog({ post, onClose, onDeleted }: DeletePostDialogProps) {
  const deleteMutation = useDeleteCommunityPost();

  const handleDelete = () =>
    deleteMutation.mutate(
      { id: post.id },
      {
        onSuccess: () => {
          toast.success("Publication supprimée.");
          onDeleted?.();
          onClose();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression"),
      }
    );

  return (
    <Dialog open onOpenChange={(o) => !o && !deleteMutation.isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Supprimer cette publication ?</DialogTitle>
          <DialogDescription>« {post.title} » sera supprimée définitivement.</DialogDescription>
        </DialogHeader>
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