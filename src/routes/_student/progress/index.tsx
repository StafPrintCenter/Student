import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { FinanceCard } from "@/components/portal/progress/finance-card";
import { ProgressSkeleton } from "@/components/portal/progress/progress-skeleton";
import { ProgressStats } from "@/components/portal/progress/progress-stats";
import { SessionsOverviewCard } from "@/components/portal/progress/sessions-overview-card";
import { TrainingProgressCard } from "@/components/portal/progress/training-progress-card";
import { useStudentProgress } from "@/stores/useProgressStore";

export const Route = createFileRoute("/_student/progress/")({
  head: () => ({
    meta: [
      { title: "Ma progression - STAF Student Portal" },
      { name: "description", content: "Votre avancement, votre assiduité et vos résultats sur chaque formation." },
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
            <FinanceCard finance={stats.finance} />
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
