import { CheckCircle2, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { APICommunityComment } from "@/data/community";

type FlagsComment = Pick<APICommunityComment, "isPostAuthor" | "isBestAnswer" | "status">;

/** « Auteur » (de la publication), « Meilleure réponse », « Masqué » */
export function CommentFlagBadges({ comment }: { comment: FlagsComment }) {
  return (
    <>
      {comment.isPostAuthor && (
        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
          Auteur
        </Badge>
      )}
      {comment.isBestAnswer && (
        <Badge variant="outline" className="gap-1 border-emerald/40 bg-emerald/15 text-[10px] text-emerald">
          <CheckCircle2 className="h-3 w-3" /> Meilleure réponse
        </Badge>
      )}
      {comment.status === "hidden" && (
        <Badge variant="outline" className="gap-1 border-destructive/40 bg-destructive/10 text-[10px] text-destructive">
          <EyeOff className="h-3 w-3" /> Masqué
        </Badge>
      )}
    </>
  );
}