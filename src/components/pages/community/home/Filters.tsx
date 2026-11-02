import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/pages/community/shared";
import { hasActiveFilters, TRAINING_PLACE_PREFIX, type CommunityFilters } from "./FiltersModel";
import { SearchBox } from "./SearchBox";
import { communityAuthorRoleMap, communityContentStatusLabels, communityPostTypeMap, communitySortLabels, type CommunityAuthorRole, type CommunityContentStatus, type CommunityPostType, type CommunitySort } from "@/data/community";

interface FilterToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function FilterToggle({ id, label, checked, onChange }: FilterToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm">
        {label}
      </Label>
    </div>
  );
}

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
        <SearchBox
          className="sm:max-w-sm"
          value={filters.query}
          onSearch={(query) => set("query", query)}
          placeholder="Rechercher une publication…"
        />

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
          value={filters.authorRole}
          onChange={(e) => set("authorRole", e.target.value as CommunityAuthorRole | "")}
          aria-label="Filtrer par rôle de l'auteur"
        >
          <option value="">Tous les auteurs</option>
          {(Object.keys(communityAuthorRoleMap) as CommunityAuthorRole[]).map((role) => (
            <option key={role} value={role}>
              {communityAuthorRoleMap[role].label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          className="sm:w-auto"
          value={filters.status}
          onChange={(e) => set("status", e.target.value as CommunityContentStatus | "")}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          {(Object.keys(communityContentStatusLabels) as CommunityContentStatus[]).map((status) => (
            <option key={status} value={status}>
              {communityContentStatusLabels[status]}
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
        <FilterToggle id="community-mine" label="Mes publications" checked={filters.mine} onChange={(v) => set("mine", v)} />
        <FilterToggle id="community-pinned" label="Épinglées" checked={filters.pinned} onChange={(v) => set("pinned", v)} />
        <FilterToggle
          id="community-unanswered"
          label="Questions sans réponse"
          checked={filters.unanswered}
          onChange={(v) => set("unanswered", v)}
        />
        {hasActiveFilters(filters) && (
          <Button size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}