import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBox({ value, onSearch, placeholder = "Rechercher…", className }: SearchBoxProps) {
  const [draft, setDraft] = useState(value);

  // Le champ suit le terme appliqué quand il change de l'extérieur (ex : réinitialisation des filtres)
  useEffect(() => setDraft(value), [value]);

  // Le bouton ne s'active que si le texte saisi diffère de la recherche déjà appliquée
  const pending = draft.trim() !== value.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(draft.trim());
  };

  const clear = () => {
    setDraft("");
    onSearch("");
  };

  return (
    <form onSubmit={submit} role="search" className={cn("flex w-full items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className={cn("pl-9", draft && "pr-9")}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label={placeholder}
        />
        {draft && (
          <button
            type="button"
            onClick={clear}
            aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" disabled={!pending}>
        Rechercher
      </Button>
    </form>
  );
}