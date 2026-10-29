import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePublicTrainingDetail,
  useStudentTrainingsList,
  useSubscribeToTraining,
} from "@/stores/useTrainingsStore";
import { SITE } from "@/data/site";
import { useDynamicPageMetadata } from "@/hooks/useDynamicPageMetadata";
import { TrainingCatalogueDetail } from "@/components/pages/trainings/detail/catalogue";

export const Route = createFileRoute("/_student/trainings/$id/catalogue")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Détail d'une formation | ${SITE.name}` },
      { name: "description", content: `Découvrez le programme, les objectifs et les modalités d'inscription aux formations de ${SITE.name}.` },
    ],
  }),
  component: PublicTrainingDetail,
});

function PublicTrainingDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { item: training, isLoading } = usePublicTrainingDetail(id);
  useDynamicPageMetadata(
    training ? `${SITE.tool} - ${training.title} | ${SITE.name}` : undefined,
    training?.short,
  );
  const { items: myEnrollments } = useStudentTrainingsList();
  const isEnrolled = useMemo(() => myEnrollments.some((e) => e.trainingId === id), [myEnrollments, id]);

  const subscribeMutation = useSubscribeToTraining();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!training) return <p>Formation introuvable.</p>;

  const handleSubscribe = () => {
    subscribeMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Inscription enregistrée.");
        qc.invalidateQueries({ queryKey: ["trainings"] });
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'inscription"),
    });
  };

  return (
    <TrainingCatalogueDetail
      training={training}
      isEnrolled={isEnrolled}
      isSubmitting={subscribeMutation.isPending}
      onSubscribe={handleSubscribe}
    />
  );
}