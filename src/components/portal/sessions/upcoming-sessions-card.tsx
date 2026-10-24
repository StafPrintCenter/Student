import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionAgendaRow } from "@/components/portal/sessions/session-agenda-row";
import { sortSessionsForDisplay } from "@/data/sessions";
import { useSessionsList } from "@/stores/useSessionsStore";

const FETCH_COUNT = 20;
const MAX_SHOWN = 5;

/** Prochaines sessions, indépendamment du mois affiché dans le calendrier */
export function UpcomingSessionsCard({ onShowList }: { onShowList?: () => void }) {
  const { items, meta, isLoading, isError } = useSessionsList({ upcoming: true, perPage: FETCH_COUNT });

  const upcoming = useMemo(
    () => sortSessionsForDisplay(items).filter((s) => s.isUpcoming).slice(0, MAX_SHOWN),
    [items]
  );
  const hidden = (meta?.total ?? items.length) - upcoming.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">À venir</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les sessions à venir.</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune session à venir.</p>
        ) : (
          <>
            <ul className="divide-y">
              {upcoming.map((s) => (
                <SessionAgendaRow key={s.id} session={s} lead="date" />
              ))}
            </ul>
            {hidden > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-muted-foreground">
                <span>
                  + {hidden} autre{hidden > 1 ? "s" : ""} session{hidden > 1 ? "s" : ""} à venir
                </span>
                {onShowList && (
                  <Button size="sm" variant="link" className="h-auto p-0 text-xs" onClick={onShowList}>
                    Voir la vue liste
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}