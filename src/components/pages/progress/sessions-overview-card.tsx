import { Link } from "@tanstack/react-router";
import { ArrowRight, BellRing, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { APIProgressSessionsStats } from "@/data/progress";

export function SessionsOverviewCard({ sessions }: { sessions: APIProgressSessionsStats }) {
  const answered = sessions.confirmed + sessions.declined;
  const answeredPercent = sessions.total > 0 ? Math.round((answered / sessions.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" /> Sessions
        </CardTitle>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/sessions">
            Voir <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {sessions.total === 0 ? (
          <p className="text-xs italic text-muted-foreground">Aucune session planifiée pour le moment.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3">
              <Figure label="Total" value={sessions.total} />
              <Figure label="Confirmées" value={sessions.confirmed} className="text-success" />
              <Figure label="Déclinées" value={sessions.declined} className="text-destructive" />
              <Figure label="Sans réponse" value={sessions.noResponse} className="text-warning" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Réponses données</span>
                <span className="tabular-nums">{answeredPercent}%</span>
              </div>
              <Progress value={answeredPercent} className="h-2" />
            </div>
          </>
        )}

        {sessions.upcomingNoResponse > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="space-y-1">
              <p className="text-xs">
                <strong>{sessions.upcomingNoResponse}</strong> session{sessions.upcomingNoResponse > 1 ? "s" : ""} à venir
                {sessions.upcomingNoResponse > 1 ? " attendent" : " attend"} votre réponse.
              </p>
              <Link to="/sessions" className="text-xs font-medium text-primary underline underline-offset-4">
                Répondre maintenant
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Figure({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}