import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { sessionModalityLabels, type SessionModality } from "@/data/sessions";

export interface SessionsFilters {
  query: string;
  modality: SessionModality | "";
  trainingId: string;
  upcomingOnly: boolean;
}

interface SessionsFiltersBarProps {
  filters: SessionsFilters;
  onChange: (next: SessionsFilters) => void;
  trainings: { id: string; title: string }[];
}

const selectClass = "rounded-md border border-input bg-background px-3 py-2 text-sm";

export function SessionsFiltersBar({ filters, onChange, trainings }: SessionsFiltersBarProps) {
  const set = <K extends keyof SessionsFilters>(key: K, value: SessionsFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher une session…"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
        />
      </div>

      <select
        className={selectClass}
        value={filters.trainingId}
        onChange={(e) => set("trainingId", e.target.value)}
        aria-label="Filtrer par formation"
      >
        <option value="">Toutes les formations</option>
        {trainings.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.modality}
        onChange={(e) => set("modality", e.target.value as SessionModality | "")}
        aria-label="Filtrer par modalité"
      >
        <option value="">Toutes les modalités</option>
        {(Object.keys(sessionModalityLabels) as SessionModality[]).map((m) => (
          <option key={m} value={m}>
            {sessionModalityLabels[m]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <Switch
          id="sessions-upcoming-only"
          checked={filters.upcomingOnly}
          onCheckedChange={(v) => set("upcomingOnly", v)}
        />
        <Label htmlFor="sessions-upcoming-only" className="cursor-pointer text-sm">
          À venir uniquement
        </Label>
      </div>
    </div>
  );
}