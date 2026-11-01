import { createContext, useContext } from "react";

export type CommentsContextValue = {
  postId: string;
  /** L'utilisateur peut désigner la meilleure réponse (question, et auteur ou modérateur) */
  canMarkBest: boolean;
};

const CommentsContext = createContext<CommentsContextValue>({ postId: "", canMarkBest: false });

export const CommentsContextProvider = CommentsContext.Provider;

export const useCommentsContext = () => useContext(CommentsContext);