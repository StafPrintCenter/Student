import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogCard } from "@/components/pages/trainings/home/CatalogCard";
import { useStudentTrainingsList, useTrainingsCatalog, useSubscribeToTraining } from "@/stores/useTrainingsStore";
import type { APIPublicTrainingCatalogItem } from "@/data/trainings";

export function Catalog() {
  const [search, setSearch] = useState("");
  const { items, isLoading } = useTrainingsCatalog({ perPage: 12, search: search || undefined });
  const { items: myEnrollments } = useStudentTrainingsList();
  const enrolledIds = useMemo(() => new Set(myEnrollments.map((e) => e.trainingId)), [myEnrollments]);

  const subscribeMutation = useSubscribeToTraining();

  const handleSubscribe = (t: APIPublicTrainingCatalogItem) => {
    subscribeMutation.mutate(t.id, {
      onSuccess: () => toast.success("Inscription enregistrée."),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'inscription"),
    });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher une formation…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <CatalogCard
              key={t.id}
              training={t}
              already={enrolledIds.has(t.id)}
              busy={subscribeMutation.isPending}
              submitting={subscribeMutation.isPending && subscribeMutation.variables === t.id}
              onSubscribe={() => handleSubscribe(t)}
            />
          ))}
        </div>
      )}
    </div>
  );
}