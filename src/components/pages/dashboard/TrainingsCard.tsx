import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentTrainingRow } from "./TrainingRow";
import { isActiveEnrollment } from "./Utils";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";

const MAX_SHOWN = 4;

export function CurrentTrainingsCard() {
  const { items, isLoading, isError } = useStudentTrainingsList();

  const active = items.filter((e) => isActiveEnrollment(e.status));
  const shown = active.slice(0, MAX_SHOWN);
  const hidden = active.length - shown.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Formations en cours</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/trainings">
            Voir tout <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger vos formations.</p>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Aucune formation active"
            description="Explorez notre catalogue pour vous inscrire à votre première formation."
            action={
              <Button asChild variant="outline">
                <Link to="/trainings">Explorer</Link>
              </Button>
            }
          />
        ) : (
          shown.map((e) => <CurrentTrainingRow key={e.enrollmentId} enrollment={e} />)
        )}

        {hidden > 0 && (
          <p className="text-xs text-muted-foreground">
            + {hidden} autre{hidden > 1 ? "s" : ""} formation{hidden > 1 ? "s" : ""} en cours
          </p>
        )}
      </CardContent>
    </Card>
  );
}