import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIStudentHealth,
  APIStudentHealthRecommendation,
  APIStudentHealthDismissResponse,
  StudentHealthDismissPayload,
} from "@/data/profileHealth";

export class StudentHealthApiError extends Error { }

export const HEALTH_KEY = ["student-profile-health"] as const;
const BASE_PATH = "/api/student/account/profile-health";
const EMPTY_RECOMMENDATIONS: APIStudentHealthRecommendation[] = [];

export async function fetchStudentProfileHealth(includeDismissed = false): Promise<APIStudentHealth> {
  const query = includeDismissed ? "?includeDismissed=true" : "";
  const response = await studentFetch(`${BASE_PATH}${query}`);
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible de charger la santé du compte.");
    throw new StudentHealthApiError(error.message);
  }
  return response.json();
}

export async function dismissStudentHealthRecommendation(
  payload: StudentHealthDismissPayload
): Promise<APIStudentHealthDismissResponse> {
  const fd = new FormData();
  fd.append("id", payload.id);
  fd.append("restore", payload.restore ? "1" : "0");

  const response = await studentFetch(`${BASE_PATH}/dismiss`, { method: "POST", body: fd });
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible de modifier cette recommandation.");
    throw new StudentHealthApiError(error.message);
  }
  return response.json();
}

export function useStudentProfileHealth({ includeDismissed = false } = {}) {
  const query = useQuery({
    queryKey: [...HEALTH_KEY, { includeDismissed }],
    queryFn: () => fetchStudentProfileHealth(includeDismissed),
    staleTime: 1000 * 60,
    retry: 1,
  });
  return {
    health: query.data ?? null,
    recommendations: query.data?.recommendations ?? EMPTY_RECOMMENDATIONS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDismissStudentHealthRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dismissStudentHealthRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: HEALTH_KEY }),
  });
}