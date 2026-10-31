import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type { APICommunityPostDetail, APICommunityPostsListResponse, CommunityPostCreatePayload, CommunityPostsListParams, CommunityPostUpdatePayload } from "@/data/community";

const postsKey = ["community", "posts"] as const;

function buildQuery(params: CommunityPostsListParams): string {
  const qp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue;
    qp.append(key, value === true ? "1" : String(value));
  }
  return qp.toString();
}

/* ---- Fil des publications ---- */

async function fetchPosts(params: CommunityPostsListParams = {}): Promise<APICommunityPostsListResponse> {
  const response = await studentFetch(`/api/community/posts/list?${buildQuery(params)}`);
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération des publications");
  return response.json();
}

export const fetchStudentCommunityPosts = fetchPosts;

export function useCommunityPostsList(params: CommunityPostsListParams = {}) {
  const query = useQuery({
    queryKey: [...postsKey, "list", params],
    queryFn: () => fetchPosts(params),
    staleTime: 1000 * 30,
    // pendant un changement de filtre ou de page, l'écran garde la liste précédente
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

/* ---- Détail ---- */

async function fetchPostById(id: string): Promise<APICommunityPostDetail | null> {
  const response = await studentFetch(`/api/community/posts/${id}`);
  // 403 = formation dont l'étudiant n'est pas membre, 404 = publication inexistante
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération de la publication");
  const json: { data: APICommunityPostDetail } = await response.json();
  return json.data;
}

export const fetchStudentCommunityPostById = fetchPostById;

export function useCommunityPostDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: [...postsKey, "detail", id],
    queryFn: () => fetchPostById(id as string),
    enabled: !!id,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Création ---- */

async function createPost(payload: CommunityPostCreatePayload): Promise<APICommunityPostDetail> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("body", payload.body);
  fd.append("categoryId", payload.categoryId);
  if (payload.trainingId) fd.append("trainingId", payload.trainingId);
  if (payload.type) fd.append("type", payload.type);
  if (payload.tags?.length) fd.append("tags", payload.tags.join(","));
  payload.attachments?.forEach((file) => fd.append("attachments[]", file));

  const response = await studentFetch(`/api/community/posts/create`, { method: "POST", body: fd });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la publication");
  const json: { data: APICommunityPostDetail } = await response.json();
  return json.data;
}

export const createStudentCommunityPost = createPost;

export function useCreateCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunityPostCreatePayload) => createPost(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: postsKey }),
  });
}

/* ---- Modification ---- */

async function updatePost(id: string, payload: CommunityPostUpdatePayload): Promise<APICommunityPostDetail> {
  const fd = new FormData();
  if (payload.title !== undefined) fd.append("title", payload.title);
  if (payload.body !== undefined) fd.append("body", payload.body);
  if (payload.categoryId !== undefined) fd.append("categoryId", payload.categoryId);
  if (payload.type !== undefined) fd.append("type", payload.type);
  // Une valeur vide serait ignorée par le backend : pour retirer tous les tags on envoie un tableau JSON vide
  if (payload.tags !== undefined) fd.append("tags", payload.tags.length ? payload.tags.join(",") : "[]");

  const response = await studentFetch(`/api/community/posts/${id}`, { method: "PUT", body: fd });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la modification de la publication");
  const json: { data: APICommunityPostDetail } = await response.json();
  return json.data;
}

export const updateStudentCommunityPost = updatePost;

export function useUpdateCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CommunityPostUpdatePayload }) => updatePost(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: postsKey }),
  });
}

/* ---- Suppression ---- */

/** `reason` est facultatif et surtout utile aux modérateurs */
async function deletePost(id: string, reason?: string): Promise<void> {
  const suffix = reason?.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : "";
  const response = await studentFetch(`/api/community/posts/${id}${suffix}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw await parseApiError(response, "Erreur lors de la suppression");
}

export const deleteStudentCommunityPost = deletePost;

export function useDeleteCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => deletePost(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: postsKey }),
  });
}