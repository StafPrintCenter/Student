import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CommentLocation } from "@/stores/useCommunityCommentLocatorStore";

/** Durée pendant laquelle le commentaire ciblé reste surligné, à partir de son affichage */
const HIGHLIGHT_MS = 5000;

export type CommentFocus = {
  commentId: string;
  rootId: string;
  /** Page de réponses à ouvrir (1 si la cible n'est pas une réponse) */
  replyPage: number;
  /** Surbrillance en cours */
  active: boolean;
  /** Appelé par le commentaire ciblé quand il s'affiche : lance le décompte de la surbrillance */
  onShown: () => void;
};

const CommentFocusContext = createContext<CommentFocus | null>(null);

export const CommentFocusProvider = CommentFocusContext.Provider;

/** null quand la page n'a pas été ouverte sur un commentaire précis */
export const useCommentFocus = () => useContext(CommentFocusContext);

export function useCommentFocusState(
  commentId: string | undefined,
  location: CommentLocation | null
): CommentFocus | null {
  const [active, setActive] = useState(true);
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onShown = useCallback(() => {
    if (started.current) return;
    started.current = true;
    timer.current = setTimeout(() => setActive(false), HIGHLIGHT_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return useMemo(
    () =>
      commentId && location
        ? { commentId, rootId: location.rootId, replyPage: location.replyPage, active, onShown }
        : null,
    [commentId, location, active, onShown]
  );
}