import { toast } from "sonner";
import { CommentTextForm } from "./TextForm";
import { useUpdateCommunityComment } from "@/stores/useCommunityCommentsStore";
import type { APICommunityComment } from "@/data/community";

interface EditCommentFormProps {
  comment: APICommunityComment;
  onDone: () => void;
  onCancel: () => void;
}

export function EditCommentForm({ comment, onDone, onCancel }: EditCommentFormProps) {
  const updateMutation = useUpdateCommunityComment();

  return (
    <CommentTextForm
      initialValue={comment.body}
      submitLabel="Enregistrer"
      autoFocus
      isPending={updateMutation.isPending}
      onCancel={onCancel}
      onSubmit={(body) =>
        updateMutation.mutate(
          { id: comment.id, body },
          {
            onSuccess: () => {
              toast.success("Commentaire modifié.");
              onDone();
            },
            onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la modification"),
          }
        )
      }
    />
  );
}