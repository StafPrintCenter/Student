import { Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { isPayableEnrollment } from "./Utils";
import { formatFCFA } from "@/lib/format";
import { usePaymentsSummary } from "@/stores/usePaymentsStore";
import { useStudentProgress } from "@/stores/useProgressStore";

/** Ce qui attend l'étudiant : réponses aux sessions et contenus verrouillés. Rien à signaler = rien d'affiché. */
export function ActionsRequiredCard() {
  const { stats } = useStudentProgress();
  const { items } = usePaymentsSummary();

  const sessionsToConfirm = stats?.sessions?.upcomingNoResponse ?? 0;
  const lockedTrainings = items.filter((i) => !i.accessUnlocked && i.remaining > 0 && isPayableEnrollment(i.enrollmentStatus));

  if (sessionsToConfirm === 0 && lockedTrainings.length === 0) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="space-y-3 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 text-warning-foreground" /> À traiter
        </p>

        <ul className="space-y-2.5">
          {sessionsToConfirm > 0 && (
            <li className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  <strong>{sessionsToConfirm}</strong> session{sessionsToConfirm > 1 ? "s" : ""} à venir
                  {sessionsToConfirm > 1 ? " attendent" : " attend"} votre réponse
                </span>
              </span>
              <Link to="/sessions" className="shrink-0 text-xs font-medium text-primary hover:underline">
                Répondre →
              </Link>
            </li>
          )}

          {lockedTrainings.map((t) => {
            const missing = Math.max(0, t.accessMinAmount - t.totalPaid);
            return (
              <li key={t.enrollmentId} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{t.trainingTitle}</span>
                    <span className="block text-xs text-muted-foreground">
                      {missing > 0
                        ? `Il manque ${formatFCFA(missing)} pour débloquer le contenu.`
                        : "Règlement en attente de validation."}
                    </span>
                  </span>
                </span>
                <Link
                  to="/trainings/$id/mine"
                  params={{ id: t.trainingId }}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Voir →
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}