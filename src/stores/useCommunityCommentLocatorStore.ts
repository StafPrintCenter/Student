import { useQuery } from "@tanstack/react-query";
import { fetchStudentCommunityComments, fetchStudentCommunityReplies } from "@/stores/useCommunityCommentsStore";
import type { APICommunityComment } from "@/data/community";

/** Où se trouve un commentaire dans l'affichage */
export type CommentLocation = {
  commentId: string;
  rootId: string;
  isReply: boolean;
  rootPage: number;
  replyPage: number;
};

const SCAN_PER_PAGE = 100; // maximum accepté par l'API
const MAX_SCAN_PAGES = 10; // garde-fou : 1 000 éléments au plus
const BATCH_SIZE = 5; // fils de réponses interrogés en parallèle

const pageOf = (index: number, perPage: number) => Math.floor(index / perPage) + 1;

/** Position d'un commentaire parmi les réponses d'un fil, -1 s'il n'y est pas */
async function indexInReplies(rootId: string, commentId: string): Promise<number> {
  let page = 1;
  let lastPage = 1;
  do {
    const res = await fetchStudentCommunityReplies(rootId, { page, perPage: SCAN_PER_PAGE });
    const index = res.data.findIndex((r) => r.id === commentId);
    if (index !== -1) return (page - 1) * SCAN_PER_PAGE + index;
    lastPage = res.meta.lastPage;
    page += 1;
  } while (page <= lastPage && page <= MAX_SCAN_PAGES);
  return -1;
}

async function locateComment(
  postId: string,
  commentId: string,
  listPerPage: number,
  repliesPerPage: number
): Promise<CommentLocation | null> {
  // 1. Commentaires de premier niveau, dans le même ordre que la liste par défaut
  const roots: APICommunityComment[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const res = await fetchStudentCommunityComments(postId, { page, perPage: SCAN_PER_PAGE, sort: "oldest" });
    roots.push(...res.data);
    lastPage = res.meta.lastPage;
    page += 1;
  } while (page <= lastPage && page <= MAX_SCAN_PAGES);

  const rootIndex = roots.findIndex((c) => c.id === commentId);
  if (rootIndex !== -1) {
    return { commentId, rootId: commentId, isReply: false, rootPage: pageOf(rootIndex, listPerPage), replyPage: 1 };
  }

  // 2. Sinon c'est une réponse : on cherche dans les fils qui en ont
  const threads = roots.map((root, index) => ({ root, index })).filter(({ root }) => root.repliesCount > 0);

  for (let i = 0; i < threads.length; i += BATCH_SIZE) {
    const results = await Promise.all(
      threads.slice(i, i + BATCH_SIZE).map(async ({ root, index }) => ({
        root,
        index,
        replyIndex: await indexInReplies(root.id, commentId),
      }))
    );
    const hit = results.find((r) => r.replyIndex !== -1);
    if (hit) {
      return {
        commentId,
        rootId: hit.root.id,
        isReply: true,
        rootPage: pageOf(hit.index, listPerPage),
        replyPage: pageOf(hit.replyIndex, repliesPerPage),
      };
    }
  }

  return null;
}

interface UseCommentLocatorArgs {
  postId: string | undefined;
  /** Valeur du paramètre ?comment= (absente = rien à chercher) */
  commentId: string | undefined;
  listPerPage: number;
  repliesPerPage: number;
}

export function useCommentLocator({ postId, commentId, listPerPage, repliesPerPage }: UseCommentLocatorArgs) {
  const enabled = !!postId && !!commentId;
  const query = useQuery({
    // Clé hors de ["community", "comments"] : un envoi ou une suppression ne relance pas la recherche
    queryKey: ["community", "comment-locate", postId, commentId, listPerPage, repliesPerPage],
    queryFn: () => locateComment(postId as string, commentId as string, listPerPage, repliesPerPage),
    enabled,
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
  });

  return {
    location: query.data ?? null,
    isLocating: enabled && query.isLoading,
    notFound: enabled && query.isSuccess && query.data === null,
    isError: enabled && query.isError,
  };
}