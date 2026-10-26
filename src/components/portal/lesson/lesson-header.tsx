import { Badge } from "@/components/ui/badge";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/portal/trainings/StatusBadge";
import { lessonProgressStatusMap, type APILessonDetail } from "@/data/lesson";
import { lessonKindLabels } from "@/data/trainings";

/** `lesson` est null tant que le détail charge : seul le titre est alors affiché */
export function LessonHeader({ title, lesson }: { title: string; lesson: APILessonDetail | null }) {
  return (
    <DialogHeader>
      {lesson && (
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {lessonKindLabels[lesson.kind] ?? lesson.kind}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {lesson.durationMinutes != null ? `${lesson.durationMinutes} min` : "Durée non précisée"}
          </span>
          {lesson.isMandatory && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-[10px] text-warning-foreground">
              Obligatoire
            </Badge>
          )}
          <StatusBadge status={lesson.progress.status} map={lessonProgressStatusMap} />
        </div>
      )}
      <DialogTitle>{title}</DialogTitle>
      {lesson && <p className="text-xs text-muted-foreground">Module : {lesson.module.title}</p>}
      {lesson?.brief && <DialogDescription>{lesson.brief}</DialogDescription>}
    </DialogHeader>
  );
}