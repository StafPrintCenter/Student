import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/portal/community/native-select";
import {
  hasActiveFilters,
  TRAINING_PLACE_PREFIX,
  type CommunityFilters,
} from "@/components/portal/community/filters-model";
import { communityPostTypeMap, communitySortLabels, type CommunityPostType, type CommunitySort } from "@/data/community";

interface CommunityFiltersBarProps {
  filters: CommunityFilters;
  onChange: (next: CommunityFilters) => void;
  onReset: () => void;
  trainings: { id: string; title: string }[];
}

export function CommunityFiltersBar({ filters, onChange, onReset, trainings }: CommunityFiltersBarProps) {
  const set = <K extends keyof CommunityFilters>(key: K, value: CommunityFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher une publication…"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
          />
        </div>

        <NativeSelect
          className="sm:w-auto"
          value={filters.place}
          onChange={(e) => set("place", e.target.value)}
          aria-label="Filtrer par espace"
        >
          <option value="">Tous les espaces</option>
          <option value="general">Communauté générale</option>
          <option value="training">Toutes mes formations</option>
          {trainings.length > 0 && (
            <optgroup label="Une formation">
              {trainings.map((t) => (
                <option key={t.id} value={`${TRAINING_PLACE_PREFIX}${t.id}`}>
                  {t.title}
                </option>
              ))}
            </optgroup>
          )}
        </NativeSelect>

        <NativeSelect
          className="sm:w-auto"
          value={filters.type}
          onChange={(e) => set("type", e.target.value as CommunityPostType | "")}
          aria-label="Filtrer par type"
        >
          <option value="">Tous les types</option>
          {(Object.keys(communityPostTypeMap) as CommunityPostType[]).map((type) => (
            <option key={type} value={type}>
              {communityPostTypeMap[type].label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          className="sm:w-auto"
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as CommunitySort)}
          aria-label="Trier"
        >
          {(Object.keys(communitySortLabels) as CommunitySort[]).map((sort) => (
            <option key={sort} value={sort}>
              {communitySortLabels[sort]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Switch id="community-mine" checked={filters.mine} onCheckedChange={(v) => set("mine", v)} />
          <Label htmlFor="community-mine" className="cursor-pointer text-sm">
            Mes publications
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="community-unanswered" checked={filters.unanswered} onCheckedChange={(v) => set("unanswered", v)} />
          <Label htmlFor="community-unanswered" className="cursor-pointer text-sm">
            Questions sans réponse
          </Label>
        </div>
        {hasActiveFilters(filters) && (
          <Button size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}