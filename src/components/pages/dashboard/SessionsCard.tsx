import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSessionRow } from "./SessionRow";
import { sortSessionsForDisplay } from "@/data/sessions";
import { useSessionsList } from "@/stores/useSessionsStore";

const MAX_SHOWN = 3;

export function DashboardSessionsCard() {
  // Mêmes paramètres que la carte « À venir » du calendrier : la requête est partagée via le cache
  const { items, meta, isLoading, isError } = useSessionsList({ upcoming: true, perPage: 20 });

  const upcoming = useMemo(() => sortSessionsForDisplay(items).filter((s) => s.isUpcoming), [items]);
  const shown = upcoming.slice(0, MAX_SHOWN);
  const hidden = (meta?.total ?? upcoming.length) - shown.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Prochaines sessions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sessions">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger vos sessions.</p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">Rien de prévu prochainement.</p>
        ) : (
          <>
            <ul className="divide-y">
              {shown.map((s) => (
                <DashboardSessionRow key={s.id} session={s} />
              ))}
            </ul>
            {hidden > 0 && (
              <p className="pt-3 text-xs text-muted-foreground">
                + {hidden} autre{hidden > 1 ? "s" : ""} session{hidden > 1 ? "s" : ""} à venir
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}