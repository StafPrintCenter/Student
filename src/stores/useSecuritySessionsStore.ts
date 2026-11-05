import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIStudentSession,
  APIStudentSessionsResponse,
  APIStudentSessionMessage,
  APIStudentSessionRevokeResponse,
} from "@/data/security-session";

export class StudentSessionsApiError extends Error { }

const SESSIONS_KEY = ["student-sessions"] as const;
const BASE_PATH = "/api/student/account/sessions";

async function sessionsRequest<T>(
  path: string,
  fallbackMessage: string,
  method?: "POST" | "DELETE"
): Promise<T> {
  const response = await studentFetch(`${BASE_PATH}${path}`, method ? { method } : undefined);
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new StudentSessionsApiError(error.message);
  }
  return response.json();
}

/* ---------- Fonctions ---------- */

export const fetchStudentSessions = () =>
  sessionsRequest<APIStudentSessionsResponse>("", "Impossible de charger vos sessions.");

export const deleteStudentSession = (id: number) =>
  sessionsRequest<APIStudentSessionMessage>(`/${id}`, "Impossible de fermer cette session.", "DELETE");

export const revokeOtherStudentSessions = () =>
  sessionsRequest<APIStudentSessionRevokeResponse>(
    "/revoke-others",
    "Impossible de fermer les autres sessions.",
    "POST"
  );

export const revokeAllStudentSessions = () =>
  sessionsRequest<APIStudentSessionRevokeResponse>(
    "/revoke-all",
    "Impossible de fermer les sessions.",
    "POST"
  );

/* ---------- Hooks ---------- */

export function useStudentSessionsList() {
  const query = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: fetchStudentSessions,
    staleTime: 1000 * 30,
  });
  return {
    items: (query.data?.data ?? []) as APIStudentSession[],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDeleteStudentSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStudentSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });
}

export function useRevokeOtherStudentSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeOtherStudentSessions(),
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });
}

/** La session actuelle est fermée aussi : on retire la liste du cache au lieu de la recharger (401) */
export function useRevokeAllStudentSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeAllStudentSessions(),
    onSuccess: () => qc.removeQueries({ queryKey: SESSIONS_KEY }),
  });
}