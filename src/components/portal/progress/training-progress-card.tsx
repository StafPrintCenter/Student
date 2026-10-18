import { Link } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import { certificateEligibilityStatusMap } from "@/data/certificates";
import { trainingEnrollmentStatusMap, trainingPaymentStatusMap } from "@/data/trainings";
import type { APIProgressItem, APIProgressLessonsCount } from "@/data/progress";

/** "7/10", ou "—" tant que la formation n'a aucune leçon publiée */
const lessonsLabel = (l: APIProgressLessonsCount) => (l.total === 0 ? "—" : `${l.completed}/${l.total}`);

export function TrainingProgressCard({ item }: { item: APIProgressItem }) {
  const { attendance } = item;
  const hasCertificate = item.certificateStatus === "issued" || item.certificateStatus === "downloaded";

  return (
    <Card className="overflow-hidden border-3" style={{ borderTopColor: item.coverColor || "var(--border)" }}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{item.theme}</p>
            <Link
              to="/trainings/$id/mine"
              params={{ id: item.trainingId }}
              className="mt-0.5 block truncate font-medium hover:underline"
            >
              {item.trainingTitle}
            </Link>
          </div>
          <StatusBadge status={item.status} map={trainingEnrollmentStatusMap} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progression</span>
            <span className="tabular-nums font-medium">{item.progress}%</span>
          </div>
          <Progress value={item.progress} className="h-2" />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Leçons" value={lessonsLabel(item.lessons)} />
          <Metric label="Leçons obligatoires" value={lessonsLabel(item.mandatoryLessons)} />
          <Metric
            label="Assiduité"
            value={attendance.ratio == null ? "—" : `${attendance.ratio}%`}
            hint={
              attendance.sessionsMarked > 0
                ? `${attendance.sessionsPresent}/${attendance.sessionsMarked} séances`
                : "Aucune séance pointée"
            }
          />
          <Metric label="Score moyen" value={item.averageScore == null ? "—" : `${item.averageScore}%`} />
        </dl>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={item.paymentStatus} map={trainingPaymentStatusMap} />
            <StatusBadge status={item.certificateStatus} map={certificateEligibilityStatusMap} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {item.completedAt
                ? `Terminée le ${format(new Date(item.completedAt), "d MMM yyyy", { locale: fr })}`
                : item.lastActivityAt
                  ? `Activité ${formatDistanceToNow(new Date(item.lastActivityAt), { addSuffix: true, locale: fr })}`
                  : "Aucune activité pour le moment"}
            </p>
            <div className="flex items-center gap-1">
              {hasCertificate && (
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/certificates">
                    <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Certificat
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="ghost" asChild>
                <Link to="/trainings/$id/mine" params={{ id: item.trainingId }}>
                  Ouvrir <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}