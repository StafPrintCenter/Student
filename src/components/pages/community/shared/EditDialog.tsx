import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostForm, PostFormDialog } from "@/components/pages/community/shared";
import { toUpdatePayload, valuesFromPost } from "@/components/pages/community/home";
import { useCommunityCategories } from "@/stores/useCommunityCategoriesStore";
import { useCommunityPostDetail, useUpdateCommunityPost } from "@/stores/useCommunityPostsStore";

interface EditPostDialogProps {
  postId: string;
  onClose: () => void;
}

export function EditPostDialog({ postId, onClose }: EditPostDialogProps) {
  // La liste ne contient que l'extrait : le contenu complet vient du détail
  const { item: post, isLoading } = useCommunityPostDetail(postId);
  const { categories } = useCommunityCategories();
  const updateMutation = useUpdateCommunityPost();

  const initial = useMemo(() => (post ? valuesFromPost(post) : null), [post]);

  return (
    <PostFormDialog title="Modifier la publication" description="Seul l'auteur peut modifier sa publication." onClose={onClose}>
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : !post || !initial ? (
        <div className="space-y-3 text-sm">
          <p className="text-destructive">Publication introuvable ou inaccessible.</p>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      ) : (
        <PostForm
          mode="edit"
          initial={initial}
          categories={categories}
          trainings={[]}
          trainingTitle={post.training?.title ?? null}
          existingAttachmentsCount={post.attachmentsCount}
          isPending={updateMutation.isPending}
          onCancel={onClose}
          onSubmit={(values) =>
            updateMutation.mutate(
              { id: post.id, payload: toUpdatePayload(initial, values) },
              {
                onSuccess: () => {
                  toast.success("Publication modifiée.");
                  onClose();
                },
                onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la modification"),
              }
            )
          }
        />
      )}
    </PostFormDialog>
  );
}