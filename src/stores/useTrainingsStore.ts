import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type { APIStudentTrainingEnrollment, APIStudentTrainingDetailResponse, APIPublicTrainingCatalogItem, APIPublicTrainingDetail } from "@/data/trainings";

const resourceKey = "trainings";

interface CatalogListResponse {
  data: APIPublicTrainingCatalogItem[];
  links: unknown;
  meta: { current_page: number; last_page: number; total: number; per_page: number; from: number | null; to: number | null };
}

export interface TrainingsCatalogParams {
  page?: number;
  perPage?: number;
  search?: string;
}

/* ---- Mes formations (inscriptions de l'étudiant connecté) ---- */

async function fetchTrainings(): Promise<APIStudentTrainingEnrollment[]> {
  const response = await studentFetch(`/api/student/trainings/list`);
  if (!response.ok) throw new Error("Erreur lors de la récupération de vos formations");
  const json: { data: APIStudentTrainingEnrollment[] } = await response.json();
  return json.data;
}

export const fetchStudentTrainings = fetchTrainings;

export function useStudentTrainingsList() {
  const query = useQuery({
    queryKey: [resourceKey, "student-list"],
    queryFn: fetchTrainings,
    staleTime: 1000 * 30,
  });
  return { items: query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Catalogue public ---- */

async function fetchCatalog(params: TrainingsCatalogParams = {}): Promise<CatalogListResponse> {
  const qp = new URLSearchParams();
  qp.append("page", String(params.page ?? 1));
  qp.append("perPage", String(params.perPage ?? 12));
  if (params.search) qp.append("search", params.search);

  const response = await studentFetch(`/api/public/trainings/catalogs/list?${qp.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération du catalogue");
  return response.json();
}

export const fetchTrainingsCatalog = fetchCatalog;

export function useTrainingsCatalog(params: TrainingsCatalogParams = {}) {
  const query = useQuery({
    queryKey: [resourceKey, "catalog", params],
    queryFn: () => fetchCatalog(params),
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

/* ---- Détail d'une formation (programme + inscription + verrouillage) ---- */

async function fetchTrainingById(id: string): Promise<APIStudentTrainingDetailResponse | null> {
  const response = await studentFetch(`/api/student/trainings/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Erreur lors de la récupération de la formation");
  return response.json();
}

export const fetchStudentTrainingById = fetchTrainingById;

export function useStudentTrainingDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "student-detail", id],
    queryFn: () => fetchTrainingById(id as string),
    enabled: !!id,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Souscription — action dédiée, hors factory générique ---- */

async function subscribeTraining(id: string): Promise<void> {
  const response = await studentFetch(`/api/student/trainings/${id}/subscribe`, { method: "POST" });
  if (!response.ok) throw new Error("Erreur lors de la souscription à la formation");
}

export const subscribeToTraining = subscribeTraining;

export function useSubscribeToTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscribeTraining(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}