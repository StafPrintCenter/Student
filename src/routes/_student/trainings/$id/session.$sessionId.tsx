import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarX } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OtherSessionsList } from "@/components/pages/sessions/detail/OtherList";
import { SessionTicket } from "@/components/pages/trainings/detail/session/session-ticket";
import { useTrainingSessionDetail } from "@/stores/useSessionsStore";
import { useStudentTrainingDetail } from "@/stores/useTrainingsStore";

export const Route = createFileRoute("/_student/trainings/$id/session/$sessionId")({
  head: () => ({
    meta: [
      { title: "Session de formation - STAF Student Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainingSessionDetail,
});

function TrainingSessionDetail() {
  const { id, sessionId } = Route.useParams();
  const { item: session, isLoading } = useTrainingSessionDetail(id, sessionId);
  // Déjà en cache quand on vient de la page de la formation : sert uniquement à la couleur
  const { item: training } = useStudentTrainingDetail(id);

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/trainings/$id/mine" params={{ id }}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la formation
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {back}
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        {back}
        <EmptyState
          icon={CalendarX}
          title="Session introuvable"
          description="Elle a peut-être été suspendue, ou le lien est incorrect."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {back}
      <div className="max-w-2xl space-y-6">
        <SessionTicket session={session} accentColor={training?.data.coverColor} />
        <OtherSessionsList trainingId={id} currentSessionId={session.id} />
      </div>
    </div>
  );
}