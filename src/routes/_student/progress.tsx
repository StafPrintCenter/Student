import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/site";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ProgressFinanceCard, ProgressSkeleton, ProgressStats, SessionsOverviewCard, TrainingProgressCard } from "@/components/pages/progress";
import { useStudentProgress } from "@/stores/useProgressStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/progress")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Ma progression | ${SITE.name}` },
      { name: "description", content: "Suivez votre avancement, votre assiduité et vos résultats pour chacune de vos formations." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { stats, items, isLoading, isError, refetch } = useStudentProgress();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Session"
        title="Ma progression"
        description="Suivez votre avancement, votre assiduité et vos résultats sur chaque formation."
      />

      {isLoading ? (
        <ProgressSkeleton />
      ) : isError || !stats ? (
        <div className="space-y-4">
          <EmptyState
            icon={LineChart}
            title="Impossible de charger votre progression"
            description="Vérifiez votre connexion, puis réessayez."
          />
          <div className="flex justify-center">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="Aucune progression à afficher"
          description="Inscrivez-vous à une formation pour suivre votre avancement ici."
        />
      ) : (
        <>
          <ProgressStats stats={stats} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ProgressFinanceCard finance={stats.finance} />
            <SessionsOverviewCard sessions={stats.sessions} />
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Détail par formation</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <TrainingProgressCard key={item.enrollmentId} item={item} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
