import { CheckCircle2, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuizRunner } from "@/components/portal/quiz/quiz-runner";
import { ContentBlock, EmptyLessonContent, ExternalVideoLink } from "@/components/pages/trainings/detail/mine/Lesson";
import { SubmissionBlock } from "@/components/portal/lesson/submission-block";
import { VideoBlock } from "@/components/portal/lesson/video-block";
import type { APILessonDetail, LessonProgressPayload } from "@/data/lesson";

interface LessonBodyProps {
  lesson: APILessonDetail;
  /** Défini uniquement quand la progression est suivie (marquage possible et leçon pas encore terminée) */
  onReportProgress?: (payload: LessonProgressPayload) => void;
  isReporting: boolean;
}

export function LessonBody({ lesson, onReportProgress, isReporting }: LessonBodyProps) {
  switch (lesson.kind) {
    case "video":
      return <VideoBlock lesson={lesson} onReportProgress={onReportProgress} isReporting={isReporting} />;

    case "reading":
      return <ReadingBlock lesson={lesson} onReportProgress={onReportProgress} isReporting={isReporting} />;

    case "quiz":
      return <QuizBlock lesson={lesson} />;

    case "exercise":
    case "assignment":
    case "project":
      return <SubmissionBlock lesson={lesson} />;

    default:
      return <ContentBlock content={lesson.content} emptyMessage="Aucun contenu disponible pour cette leçon." />;
  }
}

function ReadingBlock({ lesson, onReportProgress, isReporting }: LessonBodyProps) {
  return (
    <div className="space-y-4">
      <ContentBlock content={lesson.content} emptyMessage="Aucun support de lecture n'a encore été ajouté pour cette leçon." />
      <ExternalVideoLink url={lesson.videoUrl} />
      {lesson.progress.isCompleted ? (
        <p className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> Lecture validée
        </p>
      ) : (
        onReportProgress && (
          <Button size="sm" disabled={isReporting} onClick={() => onReportProgress({ completed: true })}>
            {isReporting ? "Enregistrement…" : "Marquer comme lue"}
          </Button>
        )
      )}
    </div>
  );
}

function QuizBlock({ lesson }: { lesson: APILessonDetail }) {
  return (
    <div className="space-y-4">
      <ContentBlock content={lesson.content} />
      {lesson.quizId ? (
        <QuizRunner quizId={lesson.quizId} />
      ) : (
        <EmptyLessonContent icon={ClipboardList} message="Ce quiz n'est pas encore disponible." />
      )}
    </div>
  );
}