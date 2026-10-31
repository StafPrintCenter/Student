import { CheckCircle2, EyeOff, Lock, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  communityAuthorRoleMap,
  communityPostTypeMap,
  type APICommunityCategoryRef,
  type APICommunityPostListItem,
  type CommunityAuthorRole,
  type CommunityPostType,
} from "@/data/community";

export function PostTypeBadge({ type }: { type: CommunityPostType }) {
  const config = communityPostTypeMap[type] ?? { label: type, className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export function AuthorRoleBadge({ role }: { role: CommunityAuthorRole }) {
  const config = communityAuthorRoleMap[role] ?? { label: role, className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

/** Catégorie : pastille de sa couleur, texte neutre (lisible en clair comme en sombre) */
export function CategoryBadge({ category }: { category: APICommunityCategoryRef }) {
  return (
    <Badge variant="outline" className="gap-1.5 text-[10px] font-medium">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: category.color }} />
      {category.name}
    </Badge>
  );
}

type FlagsPost = Pick<APICommunityPostListItem, "isPinned" | "isLocked" | "status" | "bestAnswerId" | "type">;

/** Épinglée, verrouillée, masquée, résolue */
export function PostFlagBadges({ post }: { post: FlagsPost }) {
  return (
    <>
      {post.isPinned && (
        <Badge variant="outline" className="gap-1 border-primary/40 bg-primary/10 text-[10px] text-primary">
          <Pin className="h-3 w-3" /> Épinglée
        </Badge>
      )}
      {post.isLocked && (
        <Badge variant="outline" className="gap-1 text-[10px]">
          <Lock className="h-3 w-3" /> Verrouillée
        </Badge>
      )}
      {post.status === "hidden" && (
        <Badge variant="outline" className="gap-1 border-destructive/40 bg-destructive/10 text-[10px] text-destructive">
          <EyeOff className="h-3 w-3" /> Masquée
        </Badge>
      )}
      {post.type === "question" && post.bestAnswerId && (
        <Badge variant="outline" className="gap-1 border-emerald/40 bg-emerald/15 text-[10px] text-emerald">
          <CheckCircle2 className="h-3 w-3" /> Résolue
        </Badge>
      )}
    </>
  );
}