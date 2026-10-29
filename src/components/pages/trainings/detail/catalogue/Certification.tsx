import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CertificationCard({
  certification,
  schedule,
}: {
  certification: string;
  schedule: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" /> Certification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>{certification}</p>
        <p className="pt-1 text-xs">{schedule}</p>
      </CardContent>
    </Card>
  );
}
