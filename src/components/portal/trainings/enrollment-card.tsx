import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AccessBadge } from "@/components/portal/trainings/access-badge";
import { InstructorsLink } from "@/components/portal/trainings/instructors-link";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import {
  trainingEnrollmentStatusMap,
  trainingPaymentStatusMap,
  type APIStudentTrainingEnrollment,
} from "@/data/trainings";

export function EnrollmentCard({ enrollment: e }: { enrollment: APIStudentTrainingEnrollment }) {
  return (
    <Card className="overflow-hidden border-3" style={{ borderTopColor: e.coverColor || "var(--border)" }}>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {e.theme} · {e.level}
            </p>
            {/* Route privée : réservée aux formations où l'étudiant est inscrit */}
            <Link
              to="/trainings/$id/mine"
              params={{ id: e.trainingId }}
              className="mt-0.5 block truncate font-medium hover:underline"
            >
              {e.trainingTitle}
            </Link>
          </div>
          <StatusBadge status={e.status} map={trainingEnrollmentStatusMap} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {e.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {e.seatsRemaining}/{e.maxSeats} places
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {e.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(e.enrolledAt), "d MMM yyyy hh:mm", { locale: fr })}
          </span>
        </div>

        <InstructorsLink instructors={e.instructors} trainingTitle={e.trainingTitle} />

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progression</span>
            <span className="tabular-nums font-medium">{e.progress}%</span>
          </div>
          <Progress value={e.progress} className="h-2" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={e.paymentStatus} map={trainingPaymentStatusMap} />
            <AccessBadge unlocked={e.accessUnlocked} />
          </div>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/trainings/$id/mine" params={{ id: e.trainingId }}>
              Ouvrir <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}