import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  max: number;
  disabled?: boolean;
}

// Les virgules séparent les tags côté backend : on les retire, ainsi que le # de tête
const clean = (raw: string) => raw.replace(/[,#]/g, "").trim();

export function TagsInput({ id, value, onChange, max, disabled }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const full = value.length >= max;

  const commit = (raw: string) => {
    const tag = clean(raw);
    setDraft("");
    if (!tag || full) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={draft}
        disabled={disabled || full}
        placeholder={full ? `${max} tags maximum` : "Ajouter un tag puis Entrée"}
        onChange={(e) => {
          const next = e.target.value;
          if (next.includes(",")) commit(next.split(",")[0]);
          else setDraft(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
      />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
              #{tag}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Retirer ${tag}`}
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="text-muted-foreground hover:text-destructive disabled:pointer-events-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{max} tags
      </p>
    </div>
  );
}