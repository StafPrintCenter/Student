import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type {
  APISessionResponseResult,
  APISessionsListResponse,
  APIStudentSession,
  SessionResponse,
  SessionsListParams,
} from "@/data/sessions";

const resourceKey = "sessions";

type TrainingSessionsParams = Omit<SessionsListParams, "trainingId">;

async function toError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null);
  const firstError = body?.errors ? (Object.values(body.errors).flat()[0] as string | undefined) : undefined;
  return new Error(body?.message || firstError || fallback);
}

function buildQuery(params: SessionsListParams): string {
  const qp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue;
    qp.append(key, value === true ? "1" : String(value));
  }
  return qp.toString();
}

/* ---- Liste de toutes mes sessions (vue liste, ou calendrier avec from + to) ---- */

async function fetchSessions(params: SessionsListParams = {}): Promise<APISessionsListResponse> {
  const response = await studentFetch(`/api/student/trainings/sessions/list?${buildQuery(params)}`);
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération des sessions");
  return response.json();
}

export const fetchStudentSessions = fetchSessions;

export function useSessionsList(params: SessionsListParams = {}) {
  const query = useQuery({
    queryKey: [resourceKey, "list", params],
    queryFn: () => fetchSessions(params),
    staleTime: 1000 * 30,
    // pendant un changement de filtre ou de mois, l'écran garde les données précédentes
    placeholderData: keepPreviousData,
  });
  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/* ---- Détail d'une session ---- */

async function fetchSessionById(id: string): Promise<APIStudentSession | null> {
  const response = await studentFetch(`/api/student/trainings/sessions/${id}`);
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération de la session");
  const json: { data: APIStudentSession } = await response.json();
  return json.data;
}

export const fetchStudentSessionById = fetchSessionById;

export function useSessionDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "detail", id],
    queryFn: () => fetchSessionById(id as string),
    enabled: !!id,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Sessions d'une de mes formations ---- */

async function fetchTrainingSessions(
  trainingId: string,
  params: TrainingSessionsParams = {}
): Promise<APISessionsListResponse> {
  const response = await studentFetch(`/api/student/trainings/${trainingId}/sessions/list?${buildQuery(params)}`);
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération des sessions de la formation");
  return response.json();
}

export const fetchStudentTrainingSessions = fetchTrainingSessions;

export function useTrainingSessions(trainingId: string | undefined, params: TrainingSessionsParams = {}) {
  const query = useQuery({
    queryKey: [resourceKey, "training", trainingId, params],
    queryFn: () => fetchTrainingSessions(trainingId as string, params),
    enabled: !!trainingId,
    staleTime: 1000 * 30,
  });
  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/* ---- Détail d'une session dans sa formation ---- */

async function fetchTrainingSession(trainingId: string, sessionId: string): Promise<APIStudentSession | null> {
  const response = await studentFetch(`/api/student/trainings/${trainingId}/sessions/${sessionId}`);
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération de la session");
  const json: { data: APIStudentSession } = await response.json();
  return json.data;
}

export const fetchStudentTrainingSession = fetchTrainingSession;

export function useTrainingSessionDetail(trainingId: string | undefined, sessionId: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "training-detail", trainingId, sessionId],
    queryFn: () => fetchTrainingSession(trainingId as string, sessionId as string),
    enabled: !!trainingId && !!sessionId,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Réponse à une session (confirmer ou décliner) ---- */

async function respondToSession(sessionId: string, answer: SessionResponse): Promise<APISessionResponseResult> {
  const fd = new FormData();
  fd.append("response", answer);

  const response = await studentFetch(`/api/student/trainings/sessions/${sessionId}/respond`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw await toError(response, "Erreur lors de l'enregistrement de votre réponse");
  const json: { data: APISessionResponseResult } = await response.json();
  return json.data;
}

export const respondToStudentSession = respondToSession;

export function useRespondToSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, response }: { sessionId: string; response: SessionResponse }) =>
      respondToSession(sessionId, response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resourceKey] });
      // les statistiques de sessions de la page « Progression » en dépendent
      qc.invalidateQueries({ queryKey: ["trainings", "progress"] });
    },
  });
}