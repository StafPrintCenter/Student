import { useState } from "react";

import { PaginationBar } from "@/components/pages/community/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterChip } from "@/components/pages/community/reactions/filter-chip";
import { ReactionsList } from "@/components/pages/community/reactions/reactions-list";
import { cn } from "@/lib/utils";
import {
  COMMUNITY_REACTION_TYPES,
  communityAuthorRoleMap,
  communityReactionMap,
  type CommunityAuthorRole,
  type CommunityReactionTarget,
  type CommunityReactionType,
} from "@/data/community";
import { useCommunityReactionsList } from "@/stores/useCommunityReactionsStore";

const PER_PAGE = 12;
const ROLES = Object.keys(communityAuthorRoleMap) as CommunityAuthorRole[];

interface ReactionsDialogProps {
  target: CommunityReactionTarget;
  onClose: () => void;
}

export function ReactionsDialog({ target, onClose }: ReactionsDialogProps) {
  const [type, setType] = useState<CommunityReactionType | "">("");
  const [role, setRole] = useState<CommunityAuthorRole | "">("");
  const [page, setPage] = useState(1);

  const { summary, total, items, meta, isLoading, isFetching, isError, refetch } = useCommunityReactionsList(target, {
    page,
    perPage: PER_PAGE,
    type: type || undefined,
    role: role || undefined,
  });

  // Un filtre qui change ramène à la première page
  const pickType = (next: CommunityReactionType | "") => {
    setType(next);
    setPage(1);
  };
  const pickRole = (next: CommunityAuthorRole | "") => {
    setRole(next);
    setPage(1);
  };

  const presentTypes = COMMUNITY_REACTION_TYPES.filter((t) => (summary[t] ?? 0) > 0);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réactions</DialogTitle>
          <DialogDescription>
            {total} réaction{total > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={type === ""} onClick={() => pickType("")}>
              Toutes ({total})
            </FilterChip>
            {presentTypes.map((t) => (
              <FilterChip key={t} active={type === t} onClick={() => pickType(t)}>
                <span className="text-sm leading-none">{communityReactionMap[t].emoji}</span> {summary[t]}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={role === ""} onClick={() => pickRole("")}>
              Tous les rôles
            </FilterChip>
            {ROLES.map((r) => (
              <FilterChip key={r} active={role === r} onClick={() => pickRole(r)}>
                {communityAuthorRoleMap[r].label}
              </FilterChip>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="space-y-3 text-sm">
            <p className="text-destructive">Impossible de charger les réactions.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucune réaction pour ce filtre.</p>
        ) : (
          <div className={cn("transition-opacity", isFetching && "opacity-60")}>
            <ReactionsList items={items} />
          </div>
        )}

        <PaginationBar page={page} lastPage={meta?.lastPage ?? 1} onChange={setPage} disabled={isFetching} />
      </DialogContent>
    </Dialog>
  );
}