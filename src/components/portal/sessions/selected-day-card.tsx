import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionAgendaRow } from "@/components/portal/sessions/session-agenda-row";
import type { APIStudentSession } from "@/data/sessions";

interface SelectedDayCardProps {
  day: Date | undefined;
  sessions: APIStudentSession[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function SelectedDayCard({ day, sessions, isLoading, isError, onRetry }: SelectedDayCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">{day ? format(day, "EEEE d MMMM AAAA", { locale: fr }) : ""}</CardTitle>
      </CardHeader>
      <CardContent>
        {!day ? (
          <p className="text-sm text-muted-foreground">Sélectionnez un jour pour voir ses sessions.</p>
        ) : isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : isError ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">Impossible de charger les sessions.</p>
            <Button size="sm" variant="outline" onClick={onRetry}>
              Réessayer
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune session ce jour.</p>
        ) : (
          <ul className="divide-y">
            {sessions.map((s) => (
              <SessionAgendaRow key={s.id} session={s} lead="icon" />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}