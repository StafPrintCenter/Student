// src/stores/useTrainingsStore.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type {
  APIStudentTrainingEnrollment,
  APIStudentTrainingDetailResponse,
  APIPublicTrainingCatalogItem,
} from "@/data/trainings";

interface PaginatedResponse<T> {
  data: T[];
  links: any;
  meta: any;
}

export interface TrainingsCatalogParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/**
 * Mes formations (inscriptions de l'étudiant connecté)
 * GET /api/v1/student/trainings/list
 */
export async function fetchStudentTrainings(): Promise<APIStudentTrainingEnrollment[]> {
  const response = await studentFetch(`/api/v1/student/trainings/list`);
  if (!response.ok) throw new Error("Erreur lors de la récupération de vos formations");
  const body: { data: APIStudentTrainingEnrollment[] } = await response.json();
  return body.data;
}

/**
 * Catalogue public des formations
 * GET /api/v1/public/trainings/catalogs/list
 */
export async function fetchTrainingsCatalog(
  params: TrainingsCatalogParams = {}
): Promise<PaginatedResponse<APIPublicTrainingCatalogItem>> {
  const qp = new URLSearchParams();
  if (params.page) qp.append("page", String(params.page));
  qp.append("perPage", String(params.perPage ?? 12));
  if (params.search) qp.append("search", params.search);

  const response = await studentFetch(`/api/v1/public/trainings/catalogs/list?${qp.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération du catalogue");
  return response.json();
}

/**
 * Détail d'une formation pour l'étudiant connecté (programme + inscription + verrouillage)
 * GET /api/v1/student/trainings/{id}
 */
export async function fetchStudentTrainingById(id: string): Promise<APIStudentTrainingDetailResponse | null> {
  const response = await studentFetch(`/api/v1/student/trainings/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Erreur lors de la récupération de la formation");
  return response.json();
}

/**
 * Souscription à une formation
 * POST /api/v1/student/trainings/{id}/subscribe
 */
export async function subscribeToTraining(id: string): Promise<void> {
  const response = await studentFetch(`/api/v1/student/trainings/${id}/subscribe`, { method: "POST" });
  if (!response.ok) throw new Error("Erreur lors de la souscription à la formation");
}

export function useStudentTrainingsList() {
  const query = useQuery({
    queryKey: ["trainings", "student-list"],
    queryFn: fetchStudentTrainings,
    staleTime: 1000 * 30,
  });
  return { items: query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

export function useTrainingsCatalog(params: TrainingsCatalogParams = {}) {
  const query = useQuery({
    queryKey: ["trainings", "catalog", params],
    queryFn: () => fetchTrainingsCatalog(params),
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

export function useStudentTrainingDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: ["trainings", "student-detail", id],
    queryFn: () => fetchStudentTrainingById(id as string),
    enabled: !!id,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

export function useSubscribeToTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscribeToTraining(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainings"] }),
  });
}