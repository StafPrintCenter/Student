import { cn } from "@/lib/utils";
import { COMMUNITY_REACTION_TYPES, communityReactionMap, type CommunityReactionType } from "@/data/community";

interface ReactionPickerProps {
  /** Ma réaction actuelle (la re-sélectionner la retire) */
  value: string | null;
  /** "labeled" : emoji + libellé (publication) ; "icons" : emoji seuls (commentaires) */
  display: "labeled" | "icons";
  disabled?: boolean;
  onSelect: (type: CommunityReactionType) => void;
}

export function ReactionPicker({ value, display, disabled, onSelect }: ReactionPickerProps) {
  return (
    <div role="group" aria-label="Choisir une réaction" className="flex flex-wrap items-center gap-1">
      {COMMUNITY_REACTION_TYPES.map((type) => {
        const { emoji, label } = communityReactionMap[type];
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            title={active ? `${label} (cliquer pour retirer)` : label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onSelect(type)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-60 cursor-pointer",
              active ? "border-primary bg-primary/10 font-medium text-primary" : "border-border"
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            {display === "labeled" && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}