import { useQuery } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import type { APICommunityCategory } from "@/data/community";

async function fetchCommunityCategories(): Promise<APICommunityCategory[]> {
  const response = await studentFetch(`/api/community/categories/list`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des catégories");
  const json: { data: APICommunityCategory[] } = await response.json();
  return json.data;
}

export const fetchStudentCommunityCategories = fetchCommunityCategories;

// Catégories actives dans leur ordre d'affichage
const activeCategories = (data: APICommunityCategory[]) =>
  data.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

export function useCommunityCategories() {
  const query = useQuery({
    queryKey: ["community", "categories"],
    queryFn: fetchCommunityCategories,
    select: activeCategories,
    staleTime: 1000 * 60 * 10,
  });
  return { categories: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
}