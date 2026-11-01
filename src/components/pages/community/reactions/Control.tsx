import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReactionPicker, ReactionSummary, ReactionsDialog } from "./";
import { cn } from "@/lib/utils";
import { getReactionConfig, type CommunityReactionTarget, type CommunityReactionType } from "@/data/community";
import { useRemoveCommunityReaction, useSetCommunityReaction } from "@/stores/useCommunityReactionsStore";

interface ReactionControlProps {
  target: CommunityReactionTarget;
  myReaction: string | null;
  reactions: Record<string, number>;
  reactionsTotal: number;
  canReact: boolean;
  /** "bar" : sélecteur toujours visible (publication) ; "compact" : un bouton qui déplie le sélecteur (commentaire) */
  variant: "bar" | "compact";
  className?: string;
}

export function ReactionControl({
  target,
  myReaction,
  reactions,
  reactionsTotal,
  canReact,
  variant,
  className,
}: ReactionControlProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const setMutation = useSetCommunityReaction();
  const removeMutation = useRemoveCommunityReaction();
  const busy = setMutation.isPending || removeMutation.isPending;

  // Rien à afficher : on ne peut pas réagir et personne n'a réagi
  if (!canReact && reactionsTotal <= 0) return null;

  const mine = myReaction ? getReactionConfig(myReaction) : null;

  const handleSelect = (type: CommunityReactionType) => {
    setPickerOpen(false);
    const onError = (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement de votre réaction");

    // Re-sélectionner sa réaction la retire
    if (type === myReaction) removeMutation.mutate({ target }, { onError });
    else setMutation.mutate({ target, type }, { onError });
  };

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
        {canReact && variant === "bar" && (
          <ReactionPicker value={myReaction} display="labeled" disabled={busy} onSelect={handleSelect} />
        )}

        {canReact && variant === "compact" && (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              aria-expanded={pickerOpen}
              className={cn("h-7 px-2 text-xs", mine && "text-primary")}
              onClick={() => setPickerOpen((open) => !open)}
            >
              {mine ? (
                <span className="mr-1.5 text-base leading-none">{mine.emoji}</span>
              ) : (
                <SmilePlus className="mr-1.5 h-3.5 w-3.5" />
              )}
              {mine ? mine.label : "Réagir"}
            </Button>
            {pickerOpen && <ReactionPicker value={myReaction} display="icons" disabled={busy} onSelect={handleSelect} />}
          </>
        )}

        <ReactionSummary reactions={reactions} total={reactionsTotal} onClick={() => setListOpen(true)} />
      </div>

      {listOpen && <ReactionsDialog target={target} onClose={() => setListOpen(false)} />}
    </>
  );
}