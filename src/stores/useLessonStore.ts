import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type {
  APILessonDetail,
  APILessonProgressResult,
  APISubmissionResult,
  LessonProgressPayload,
  SubmissionPayload,
} from "@/data/lesson";

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

/* ---- Détail d'une leçon ---- */

async function fetchLessonDetail(lessonId: string): Promise<APILessonDetail | null> {
  const response = await studentFetch(`/api/student/trainings/lessons/${lessonId}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Erreur lors de la récupération de la leçon");
  }
  const json: { data: APILessonDetail } = await response.json();
  return json.data;
}

export const fetchStudentLessonDetail = fetchLessonDetail;

/**
 * Clé sous ["trainings", ...] : les mutations de progression, de dépôt et de quiz invalident déjà
 * ["trainings"], donc le détail de leçon (progress.isCompleted, submissions) se met à jour tout seul.
 */
export function useLessonDetail(lessonId: string | undefined) {
  const query = useQuery({
    queryKey: ["trainings", "lesson", lessonId],
    queryFn: () => fetchLessonDetail(lessonId as string),
    enabled: !!lessonId,
  });
  return { lesson: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Progression (video / reading) ---- */

async function markLessonProgress(lessonId: string, payload: LessonProgressPayload): Promise<APILessonProgressResult> {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainings"] }),
  });
}

/* ---- Dépôt d'un travail ---- */

async function createSubmission(lessonId: string, payload: SubmissionPayload): Promise<APISubmissionResult> {
  const fd = new FormData();
  if (payload.body !== undefined) fd.append("body", payload.body);
  if (payload.file) fd.append("file", payload.file);

  const response = await studentFetch(`/api/student/trainings/lessons/${lessonId}/submit-work`, {
    method: "POST",
    body: fd,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainings"] }),
  });
}