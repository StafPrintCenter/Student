import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APICommunityComment,
  APICommunityCommentsListResponse,
  CommunityCommentCreatePayload,
  CommunityCommentsListParams,
  CommunityRepliesListParams,
} from "@/data/community";

const commentsKey = ["community", "comments"] as const;
// Publications (liste et détail) : leur compteur de commentaires change avec les commentaires
const postsKey = ["community", "posts"] as const;

const invalidateAll = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: commentsKey });
  qc.invalidateQueries({ queryKey: postsKey });
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    qp.append(key, String(value));
  }
  return qp.toString();
}

/* ---- Commentaires de premier niveau d'une publication ---- */

async function fetchComments(
  postId: string,
  params: CommunityCommentsListParams = {}
): Promise<APICommunityCommentsListResponse> {
  const response = await studentFetch(`/api/community/posts/${postId}/comments/list?${buildQuery({ ...params })}`);
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération des commentaires");
  return response.json();
}

export const fetchStudentCommunityComments = fetchComments;

export function useCommunityComments(postId: string | undefined, params: CommunityCommentsListParams = {}) {
  const query = useQuery({
    queryKey: [...commentsKey, "list", postId, params],
    queryFn: () => fetchComments(postId as string, params),
    enabled: !!postId,
    staleTime: 1000 * 30,
    // pendant un changement de tri ou de page, l'écran garde la liste précédente
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

/* ---- Réponses à un commentaire ---- */

async function fetchReplies(
  commentId: string,
  params: CommunityRepliesListParams = {}
): Promise<APICommunityCommentsListResponse> {
  const response = await studentFetch(`/api/community/comments/${commentId}/replies?${buildQuery({ ...params })}`);
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération des réponses");
  return response.json();
}

export const fetchStudentCommunityReplies = fetchReplies;

export function useCommunityReplies(commentId: string | undefined, params: CommunityRepliesListParams = {}) {
  const query = useQuery({
    queryKey: [...commentsKey, "replies", commentId, params],
    queryFn: () => fetchReplies(commentId as string, params),
    enabled: !!commentId,
    staleTime: 1000 * 30,
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

/* ---- Création (commentaire ou réponse) ---- */

async function createComment(postId: string, payload: CommunityCommentCreatePayload): Promise<APICommunityComment> {
  const fd = new FormData();
  fd.append("body", payload.body);
  if (payload.parentId) fd.append("parentId", payload.parentId);

  const response = await studentFetch(`/api/community/posts/${postId}/comments/create`, { method: "POST", body: fd });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de l'envoi du commentaire");
  const json: { data: APICommunityComment } = await response.json();
  return json.data;
}

export const createStudentCommunityComment = createComment;

export function useCreateCommunityComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: CommunityCommentCreatePayload }) =>
      createComment(postId, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

/* ---- Modification ---- */

async function updateComment(id: string, body: string): Promise<APICommunityComment> {
  const fd = new FormData();
  fd.append("body", body);

  const response = await studentFetch(`/api/community/comments/${id}`, { method: "PUT", body: fd });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la modification du commentaire");
  const json: { data: APICommunityComment } = await response.json();
  return json.data;
}

export const updateStudentCommunityComment = updateComment;

export function useUpdateCommunityComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => updateComment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey }),
  });
}

/* ---- Suppression (les réponses du commentaire sont supprimées avec lui) ---- */

/** `reason` est facultatif et surtout utile aux modérateurs */
async function deleteComment(id: string, reason?: string): Promise<void> {
  const suffix = reason?.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : "";
  const response = await studentFetch(`/api/community/comments/${id}${suffix}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw await parseApiError(response, "Erreur lors de la suppression");
}

export const deleteStudentCommunityComment = deleteComment;

export function useDeleteCommunityComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => deleteComment(id, reason),
    onSuccess: () => invalidateAll(qc),
  });
}