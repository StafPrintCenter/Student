import { CheckCircle2 } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LessonRow } from "@/components/pages/trainings/detail/mine/content/LessonRow";
import type { APIStudentTrainingLesson, APIStudentTrainingModule } from "@/data/trainings";

interface ModuleItemProps {
  module: APIStudentTrainingModule;
  contentLocked: boolean;
  onOpenLesson: (lesson: APIStudentTrainingLesson) => void;
}

export function ModuleItem({ module: m, contentLocked, onOpenLesson }: ModuleItemProps) {
  const hasLessons = m.lessonsCount > 0;
  const percent = hasLessons ? Math.round((m.completedLessonsCount / m.lessonsCount) * 100) : 0;

  return (
    <AccordionItem value={m.id}>
      <AccordionTrigger>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-left sm:flex-row sm:items-center sm:gap-3">
          <span className="font-medium">{m.title}</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {m.completedLessonsCount}/{m.lessonsCount} leçons
            </span>
            {m.isCompleted && hasLessons && (
              <Badge variant="outline" className="gap-1 border-success/40 bg-success/15 text-[10px] text-success">
                <CheckCircle2 className="h-3 w-3" /> Terminé
              </Badge>
            )}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {m.description && <p className="mb-3 text-xs italic text-muted-foreground">{m.description}</p>}
        {hasLessons && <Progress value={percent} className="mb-3 h-1.5" />}

        {m.lessons.length > 0 ? (
          <ul className="divide-y">
            {m.lessons.map((l) => (
              <LessonRow key={l.id} lesson={l} locked={contentLocked} onOpen={() => onOpenLesson(l)} />
            ))}
          </ul>
        ) : (
          <p className="py-2 text-xs italic text-muted-foreground">Aucune leçon dans ce module pour le moment.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}