import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrainingSessionRow } from "@/components/pages/sessions/shared/Row";
import { sortSessionsForDisplay } from "@/data/sessions";
import { useTrainingSessions } from "@/stores/useSessionsStore";

const MAX_SHOWN = 4;

export function TrainingSessionsCard({ trainingId }: { trainingId: string }) {
  const { items, isLoading, isError } = useTrainingSessions(trainingId, { perPage: 50 });
  const sessions = useMemo(() => sortSessionsForDisplay(items), [items]);
  const shown = sessions.slice(0, MAX_SHOWN);
  const hidden = sessions.length - shown.length;
  const toConfirm = sessions.filter((s) => s.isUpcoming && !s.myResponse).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" /> Sessions
          {toConfirm > 0 && (
            <Badge variant="outline" className="border-warning/40 bg-warning/15 text-[10px] text-warning-foreground">
              {toConfirm} à confirmer
            </Badge>
          )}
        </CardTitle>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/sessions">
            Toutes mes sessions <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : isError ? (
          <p className="text-xs text-destructive">Impossible de charger les sessions de cette formation.</p>
        ) : shown.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">Aucune session planifiée pour cette formation.</p>
        ) : (
          <>
            <ul className="divide-y">
              {shown.map((s) => (
                <TrainingSessionRow key={s.id} trainingId={trainingId} session={s} />
              ))}
            </ul>
            {hidden > 0 && (
              <p className="pt-3 text-xs text-muted-foreground">
                + {hidden} autre{hidden > 1 ? "s" : ""} session{hidden > 1 ? "s" : ""} dans{" "}
                <Link to="/sessions" className="underline underline-offset-4">
                  vos sessions
                </Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}