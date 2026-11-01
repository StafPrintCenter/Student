import { getReactionConfig } from "@/data/community";

interface ReactionSummaryProps {
  reactions: Record<string, number>;
  total: number;
  onClick: () => void;
}

/** Les trois réactions les plus données et le total ; au clic, la liste de qui a réagi */
export function ReactionSummary({ reactions, total, onClick }: ReactionSummaryProps) {
  if (total <= 0) return null;

  const top = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      title="Voir qui a réagi"
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <span className="flex -space-x-1">
        {top.map(([type]) => (
          <span
            key={type}
            className="grid h-5 w-5 place-items-center rounded-full border border-background bg-muted text-xs leading-none"
          >
            {getReactionConfig(type).emoji}
          </span>
        ))}
      </span>
      <span className="tabular-nums">{total}</span>
    </button>
  );
}