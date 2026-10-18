import { useState } from "react";
import { BookOpen, Lock } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonDialog, kindIcons, Circle } from "@/components/portal/lesson-dialog";
import { lessonKindLabels, type APIStudentTrainingLesson, type APIStudentTrainingModule } from "@/data/trainings";

interface TrainingProgramCardProps {
  modules: APIStudentTrainingModule[];
  contentLocked: boolean;
}

export function TrainingProgramCard({ modules, contentLocked }: TrainingProgramCardProps) {
  const [activeLesson, setActiveLesson] = useState<APIStudentTrainingLesson | null>(null);
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" /> Programme
          </CardTitle>
          <p className="text-xs text-muted-foreground">{totalLessons} leçons</p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={modules[0] ? [modules[0].id] : []}>
            {modules.map((m) => (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger>
                  <div className="flex flex-col text-left sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium">{m.title}</span>
                    <span className="text-xs text-muted-foreground">({m.lessons.length} leçons)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {m.description && <p className="mb-3 text-xs italic text-muted-foreground">{m.description}</p>}
                  {m.lessons.length > 0 ? (
                    <ul className="divide-y">
                      {m.lessons.map((l) => (
                        <LessonRow
                          key={l.id}
                          lesson={l}
                          locked={contentLocked}
                          onOpen={() => !contentLocked && setActiveLesson(l)}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="py-2 text-xs italic text-muted-foreground">Aucune leçon dans ce module pour le moment.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {activeLesson && <LessonDialog lesson={activeLesson} onClose={() => setActiveLesson(null)} />}
    </>
  );
}

function LessonRow({
  lesson,
  locked,
  onOpen,
}: {
  lesson: APIStudentTrainingLesson;
  locked: boolean;
  onOpen: () => void;
}) {
  const Icon = kindIcons[lesson.kind] ?? Circle;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={locked}
        className="-mx-2 flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 items-center gap-3">
          {locked ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <Icon className="h-4 w-4 shrink-0 text-primary" />
          )}
          <span className="truncate">{lesson.title}</span>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {lessonKindLabels[lesson.kind] ?? lesson.kind}
          </Badge>
          {lesson.isMandatory && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-[10px] text-warning-foreground">
              Obligatoire
            </Badge>
          )}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {lesson.durationMinutes != null ? `${lesson.durationMinutes} min` : "—"}
        </span>
      </button>
    </li>
  );
}