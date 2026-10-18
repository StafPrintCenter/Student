import { useQuery } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type { APITrainingPaymentsSummary } from "@/data/payments";

const resourceKey = "training-payments";

async function fetchTrainingPayments(trainingId: string): Promise<APITrainingPaymentsSummary | null> {
  const response = await studentFetch(`/api/student/trainings/catalogs/${trainingId}/payments`);
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw new Error("Erreur lors de la récupération des paiements");
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