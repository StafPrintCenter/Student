import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CommunityAvatar } from "@/components/portal/community/community-avatar";
import { fullDate, timeAgo } from "@/components/portal/community/community-format";
import { AuthorRoleBadge, CategoryBadge, PostFlagBadges, PostTypeBadge } from "@/components/portal/community/post-badges";
import { PostStats, PostTags, TrainingBadge } from "@/components/portal/community/post-meta";
import type { APICommunityPostListItem } from "@/data/community";

interface PostCardProps {
  post: APICommunityPostListItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const tags = post.tags ?? [];
  const hidden = post.status === "hidden";
  const { canEdit, canDelete } = post.permissions;

  return (
    <Card className={cn(post.isPinned && "border-primary/40", hidden && "opacity-80")}>
      <CardContent className="flex gap-3 p-4">
        <CommunityAvatar name={post.author.name} photo={post.author.photo} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{post.author.name}</span>
            <AuthorRoleBadge role={post.author.role} />
            <span title={fullDate(post.createdAt)}>{timeAgo(post.createdAt)}</span>
            {post.editedAt && <span title={fullDate(post.editedAt)}>· modifiée</span>}
          </div>

          <Link
            to="/community/$id"
            params={{ id: post.id }}
            className="block font-medium leading-snug hover:underline"
          >
            {post.title}
          </Link>

          <div className="flex flex-wrap items-center gap-1.5">
            <PostTypeBadge type={post.type} />
            <CategoryBadge category={post.category} />
            <PostFlagBadges post={post} />
            {post.training && <TrainingBadge training={post.training} />}
          </div>

          {hidden && post.hiddenReason && (
            <p className="rounded-md bg-destructive/5 p-2 text-xs text-destructive">
              Masquée par la modération : {post.hiddenReason}
            </p>
          )}

          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          {tags.length > 0 && <PostTags tags={tags} />}
          <PostStats post={post} />
        </div>

        {(canEdit || canDelete) && (
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            {canEdit && (
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Modifier" aria-label="Modifier" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Supprimer"
                aria-label="Supprimer"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}