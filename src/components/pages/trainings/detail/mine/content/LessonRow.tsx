import { CheckCircle2, Circle, CircleDot, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared";
import { KindIcons } from "./lesson/Icons";
import { lessonProgressStatusMap, submissionStatusMap } from "@/data/lesson";
import { lessonKindLabels, type APIStudentTrainingLesson } from "@/data/trainings";

interface LessonRowProps {
  lesson: APIStudentTrainingLesson;
  locked: boolean;
  onOpen: () => void;
}

export function LessonRow({ lesson, locked, onOpen }: LessonRowProps) {
  // Défensif : une réponse "verrouillée" peut ne pas contenir de progression
  const status = lesson.progress?.status ?? "not_started";
  const bestScore = lesson.progress?.bestScore;

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={locked}
        className="-mx-2 flex w-full items-start justify-between gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5" title={locked ? "Verrouillée" : lessonProgressStatusMap[status].label}>
            <RowIcon locked={locked} status={status} kind={lesson.kind} />
          </span>
          <div className="min-w-0 space-y-1">
            <span className="block truncate">{lesson.title}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {lessonKindLabels[lesson.kind] ?? lesson.kind}
              </Badge>
              {lesson.isMandatory && (
                <Badge variant="outline" className="border-warning/40 bg-warning/10 text-[10px] text-warning-foreground">
                  Obligatoire
                </Badge>
              )}
              {lesson.submission && <StatusBadge status={lesson.submission.status} map={submissionStatusMap} />}
              {bestScore != null && (
                <Badge variant="outline" className="border-info/40 bg-info/15 text-[10px] text-info">
                  Score {bestScore}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {lesson.durationMinutes != null ? `${lesson.durationMinutes} min` : "-"}
        </span>
      </button>
    </li>
  );
}

function RowIcon({
  locked,
  status,
  kind,
}: {
  locked: boolean;
  status: keyof typeof lessonProgressStatusMap;
  kind: string;
}) {
  if (locked) return <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />;
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />;
  if (status === "in_progress") return <CircleDot className="h-4 w-4 shrink-0 text-warning" />;
  const Icon = KindIcons[kind] ?? Circle;
  return <Icon className="h-4 w-4 shrink-0 text-primary" />;
}