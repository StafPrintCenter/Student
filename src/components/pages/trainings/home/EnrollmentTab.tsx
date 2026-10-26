import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { EnrollmentCard } from "./EnrollmentCard";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";

export function EnrollmentTab() {
  const { items, isLoading } = useStudentTrainingsList();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Vous n'êtes inscrit à aucune formation"
        description="Consultez le catalogue pour choisir une formation."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((e) => (
        <EnrollmentCard key={e.enrollmentId} enrollment={e} />
      ))}
    </div>
  );
}