import { History, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuizAttempts } from "@/stores/useQuizStore";
import { quizAttemptStatusMap } from "@/data/quiz";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function QuizAttemptsHistory({ quizId }: { quizId: string }) {
  const { attempts, bestScore, isLoading, isError } = useQuizAttempts(quizId);

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (isError) return <p className="text-xs text-destructive">Impossible de charger l'historique des tentatives.</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <History className="h-4 w-4 text-primary" /> Mes tentatives
        </p>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          Meilleur score :{" "}
          <strong className="text-foreground">{bestScore != null ? `${bestScore}%` : "—"}</strong>
        </span>
      </div>

      {attempts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Vous n'avez pas encore tenté ce quiz.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border border-border">
          {attempts.map((a) => {
            const config = quizAttemptStatusMap[a.status] ?? {
              label: a.status,
              className: "bg-muted text-muted-foreground border-border",
            };
            return (
              <li key={a.attemptId} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">Tentative n°{a.attemptNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.startedAt)}
                    {a.submittedAt && ` → ${formatDateTime(a.submittedAt)}`}
                    {a.isAutoSubmitted && " · soumise automatiquement"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="tabular-nums font-semibold">{a.score != null ? `${a.score}%` : "—"}</span>
                  <Badge variant="outline" className={cn("font-medium", config.className)}>
                    {config.label}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}