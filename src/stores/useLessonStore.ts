import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type { LessonProgressPayload, APILessonProgressResult, SubmissionPayload, APISubmissionResult } from "@/data/lesson";

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else if (value instanceof File) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

/**
 * Marque la progression d'une leçon "video" ou "reading".
 * Les autres kinds renvoient 422 sur cet endpoint (voir TRACKABLE_LESSON_KINDS dans @/data/trainings).
 */
async function markLessonProgress(
  lessonId: string,
  payload: LessonProgressPayload
): Promise<APILessonProgressResult> {
  const response = await studentFetch(`/api/student/trainings/lessons/${lessonId}/progress`, {
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
      qc.invalidateQueries({ queryKey: ["trainings"] });
    },
  });
}

/**
 * Dépose un travail (texte et/ou fichier) pour une leçon exercise/assignment/project.
 * Le backend exige au moins un des deux champs (422 sinon), vérifié aussi côté composant.
 */
async function createSubmission(lessonId: string, payload: SubmissionPayload): Promise<APISubmissionResult> {
  const fd = new FormData();
  if (payload.body !== undefined) fd.append("body", payload.body);
  if (payload.file) fd.append("file", payload.file);

  const response = await studentFetch(`/api/student/lessons/${lessonId}/submissions/create`, {
    method: "POST",
    body: fd,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    // 403 (non inscrit / contenu verrouillé) et 422 (champs manquants) portent un message ou un objet "errors"
    const firstError = errorBody?.errors ? Object.values(errorBody.errors).flat()[0] : null;
    throw new Error(errorBody?.message || (firstError as string) || "Erreur lors du dépôt du travail");
  }
  const json: { data: APISubmissionResult } = await response.json();
  return json.data;
}

export const createStudentSubmission = createSubmission;

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: SubmissionPayload }) =>
      createSubmission(lessonId, payload),
    onSuccess: () => {
      // la progression de l'inscription change (un exercice est marqué terminé au dépôt)
      qc.invalidateQueries({ queryKey: ["trainings"] });
    },
  });
}