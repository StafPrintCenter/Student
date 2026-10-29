import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Compte à rebours basé sur l'horloge locale à partir du montage du composant
 * (monté juste après la réponse de /start), pour ne pas dépendre d'un décalage
 * entre l'horloge du navigateur et celle du serveur.
 */
export function useCountdown(limitSec: number | null, onExpire: () => void): number | null {
  const [remaining, setRemaining] = useState<number | null>(limitSec);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (limitSec == null) return;
    const endAt = Date.now() + limitSec * 1000;
    let fired = false;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !fired) {
        fired = true;
        clearInterval(id);
        onExpireRef.current();
      }
    };

    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, [limitSec]);

  return remaining;
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function QuizTimer({ remaining, total }: { remaining: number; total: number }) {
  const urgent = remaining <= 10;
  return (
    <div className="space-y-1.5">
      <div className={cn("flex items-center justify-between text-xs", urgent ? "text-destructive" : "text-muted-foreground")}>
        <span className="flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5" /> Temps restant
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">{formatClock(remaining)}</span>
      </div>
      <Progress value={(remaining / total) * 100} className="h-1.5" />
    </div>
  );
}