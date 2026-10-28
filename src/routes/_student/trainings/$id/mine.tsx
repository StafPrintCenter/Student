import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { CertificateAvailableBanner, EnrollmentStatusCard, FinancialStatusCard, InstructorsCard, LockedAccessAlert, TrainingMineHero, TrainingMineObjectivesCard, TrainingMineProgramCard } from "@/components/pages/trainings/detail/mine/Base";
import { TrainingSessionsCard } from "@/components/portal/sessions/training-sessions-card";
import { useStudentTrainingDetail } from "@/stores/useTrainingsStore";

export const Route = createFileRoute("/_student/trainings/$id/mine")({
  head: () => ({
    meta: [
      { title: "Formation - STAF Student Portal" },
      { name: "description", content: "Détail de votre formation, programme, paiement et progression." },
    ],
  }),
  component: TrainingDetail,
});

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/trainings">
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Link>
    </Button>
  );
}

function TrainingDetail() {
  const { id } = Route.useParams();
  const { item: response, isLoading } = useStudentTrainingDetail(id);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (!response) {
    return (
      <div className="space-y-6">
        <BackButton />
        <EmptyState
          icon={Lock}
          title="Vous n'êtes pas inscrit à cette formation"
          description="Consultez sa fiche dans le catalogue pour vous inscrire."
        />
      </div>
    );
  }

  const { data: training, enrollment, contentLocked, modules } = response;
  const accessMinRatioPercent = Math.round(parseFloat(training.accessMinRatio || "0") * 100);

  return (
    <div className="space-y-6">
      <BackButton />
      <TrainingMineHero
        training={training}
        enrollment={enrollment}
        contentLocked={contentLocked}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Formation terminée : annonce du certificat */}
          {enrollment.progress >= 100 && <CertificateAvailableBanner enrollmentId={enrollment.id} />}
          {contentLocked && <LockedAccessAlert minRatioPercent={accessMinRatioPercent} />}
          <TrainingSessionsCard trainingId={training.id} />
          <TrainingMineObjectivesCard objectives={training.objectives} />
          <TrainingMineProgramCard modules={modules} contentLocked={contentLocked} />
        </div>

        <div className="space-y-6">
          <EnrollmentStatusCard enrollment={enrollment} />
          <FinancialStatusCard
            training={training}
            trainingId={training.id}
            enrollment={enrollment}
            accessMinRatioPercent={accessMinRatioPercent}
          />
          <InstructorsCard instructors={training.instructors} />
        </div>
      </div>
    </div>
  );
}