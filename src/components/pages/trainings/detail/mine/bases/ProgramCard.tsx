import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LessonDialog } from "@/components/pages/trainings/detail/mine/Base";
import { ModuleItem } from "@/components/pages/trainings/detail/mine/Content/ModuleItem";
import type { APIStudentTrainingLesson, APIStudentTrainingModule } from "@/data/trainings";

interface TrainingProgramCardProps {
  modules: APIStudentTrainingModule[];
  contentLocked: boolean;
}

export function TrainingMineProgramCard({ modules, contentLocked }: TrainingProgramCardProps) {
  const [activeLesson, setActiveLesson] = useState<APIStudentTrainingLesson | null>(null);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessonsCount, 0);
  const completedLessons = modules.reduce((sum, m) => sum + m.completedLessonsCount, 0);
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" /> Programme
            </CardTitle>
            <p className="text-xs tabular-nums text-muted-foreground">
              {completedLessons}/{totalLessons} leçons terminées
            </p>
          </div>
          {totalLessons > 0 && <Progress value={percent} className="h-1.5" />}
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={modules[0] ? [modules[0].id] : []}>
            {modules.map((m) => (
              <ModuleItem
                key={m.id}
                module={m}
                contentLocked={contentLocked}
                onOpenLesson={(lesson) => !contentLocked && setActiveLesson(lesson)}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {activeLesson && <LessonDialog lesson={activeLesson} onClose={() => setActiveLesson(null)} />}
    </>
  );
}