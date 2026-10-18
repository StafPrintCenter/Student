import { useQuery } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type { APIProgressResponse } from "@/data/progress";

async function fetchProgress(): Promise<APIProgressResponse> {
  const response = await studentFetch(`/api/student/trainings/progress/list`);
  if (!response.ok) throw new Error("Erreur lors de la récupération de votre progression");
  return response.json();
}

export const fetchStudentProgress = fetchProgress;

export function useStudentProgress() {
  const query = useQuery({
    queryKey: ["trainings", "progress"],
    queryFn: fetchProgress,
    staleTime: 1000 * 30,
  });
  return {
    stats: query.data?.stats ?? null,
    items: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}