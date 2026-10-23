import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-11 w-11", month: "text-[9px]", day: "text-base" },
  md: { box: "h-14 w-14", month: "text-[10px]", day: "text-xl" },
  lg: { box: "h-20 w-20", month: "text-xs", day: "text-3xl" },
} as const;

interface SessionDateBlockProps {
  startsAt: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function SessionDateBlock({ startsAt, size = "md", className }: SessionDateBlockProps) {
  const date = new Date(startsAt);
  const s = sizes[size];

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-muted/40",
        s.box,
        className
      )}
    >
      <span className={cn("font-semibold uppercase tracking-wider text-primary", s.month)}>
        {format(date, "MMM", { locale: fr })}
      </span>
      <span className={cn("font-display font-bold leading-none", s.day)}>{format(date, "d")}</span>
    </div>
  );
}