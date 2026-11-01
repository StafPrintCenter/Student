import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "./ReportDialog";
import { cn } from "@/lib/utils";
import type { CommunityContentTarget } from "@/data/community";
import { useIsContentReported } from "@/stores/useReportedContentStore";

interface ReportActionProps {
  target: CommunityContentTarget;
  /** « cette publication » ou « ce commentaire » */
  noun: string;
  /** Petit bouton discret (actions d'un commentaire) */
  compact?: boolean;
}

/** Bouton « Signaler » et son formulaire. À n'afficher que si permissions.canReport est vrai. */
export function ReportAction({ target, noun, compact }: ReportActionProps) {
  const [open, setOpen] = useState(false);
  const reported = useIsContentReported(target);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={compact ? "ghost" : "outline"}
        disabled={reported}
        className={cn(compact && "h-7 px-2 text-xs", !reported && "text-muted-foreground")}
        onClick={() => setOpen(true)}
      >
        <Flag className="mr-1.5 h-3.5 w-3.5" /> {reported ? "Signalé" : "Signaler"}
      </Button>
      {open && <ReportDialog target={target} noun={noun} onClose={() => setOpen(false)} />}
    </>
  );
}