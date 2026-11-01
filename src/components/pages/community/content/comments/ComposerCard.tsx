import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewCommentForm } from "../../comments/NewForm";
import type { APICommunityPostDetail } from "@/data/community";

interface CommentComposerCardProps {
  post: Pick<APICommunityPostDetail, "id" | "status" | "isLocked">;
  canComment: boolean;
}

export function CommentComposerCard({ post, canComment }: CommentComposerCardProps) {
  if (!canComment) {
    const reason =
      post.status === "hidden"
        ? "Cette publication est masquée : les commentaires sont désactivés."
        : post.isLocked
          ? "Les commentaires sont fermés sur cette publication."
          : "Vous ne pouvez pas commenter cette publication.";

    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" /> {reason}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <NewCommentForm postId={post.id} />
      </CardContent>
    </Card>
  );
}