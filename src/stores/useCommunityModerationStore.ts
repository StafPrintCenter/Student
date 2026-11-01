import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APICommunityComment,
  APICommunityPostDetail,
  APICommunityReportResult,
  CommunityCommentModerationAction,
  CommunityContentTarget,
  CommunityPostModerationAction,
  CommunityReportPayload,
} from "@/data/community";

const postsKey = ["community", "posts"] as const;
const commentsKey = ["community", "comments"] as const;

/** Erreur API portant le code HTTP : 409 = déjà signalé, ou état déjà appliqué */
export class CommunityApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const contentPath = (t: CommunityContentTarget) =>
  t.kind === "post" ? `/api/community/posts/${t.id}` : `/api/community/comments/${t.id}`;

/* ---- Signalement ---- */

async function reportContent(
  target: CommunityContentTarget,
  payload: CommunityReportPayload
): Promise<APICommunityReportResult> {
  const fd = new FormData();
  fd.append("reason", payload.reason);
  if (payload.details) fd.append("details", payload.details);

  const response = await studentFetch(`${contentPath(target)}/report`, { method: "POST", body: fd });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de l'envoi du signalement");
  return response.json();
}

export const reportStudentCommunityContent = reportContent;

export function useReportCommunityContent() {
  return useMutation({
    mutationFn: ({ target, payload }: { target: CommunityContentTarget; payload: CommunityReportPayload }) =>
      reportContent(target, payload),
  });
}

/* ---- Modération d'une publication (pin, lock, hide) ---- */

async function moderatePost(
  id: string,
  action: CommunityPostModerationAction,
  reason?: string
): Promise<APICommunityPostDetail | null> {
  const fd = new FormData();
  fd.append("action", action);
  if (reason) fd.append("reason", reason);

  const response = await studentFetch(`/api/community/posts/${id}/moderate`, { method: "POST", body: fd });
  if (!response.ok) throw await parseApiError(response, "Action impossible");
  const json = await response.json().catch(() => null);
  return (json?.data ?? null) as APICommunityPostDetail | null;
}

export const moderateStudentCommunityPost = moderatePost;

export function useModerateCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: CommunityPostModerationAction; reason?: string }) =>
      moderatePost(id, action, reason),
    onSuccess: (post, { id }) => {
      // Détail : mise à jour locale avec la réponse (un rechargement compterait une vue de plus)
      if (post) qc.setQueryData([...postsKey, "detail", id], post);
      else qc.invalidateQueries({ queryKey: [...postsKey, "detail", id] });
      // Listes : épinglage (ordre du fil), badges et visibilité
      qc.invalidateQueries({ queryKey: [...postsKey, "list"] });
    },
    // 409 : l'état demandé était déjà appliqué, l'écran était donc en retard
    onError: (err) => {
      if (err instanceof CommunityApiError && err.status === 409) qc.invalidateQueries({ queryKey: postsKey });
    },
  });
}

/* ---- Modération d'un commentaire (hide, unhide) ---- */

async function moderateComment(
  id: string,
  action: CommunityCommentModerationAction,
  reason?: string
): Promise<APICommunityComment | null> {
  const fd = new FormData();
  fd.append("action", action);
  if (reason) fd.append("reason", reason);

  const response = await studentFetch(`/api/community/comments/${id}/moderate`, { method: "POST", body: fd });
  if (!response.ok) throw await parseApiError(response, "Action impossible");
  const json = await response.json().catch(() => null);
  return (json?.data ?? null) as APICommunityComment | null;
}

export const moderateStudentCommunityComment = moderateComment;

export function useModerateCommunityComment() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: commentsKey });
    // le compteur de commentaires de la publication ne compte que les commentaires publiés
    qc.invalidateQueries({ queryKey: postsKey });
  };

  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: CommunityCommentModerationAction; reason?: string }) =>
      moderateComment(id, action, reason),
    onSuccess: refresh,
    onError: (err) => {
      if (err instanceof CommunityApiError && err.status === 409) qc.invalidateQueries({ queryKey: commentsKey });
    },
  });
}