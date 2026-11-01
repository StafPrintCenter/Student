import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMMUNITY_COMMENT_LIMITS } from "@/data/community";

const { bodyMin, bodyMax } = COMMUNITY_COMMENT_LIMITS;

interface CommentTextFormProps {
  initialValue?: string;
  placeholder?: string;
  submitLabel: string;
  isPending: boolean;
  autoFocus?: boolean;
  rows?: number;
  /** En-tête (ex : « En réponse à … ») */
  context?: ReactNode;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
}

/** Zone de texte réutilisée pour commenter, répondre et modifier */
export function CommentTextForm({
  initialValue = "",
  placeholder,
  submitLabel,
  isPending,
  autoFocus,
  rows = 3,
  context,
  onSubmit,
  onCancel,
}: CommentTextFormProps) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  // Désactivé tant que le texte est vide, ou identique à l'original (modification sans changement)
  const canSubmit = !isPending && trimmed.length >= bodyMin && trimmed !== initialValue.trim();

  const submit = () => {
    if (canSubmit) onSubmit(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-2"
    >
      {context}
      <Textarea
        rows={rows}
        value={value}
        maxLength={bodyMax}
        autoFocus={autoFocus}
        disabled={isPending}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">
          {value.length.toLocaleString("fr-FR")}/{bodyMax.toLocaleString("fr-FR")}
          <span className="hidden sm:inline"> · Ctrl/⌘ + Entrée pour envoyer</span>
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Envoi…
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" /> {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}