import { Eye, GraduationCap, MessageSquare, Paperclip, SmilePlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { APICommunityPostListItem, APICommunityTrainingRef } from "@/data/community";

export function TrainingBadge({ training }: { training: APICommunityTrainingRef }) {
  return (
    <Badge variant="outline" className="max-w-56 gap-1 text-[10px]">
      <GraduationCap className="h-3 w-3 shrink-0" />
      <span className="truncate">{training.title}</span>
    </Badge>
  );
}

export function PostTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          #{tag}
        </span>
      ))}
    </div>
  );
}

type StatsPost = Pick<
  APICommunityPostListItem,
  "commentsCount" | "reactionsTotal" | "viewsCount" | "attachmentsCount" | "myReaction"
>;

type Stat = { icon: LucideIcon; value: number; label: string; highlight?: boolean };

export function PostStats({ post }: { post: StatsPost }) {
  const stats: Stat[] = [
    { icon: MessageSquare, value: post.commentsCount, label: "commentaires" },
    { icon: SmilePlus, value: post.reactionsTotal, label: "réactions", highlight: !!post.myReaction },
    { icon: Eye, value: post.viewsCount, label: "vues" },
  ];
  if (post.attachmentsCount > 0) {
    stats.push({ icon: Paperclip, value: post.attachmentsCount, label: "pièces jointes" });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {stats.map(({ icon: Icon, value, label, highlight }) => (
        <span key={label} title={label} className={cn("inline-flex items-center gap-1.5", highlight && "text-primary")}>
          <Icon className="h-3.5 w-3.5" />
          <span className="tabular-nums">{value}</span>
        </span>
      ))}
    </div>
  );
}