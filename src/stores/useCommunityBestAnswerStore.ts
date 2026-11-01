import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type { APICommunityPostDetail } from "@/data/community";

const postsKey = ["community", "posts"] as const;
const commentsKey = ["community", "comments"] as const;

async function markBestAnswer(postId: string, commentId: string): Promise<void> {
  const fd = new FormData();
  fd.append("commentId", commentId);

  const response = await studentFetch(`/api/community/posts/${postId}/best-answer`, { method: "POST", body: fd });
  if (!response.ok) throw await parseApiError(response, "Impossible de marquer cette réponse");
}

export const markStudentCommunityBestAnswer = markBestAnswer;

export function useMarkBestAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => markBestAnswer(postId, commentId),
    onSuccess: (_data, { postId, commentId }) => {
      // Détail : mise à jour locale (un rechargement compterait une vue de plus)
      qc.setQueriesData<APICommunityPostDetail | null>({ queryKey: [...postsKey, "detail", postId] }, (old) =>
        old ? { ...old, bestAnswerId: commentId } : old
      );
      // Listes : badge « Résolue » et filtre « questions sans réponse »
      qc.invalidateQueries({ queryKey: [...postsKey, "list"] });
      // Commentaires : la meilleure réponse passe en tête de la discussion
      qc.invalidateQueries({ queryKey: commentsKey });
    },
  });
}