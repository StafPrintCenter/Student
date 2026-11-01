import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityAvatar, fullDate, timeAgo, AuthorRoleBadge, CategoryBadge, PostFlagBadges, PostTypeBadge, PostTags, TrainingBadge, MineBadge } from "@/components/pages/community/shared";
import { PostAttachments } from "@/components/pages/community/detail";
import { ReactionControl } from "@/components/pages/community/content/reactions/Control";
import type { APICommunityPostDetail } from "@/data/community";

interface PostDetailCardProps {
  post: APICommunityPostDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export function PostDetailCard({ post, onEdit, onDelete }: PostDetailCardProps) {
  const tags = post.tags ?? [];
  const { canEdit, canDelete } = post.permissions;

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <PostTypeBadge type={post.type} />
          <CategoryBadge category={post.category} />
          <PostFlagBadges post={post} />
          {post.training && <TrainingBadge training={post.training} />}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl leading-tight md:text-3xl">{post.title}</h1>
          {(canEdit || canDelete) && (
            <div className="flex shrink-0 gap-1">
              {canEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
                </Button>
              )}
              {canDelete && (
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <CommunityAvatar name={post.author.name} photo={post.author.photo} />
          <div className="min-w-0 space-y-0.5 text-sm">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{post.author.name}</span>
              {post.isMine && <MineBadge />}
              <AuthorRoleBadge role={post.author.role} />
            </p>
            <p className="text-xs text-muted-foreground">
              Publiée {timeAgo(post.createdAt)}
              {post.editedAt && <span title={fullDate(post.editedAt)}> · modifiée {timeAgo(post.editedAt)}</span>}
            </p>
          </div>
        </div>

        {/* Le contenu est du texte brut : seuls les retours à la ligne sont conservés */}
        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">{post.body}</p>

        {tags.length > 0 && <PostTags tags={tags} />}

        <ReactionControl
          variant="bar"
          className="border-t pt-4"
          target={{ kind: "post", id: post.id }}
          myReaction={post.myReaction}
          reactions={post.reactions}
          reactionsTotal={post.reactionsTotal}
          canReact={post.permissions.canReact}
        />

        <PostAttachments attachments={post.attachments ?? []} />
      </CardContent>
    </Card>
  );
}