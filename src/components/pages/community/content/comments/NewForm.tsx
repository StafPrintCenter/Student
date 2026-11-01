import { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { CommentTextForm } from "./TextForm";
import { useCreateCommunityComment } from "@/stores/useCommunityCommentsStore";

interface NewCommentFormProps {
  postId: string;
  /** Réponse à un commentaire : celui qui est visé */
  replyTo?: { id: string; authorName: string };
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}

export function NewCommentForm({ postId, replyTo, placeholder, autoFocus, onDone, onCancel }: NewCommentFormProps) {
  const createMutation = useCreateCommunityComment();
  // Remonter le formulaire après un envoi réussi vide la zone de texte
  const [formKey, setFormKey] = useState(0);

  return (
    <CommentTextForm
      key={formKey}
      placeholder={placeholder ?? (replyTo ? "Écrivez votre réponse…" : "Écrivez un commentaire…")}
      submitLabel={replyTo ? "Répondre" : "Commenter"}
      autoFocus={autoFocus}
      rows={replyTo ? 2 : 3}
      isPending={createMutation.isPending}
      onCancel={onCancel}
      context={
        replyTo && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CornerDownRight className="h-3.5 w-3.5" />
            En réponse à <span className="font-medium text-foreground">{replyTo.authorName}</span>
          </p>
        )
      }
      onSubmit={(body) =>
        createMutation.mutate(
          { postId, payload: { body, parentId: replyTo?.id } },
          {
            onSuccess: () => {
              toast.success(replyTo ? "Réponse publiée." : "Commentaire publié.");
              setFormKey((k) => k + 1);
              onDone?.();
            },
            onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi"),
          }
        )
      }
    />
  );
}