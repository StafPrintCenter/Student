import { Link } from "@tanstack/react-router";
import { Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LessonSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-10 w-1/2" />
    </div>
  );
}

export function LessonError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <p className="text-destructive">Impossible de charger cette leçon.</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Réessayer
      </Button>
    </div>
  );
}

export function LessonLockedNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm">
      <p className="flex items-center gap-2 font-medium text-warning-foreground">
        <Lock className="h-4 w-4" /> Contenu verrouillé
      </p>
      <p className="text-xs text-muted-foreground">
        Réglez le montant minimum requis pour accéder aux leçons de cette formation.
      </p>
      <Button asChild size="sm">
        <Link to="/payments" onClick={onClose}>
          Voir mes paiements
        </Link>
      </Button>
    </div>
  );
}