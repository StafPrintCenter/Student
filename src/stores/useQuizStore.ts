import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type {
  APIQuizAttemptsResponse,
  APIQuizStartResult,
  APIQuizSubmitResult,
  QuizAnswers,
} from "@/data/quiz";

const resourceKey = "quizzes";

/** Erreur API portant le code HTTP : 409 (déjà soumise), 410 (temps écoulé), 422 (validation), 403... */
export class QuizApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function toQuizError(response: Response, fallback: string): Promise<QuizApiError> {
  const body = await response.json().catch(() => null);
  return new QuizApiError(body?.message || fallback, response.status);
}

/* ---- Historique des tentatives ---- */

async function fetchQuizAttempts(quizId: string): Promise<APIQuizAttemptsResponse> {
  const response = await studentFetch(`/api/v1/student/quizzes/${quizId}/attempts`);
  if (!response.ok) throw await toQuizError(response, "Erreur lors de la récupération des tentatives");
  return response.json();
}

export const fetchStudentQuizAttempts = fetchQuizAttempts;

export function useQuizAttempts(quizId: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "attempts", quizId],
    queryFn: () => fetchQuizAttempts(quizId as string),
    enabled: !!quizId,
  });
  return {
    attempts: query.data?.data ?? [],
    bestScore: query.data?.bestScore ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/* ---- Démarrage d'une tentative ---- */

async function startQuiz(quizId: string): Promise<APIQuizStartResult> {
  const response = await studentFetch(`/api/v1/student/quizzes/${quizId}/start`, { method: "POST" });
  if (!response.ok) throw await toQuizError(response, "Impossible de démarrer le quiz");
  const json: { data: APIQuizStartResult } = await response.json();
  return json.data;
}

export const startStudentQuiz = startQuiz;

export function useStartQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => startQuiz(quizId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Soumission ---- */

async function submitQuizAttempt(attemptId: string, answers: QuizAnswers): Promise<APIQuizSubmitResult> {
  const fd = new FormData();
  fd.append("answers", JSON.stringify(answers));

  const response = await studentFetch(`/api/v1/student/quiz-attempts/${attemptId}/submit`, {
    method: "POST",
    body: fd,
  });
  if (!response.ok) throw await toQuizError(response, "Erreur lors de la soumission du quiz");
  const json: { data: APIQuizSubmitResult } = await response.json();
  return json.data;
}

export const submitStudentQuizAttempt = submitQuizAttempt;

export function useSubmitQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: QuizAnswers }) =>
      submitQuizAttempt(attemptId, answers),
    onSuccess: () => {
      // historique + best score, et progression de l'inscription (meilleur score ≥ passScore = leçon terminée)
      qc.invalidateQueries({ queryKey: [resourceKey] });
      qc.invalidateQueries({ queryKey: ["trainings"] });
    },
  });
}