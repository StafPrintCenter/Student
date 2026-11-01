import { AuthorRoleBadge, CommunityAvatar, fullDate, MineBadge, timeAgo } from "@/components/pages/community/shared";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { getReactionConfig, type APICommunityReactionItem } from "@/data/community";

export function ReactionsList({ items }: { items: APICommunityReactionItem[] }) {
  const { user: me } = useStudentAuth();

  return (
    <ul className="divide-y">
      {items.map((r) => {
        const reaction = getReactionConfig(r.type);
        const isMe = !!me && r.user.role === "student" && r.user.id === me.id;

        return (
          <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <CommunityAvatar name={r.user.name} photo={r.user.photo} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="truncate font-medium">{r.user.name}</span>
                {isMe && <MineBadge />}
                <AuthorRoleBadge role={r.user.role} />
              </p>
              <p className="text-xs text-muted-foreground" title={fullDate(r.reactedAt)}>
                {timeAgo(r.reactedAt)}
              </p>
            </div>
            <span className="text-xl leading-none" title={reaction.label}>
              {reaction.emoji}
            </span>
          </li>
        );
      })}
    </ul>
  );
}