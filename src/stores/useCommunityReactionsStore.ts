import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APICommunityCommentsListResponse,
  APICommunityPostDetail,
  APICommunityPostsListResponse,
  APICommunityReactionsListResponse,
  APICommunityReactionState,
  CommunityReactionsListParams,
  CommunityReactionTarget,
  CommunityReactionType,
} from "@/data/community";

const postsKey = ["community", "posts"] as const;
const commentsKey = ["community", "comments"] as const;
const reactionsKey = ["community", "reactions"] as const;

const basePath = (t: CommunityReactionTarget) =>
  t.kind === "post" ? `/api/community/posts/${t.id}` : `/api/community/comments/${t.id}`;

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    qp.append(key, String(value));
  }
  return qp.toString();
}

/** Lit { myReaction, reactions, reactionsTotal } (éventuellement dans "data") ; null si la réponse n'a pas cette forme */
async function readState(response: Response): Promise<APICommunityReactionState | null> {
  const body = await response.json().catch(() => null);
  const state = body?.data ?? body;
  if (state && typeof state.reactionsTotal === "number" && state.reactions && typeof state.reactions === "object") {
    return {
      myReaction: state.myReaction ?? null,
      // un objet vide peut arriver sous forme de tableau vide
      reactions: Array.isArray(state.reactions) ? {} : state.reactions,
      reactionsTotal: state.reactionsTotal,
    };
  }
  return null;
}

/* ---- Mise à jour du cache ---- */

function patchPost(qc: QueryClient, postId: string, state: APICommunityReactionState) {
  qc.setQueriesData<APICommunityPostDetail | null>({ queryKey: [...postsKey, "detail", postId] }, (old) =>
    old ? { ...old, ...state } : old
  );
  qc.setQueriesData<APICommunityPostsListResponse>({ queryKey: [...postsKey, "list"] }, (old) =>
    old && Array.isArray(old.data) ? { ...old, data: old.data.map((p) => (p.id === postId ? { ...p, ...state } : p)) } : old
  );
}

// Couvre à la fois la liste des commentaires et celle des réponses (même forme { data, meta })
function patchComment(qc: QueryClient, commentId: string, state: APICommunityReactionState) {
  qc.setQueriesData<APICommunityCommentsListResponse>({ queryKey: commentsKey }, (old) =>
    old && Array.isArray(old.data) ? { ...old, data: old.data.map((c) => (c.id === commentId ? { ...c, ...state } : c)) } : old
  );
}

function applyReactionState(qc: QueryClient, target: CommunityReactionTarget, state: APICommunityReactionState | null) {
  if (state) {
    if (target.kind === "post") patchPost(qc, target.id, state);
    else patchComment(qc, target.id, state);
  } else {
    // Réponse inattendue : on recharge plutôt que d'afficher un état faux
    qc.invalidateQueries({ queryKey: target.kind === "post" ? postsKey : commentsKey });
  }
  // la liste « qui a réagi » doit refléter le changement à sa prochaine ouverture
  qc.invalidateQueries({ queryKey: [...reactionsKey, target.kind, target.id] });
}

/* ---- Réagir ou changer de réaction ---- */

async function setReaction(target: CommunityReactionTarget, type: CommunityReactionType) {
  const fd = new FormData();
  fd.append("type", type);
  const response = await studentFetch(`${basePath(target)}/reaction`, { method: "PUT", body: fd });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de l'enregistrement de votre réaction");
  return readState(response);
}

export const setStudentCommunityReaction = setReaction;

export function useSetCommunityReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ target, type }: { target: CommunityReactionTarget; type: CommunityReactionType }) =>
      setReaction(target, type),
    onSuccess: (state, { target }) => applyReactionState(qc, target, state),
  });
}

/* ---- Retirer sa réaction ---- */

async function removeReaction(target: CommunityReactionTarget) {
  const response = await studentFetch(`${basePath(target)}/reaction`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw await parseApiError(response, "Erreur lors du retrait de votre réaction");
  return response.status === 204 ? null : readState(response);
}

export const removeStudentCommunityReaction = removeReaction;

export function useRemoveCommunityReaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ target }: { target: CommunityReactionTarget }) => removeReaction(target),
    onSuccess: (state, { target }) => applyReactionState(qc, target, state),
  });
}

/* ---- Qui a réagi ---- */

async function fetchReactions(
  target: CommunityReactionTarget,
  params: CommunityReactionsListParams
): Promise<APICommunityReactionsListResponse> {
  const response = await studentFetch(`${basePath(target)}/reactions/list?${buildQuery({ ...params })}`);
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération des réactions");
  return response.json();
}

export const fetchStudentCommunityReactions = fetchReactions;

export function useCommunityReactionsList(target: CommunityReactionTarget, params: CommunityReactionsListParams = {}) {
  const query = useQuery({
    queryKey: [...reactionsKey, target.kind, target.id, params],
    queryFn: () => fetchReactions(target, params),
    staleTime: 1000 * 15,
    placeholderData: keepPreviousData,
  });
  return {
    summary: query.data?.summary ?? {},
    total: query.data?.total ?? 0,
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}