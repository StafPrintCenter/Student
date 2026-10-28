import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrainingSessionRow } from "@/components/pages/trainings/detail/mine/Base/training-session-row";
import { sortSessionsForDisplay } from "@/data/sessions";
import { useTrainingSessions } from "@/stores/useSessionsStore";

export function OtherSessionsList({ trainingId, currentSessionId }: { trainingId: string; currentSessionId: string }) {
  const { items, isLoading } = useTrainingSessions(trainingId, { perPage: 50 });
  const others = useMemo(
    () => sortSessionsForDisplay(items.filter((s) => s.id !== currentSessionId)).slice(0, 5),
    [items, currentSessionId]
  );

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (others.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Autres sessions de cette formation</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {others.map((s) => (
            <TrainingSessionRow key={s.id} trainingId={trainingId} session={s} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}