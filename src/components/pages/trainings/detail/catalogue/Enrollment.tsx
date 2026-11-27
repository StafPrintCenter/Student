import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";
import type { APIPublicTrainingDetail } from "@/data/trainings";

interface EnrollmentCardProps {
  training: APIPublicTrainingDetail;
  isEnrolled: boolean;
  isSubmitting: boolean;
  onSubscribe: () => void;
}

export function EnrollmentCard({
  training,
  isEnrolled,
  isSubmitting,
  onSubscribe,
}: EnrollmentCardProps) {
  const discount = training.discountPercentage ?? 0;
  const deadlinePassed = new Date(training.registrationDeadline) < new Date();
  const closed = training.enrollmentStatus !== "open" || deadlinePassed;
  const isFull = training.maxSeats != null && (training.seatsRemaining ?? 0) <= 0;
  const canEnroll = !isEnrolled && !closed && (!isFull || training.waitingListEnabled);
  const ctaLabel = isEnrolled
    ? "Déjà inscrit"
    : closed
      ? "Inscriptions fermées"
      : isFull
        ? "Rejoindre la liste d'attente"
        : "S'inscrire";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Prix</p>
          <p className="text-2xl font-semibold tabular-nums">{formatFCFA(training.price)}</p>
          {discount > 0 && training.originalPrice != null && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Prix original</span>
              <span className="text-xs text-muted-foreground line-through">
                {formatFCFA(training.originalPrice)}
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                -{discount}% de réduction
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Places restantes</span>
          <span className="tabular-nums font-medium">
            {training.maxSeats == null ? "Illimité" : (training.seatsRemaining ?? 0)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Deadline</span>
          <span>{format(new Date(training.registrationDeadline), "d MMM yyyy", { locale: fr })}</span>
        </div>
        {isEnrolled ? (
          <Button className="w-full" variant="outline" asChild>
            <Link to="/trainings/$id/mine" params={{ id: training.id }}>Voir ma formation</Link>
          </Button>
        ) : (
          <Button className="w-full" disabled={!canEnroll || isSubmitting} onClick={onSubscribe}>
            {isSubmitting ? "Inscription…" : ctaLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
