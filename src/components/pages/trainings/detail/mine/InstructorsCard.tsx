import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorList } from "@/components/portal/trainings/instructor-list";
import type { APITrainingInstructor } from "@/data/trainings";

export function InstructorsCard({ instructors }: { instructors: APITrainingInstructor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="h-4 w-4 text-primary" /> {instructors.length > 1 ? "Formateurs" : "Formateur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {instructors.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">Aucun formateur assigné pour le moment.</p>
        ) : (
          <InstructorList instructors={instructors} />
        )}
      </CardContent>
    </Card>
  );
}