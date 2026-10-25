import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Play } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { isActiveEnrollment } from "./Utils";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useStudentProgress } from "@/stores/useProgressStore";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";

export function DashboardHeader() {
  const { user } = useStudentAuth();
  const { items } = useStudentTrainingsList();
  const { stats } = useStudentProgress();

  // « Continuer à apprendre » ouvre la première formation en cours qui n'est pas terminée
  const next = items.find((e) => isActiveEnrollment(e.status) && e.progress < 100);
  const firstName = user?.firstName?.trim();
  const lastActivity = stats?.lastActivityAt
    ? ` Dernière activité ${formatDistanceToNow(new Date(stats.lastActivityAt), { addSuffix: true, locale: fr })}.`
    : "";

  return (
    <PageHeader
      eyebrow={firstName ? `Bonjour, ${firstName}` : "Bonjour"}
      title="Bienvenue dans votre atelier d'apprentissage."
      description={`Voici l'état de vos formations et de vos prochaines échéances.${lastActivity}`}
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/sessions">
              <CalendarDays className="mr-1.5 h-4 w-4" /> Mes sessions
            </Link>
          </Button>
          <Button asChild>
            {next ? (
              <Link to="/trainings/$id/mine" params={{ id: next.trainingId }}>
                <Play className="mr-1.5 h-4 w-4" /> Continuer à apprendre
              </Link>
            ) : (
              <Link to="/trainings">
                <Play className="mr-1.5 h-4 w-4" /> Voir les formations
              </Link>
            )}
          </Button>
        </>
      }
    />
  );
}