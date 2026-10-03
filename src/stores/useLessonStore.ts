import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type { LessonProgressPayload, APILessonProgressResult } from "@/data/lesson";

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

/**
 * Marque la progression d'une leçon "video" ou "reading".
 * Les autres kinds (quiz/exercise/assignment/project) renvoient 422 sur cet endpoint —
 * ne pas appeler cette fonction pour eux (voir TRACKABLE_LESSON_KINDS dans @/data/trainings).
 */
async function markLessonProgress(
  lessonId: string,
  payload: LessonProgressPayload
): Promise<APILessonProgressResult> {
  const response = await studentFetch(`/api/v1/student/lessons/${lessonId}/progress`, {
    method: "POST",
    body: buildFormData(payload as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour de la progression");
  const json: { data: APILessonProgressResult } = await response.json();
  return json.data;
}

export const markStudentLessonProgress = markLessonProgress;

export function useMarkLessonProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: LessonProgressPayload }) =>
      markLessonProgress(lessonId, payload),
    onSuccess: () => {
      // enrollment.progress change à la fois dans le detail student et dans "mes formations"
      qc.invalidateQueries({ queryKey: ["trainings"] });
    },
  });
}