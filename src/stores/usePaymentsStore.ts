import { useQuery } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import { parseApiError } from "@/lib/api/error";
import type { APIPaymentsSummaryResponse, APITrainingPaymentsSummary } from "@/data/payments";

const resourceKey = "training-payments";

/* ---- Vue d'ensemble (toutes les formations) ---- */

async function fetchPaymentsSummary(): Promise<APIPaymentsSummaryResponse> {
  const response = await studentFetch(`/api/student/trainings/payments/summary`);
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération de vos paiements.");
  return response.json();
}

export const fetchStudentPaymentsSummary = fetchPaymentsSummary;

export function usePaymentsSummary() {
  const query = useQuery({
    queryKey: [resourceKey, "summary"],
    queryFn: fetchPaymentsSummary,
    staleTime: 1000 * 30,
  });
  return {
    summary: query.data?.summary ?? null,
    items: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/* ---- Détail des paiements d'une formation ---- */

async function fetchTrainingPayments(trainingId: string): Promise<APITrainingPaymentsSummary | null> {
  const response = await studentFetch(`/api/student/trainings/payments/${trainingId}/detail`);
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération des paiements.");
  const json: { data: APITrainingPaymentsSummary } = await response.json();
  return json.data;
}

export const fetchStudentTrainingPayments = fetchTrainingPayments;

/** `enabled` permet de ne charger qu'à l'ouverture du modal */
export function useTrainingPayments(trainingId: string | undefined, enabled = true) {
  const query = useQuery({
    queryKey: [resourceKey, trainingId],
    queryFn: () => fetchTrainingPayments(trainingId as string),
    enabled: !!trainingId && enabled,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}