import { Link } from "@tanstack/react-router";

import { Progress } from "@/components/ui/progress";
import { AccessBadge } from "@/components/portal/trainings/access-badge";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import {
  summarizeInstructors,
  trainingEnrollmentStatusMap,
  type APIStudentTrainingEnrollment,
} from "@/data/trainings";

export function CurrentTrainingRow({ enrollment: e }: { enrollment: APIStudentTrainingEnrollment }) {
  return (
    <Link
      to="/trainings/$id/mine"
      params={{ id: e.trainingId }}
      className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      <div className="flex items-start gap-4">
        <div className="hidden h-14 w-14 shrink-0 rounded-lg sm:block" style={{ background: e.coverColor }} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">{e.trainingTitle}</p>
            <StatusBadge status={e.status} map={trainingEnrollmentStatusMap} />
            {!e.accessUnlocked && <AccessBadge unlocked={false} />}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {e.theme} · {summarizeInstructors(e.instructors) ?? "Formateur non assigné"} · {e.location}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={e.progress} className="h-2 flex-1" />
            <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">{e.progress}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}