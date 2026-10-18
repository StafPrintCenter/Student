import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import { trainingEnrollmentStatusMap, type APIStudentTrainingEnrollmentInfo } from "@/data/trainings";

export function EnrollmentStatusCard({ enrollment }: { enrollment: APIStudentTrainingEnrollmentInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Votre Inscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Inscrit le</span>
          <span className="font-medium">{format(new Date(enrollment.enrolledAt), "d MMM yyyy à HH:mm", { locale: fr })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Statut d'inscription</span>
          <StatusBadge status={enrollment.status} map={trainingEnrollmentStatusMap} />
        </div>

        <div className="border-t pt-2">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Progression du cours</span>
            <span className="tabular-nums font-semibold">{enrollment.progress}%</span>
          </div>
          <Progress value={enrollment.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}