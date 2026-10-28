import { useState } from "react";
import { CalendarX, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionListCard } from "@/components/pages/temp/ListCard";
import { SessionsFiltersBar, type SessionsFilters } from "@/components/portal/sessions/sessions-filters";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSessionsList } from "@/stores/useSessionsStore";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";

const PER_PAGE = 12;
const DEFAULT_FILTERS: SessionsFilters = { query: "", modality: "", trainingId: "", upcomingOnly: true };

export function SessionsList() {
  const [filters, setFilters] = useState<SessionsFilters>(DEFAULT_FILTERS);
  const debouncedQuery = useDebouncedValue(filters.query.trim());
  const { items: enrollments } = useStudentTrainingsList();

  // La page repart de 1 dès qu'un filtre change, sans effet ni requête superflue
  const signature = [debouncedQuery, filters.modality, filters.trainingId, filters.upcomingOnly].join("|");
  const [pageState, setPageState] = useState({ signature, page: 1 });
  const page = pageState.signature === signature ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ signature, page: next });

  const { items, meta, isLoading, isFetching, isError, refetch } = useSessionsList({
    page,
    perPage: PER_PAGE,
    query: debouncedQuery || undefined,
    modality: filters.modality || undefined,
    trainingId: filters.trainingId || undefined,
    upcoming: filters.upcomingOnly || undefined,
  });

  const trainings = enrollments.map((e) => ({ id: e.trainingId, title: e.trainingTitle }));

  return (
    <div className="space-y-4">
      <SessionsFiltersBar filters={filters} onChange={setFilters} trainings={trainings} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="space-y-4">
          <EmptyState
            icon={CalendarX}
            title="Impossible de charger vos sessions"
            description="Vérifiez votre connexion, puis réessayez."
          />
          <div className="flex justify-center">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Aucune session trouvée"
          description="Modifiez vos filtres, ou revenez plus tard : vos formateurs planifient de nouvelles sessions."
        />
      ) : (
        <>
          {meta && (
            <p className="text-xs text-muted-foreground">
              {meta.total} session{meta.total > 1 ? "s" : ""}
            </p>
          )}
          <div className={cn("space-y-3 transition-opacity", isFetching && "opacity-60")}>
            {items.map((session) => (
              <SessionListCard key={session.id} session={session} />
            ))}
          </div>
        </>
      )}

      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {meta.currentPage} / {meta.lastPage}
          </span>
          <Button size="sm" variant="outline" disabled={page >= meta.lastPage} onClick={() => setPage(page + 1)}>
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}