import { toast } from "sonner";
import { PostForm, PostFormDialog } from "@/components/pages/community/shared";
import { emptyPostValues, toCreatePayload } from "@/components/pages/community/home";
import { useCommunityCategories } from "@/stores/useCommunityCategoriesStore";
import { useCreateCommunityPost } from "@/stores/useCommunityPostsStore";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";

interface CreatePostDialogProps {
  defaultCategoryId?: string;
  defaultTrainingId?: string;
  onClose: () => void;
}

export function CreatePostDialog({ defaultCategoryId, defaultTrainingId, onClose }: CreatePostDialogProps) {
  const { categories } = useCommunityCategories();
  const { items: enrollments } = useStudentTrainingsList();
  const createMutation = useCreateCommunityPost();

  const trainings = enrollments.map((e) => ({ id: e.trainingId, title: e.trainingTitle }));

  return (
    <PostFormDialog
      title="Nouvelle publication"
      description="Partagez une question, une ressource ou lancez une discussion."
      onClose={onClose}
    >
      <PostForm
        mode="create"
        initial={emptyPostValues(defaultCategoryId, defaultTrainingId)}
        categories={categories}
        trainings={trainings}
        isPending={createMutation.isPending}
        onCancel={onClose}
        onSubmit={(values) =>
          createMutation.mutate(toCreatePayload(values), {
            onSuccess: () => {
              toast.success("Publication créée.");
              onClose();
            },
            onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la publication"),
          })
        }
      />
    </PostFormDialog>
  );
}