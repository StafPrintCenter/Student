import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { CategorySidebar, CommunityFeed, CommunityFiltersBar, CreatePostDialog, DEFAULT_COMMUNITY_FILTERS, trainingIdFromPlace, type CommunityFilters } from "./";
import { DeletePostDialog, EditPostDialog, } from "@/components/pages/community/shared";
import { useCommunityCategories } from "@/stores/useCommunityCategoriesStore";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";
import type { APICommunityPostListItem } from "@/data/community";

export function CommunityBoard() {
  const [filters, setFilters] = useState<CommunityFilters>(DEFAULT_COMMUNITY_FILTERS);
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<APICommunityPostListItem | null>(null);

  const { categories, isLoading: categoriesLoading } = useCommunityCategories();
  const { items: enrollments } = useStudentTrainingsList();
  const trainings = enrollments.map((e) => ({ id: e.trainingId, title: e.trainingTitle }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Échanges"
        title="Communauté"
        description="Posez vos questions, partagez vos ressources et échangez avec les autres apprenants et vos formateurs."
        actions={
          <Button onClick={() => setComposing(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Nouvelle publication
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        <CategorySidebar
          categories={categories}
          isLoading={categoriesLoading}
          selectedId={filters.categoryId}
          onSelect={(categoryId) => setFilters({ ...filters, categoryId })}
        />

        <div className="min-w-0 space-y-5">
          <CommunityFiltersBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_COMMUNITY_FILTERS)}
            trainings={trainings}
          />
          <CommunityFeed
            filters={filters}
            onCreate={() => setComposing(true)}
            onEdit={setEditingId}
            onDelete={setDeleting}
          />
        </div>
      </div>

      {composing && (
        <CreatePostDialog
          defaultCategoryId={filters.categoryId}
          defaultTrainingId={trainingIdFromPlace(filters.place)}
          onClose={() => setComposing(false)}
        />
      )}
      {editingId && <EditPostDialog postId={editingId} onClose={() => setEditingId(null)} />}
      {deleting && <DeletePostDialog post={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}