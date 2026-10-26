import { Link } from "@tanstack/react-router";
import { Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/format";
import type { APIPublicTrainingCatalogItem } from "@/data/trainings";

interface CatalogCardProps {
  training: APIPublicTrainingCatalogItem;
  already: boolean;
  /** Une souscription est en cours (toutes cartes confondues) : tous les boutons sont désactivés */
  busy: boolean;
  /** La souscription en cours concerne cette carte : affiche le loader */
  submitting: boolean;
  onSubscribe: () => void;
}

export function CatalogCard({ training: t, already, busy, submitting, onSubscribe }: CatalogCardProps) {
  const deadlinePassed = new Date(t.registrationDeadline) < new Date();
  const closed = t.enrollmentStatus !== "open" || deadlinePassed;
  const canEnroll = !already && !closed && (t.seatsRemaining > 0 || t.waitingListEnabled);
  const cta = already
    ? "Déjà inscrit"
    : closed
      ? "Inscriptions fermées"
      : t.seatsRemaining <= 0
        ? "Liste d'attente"
        : "S'inscrire";

  return (
    <Card className="flex flex-col overflow-hidden">
      <div
        className="h-24"
        style={{
          background: `linear-gradient(135deg, ${t.coverColor}, color-mix(in oklab, ${t.coverColor} 40%, transparent))`,
        }}
      />
      <CardContent className="flex flex-1 flex-col space-y-3 p-5">
        <div>
          <p className="text-xs text-muted-foreground">
            {t.theme} · {t.level}
          </p>
          <Link to="/trainings/$id/catalogue" params={{ id: t.id }} className="mt-0.5 block font-medium hover:underline">
            {t.title}
          </Link>
        </div>
        <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">{t.short}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t.seatsRemaining}/{t.maxSeats}
          </span>
          <span>{t.duration}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Prix</p>
            <p className="font-semibold tabular-nums">{formatFCFA(t.price)}</p>
          </div>
          <Button
            size="sm"
            variant={closed ? "secondary" : "default"}
            disabled={!canEnroll || busy}
            onClick={onSubscribe}
            className={cn(already && "opacity-50", closed && "bg-muted text-muted-foreground hover:bg-muted")}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Inscription…
              </>
            ) : (
              cta
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}