import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChaptersList } from "@/components/portal/lesson/lesson-blocks";
import { LessonBody } from "@/components/pages/trainings/detail/mine/Lesson";
import { LessonHeader } from "@/components/pages/trainings/detail/mine/Lesson/Header";
import { LessonNavigation } from "@/components/portal/lesson/lesson-navigation";
import { LessonProgressInfo } from "@/components/portal/lesson/lesson-progress-info";
import { LessonError, LessonLockedNotice, LessonSkeleton } from "@/components/portal/lesson/lesson-states";
import type { APILessonLink, LessonProgressPayload } from "@/data/lesson";
import { useLessonDetail, useMarkLessonProgress } from "@/stores/useLessonStore";
import { isFilePreviewOpen, isInsideFilePreview } from "@/components/portal/lesson/file-preview-portal";

// Ré-exporté pour ne casser aucun import existant
export { kindIcons } from "@/components/portal/lesson/lesson-kind-icons";

interface LessonDialogProps {
  /** Seuls l'id et le titre sont nécessaires : le contenu est chargé depuis le détail de la leçon */
  lesson: { id: string; title: string };
  onClose: () => void;
}

export function LessonDialog({ lesson, onClose }: LessonDialogProps) {
  const [current, setCurrent] = useState<APILessonLink>({ id: lesson.id, title: lesson.title });
  const { lesson: detail, isLoading, isError, refetch } = useLessonDetail(current.id);
  const progressMutation = useMarkLessonProgress();

  const reportProgress = (payload: LessonProgressPayload) => {
    progressMutation.mutate(
      { lessonId: current.id, payload },
      {
        onSuccess: (result) =>
          toast.success(result.status === "completed" ? "Leçon marquée comme terminée." : "Progression enregistrée."),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement"),
      }
    );
  };

  // La progression n'est suivie que si le backend l'autorise et que la leçon n'est pas déjà terminée
  const canTrack = !!detail && detail.canMarkProgress && !detail.progress.isCompleted;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[85vh] max-w-2xl overflow-y-auto"
        // L'aperçu de fichier est monté hors du dialogue (portail) : ses clics et son focus ne doivent pas le fermer
        onInteractOutside={(e) => {
          if (isInsideFilePreview(e.target)) e.preventDefault();
        }}
        // Échap ferme l'aperçu d'abord, puis le dialogue à la frappe suivante
        onEscapeKeyDown={(e) => {
          if (isFilePreviewOpen()) e.preventDefault();
        }}
      >
        <LessonHeader title={detail?.title ?? current.title} lesson={detail} />

        {isLoading ? (
          <LessonSkeleton />
        ) : isError || !detail ? (
          <LessonError onRetry={() => refetch()} />
        ) : detail.contentLocked ? (
          <LessonLockedNotice onClose={onClose} />
        ) : (
          <div className="space-y-4">
            <LessonProgressInfo lesson={detail} />
            <LessonBody
              key={detail.id}
              lesson={detail}
              onReportProgress={canTrack ? reportProgress : undefined}
              isReporting={progressMutation.isPending}
            />
            <ChaptersList chapters={detail.chapters} />
          </div>
        )}

        <LessonNavigation
          previous={detail?.previousLesson ?? null}
          next={detail?.nextLesson ?? null}
          onNavigate={setCurrent}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}