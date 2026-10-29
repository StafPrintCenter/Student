import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AudienceCard({
  audience,
  prerequisites,
}: {
  audience: string;
  prerequisites: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" /> Public visé & prérequis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{audience}</p>
        {prerequisites.length > 0 && (
          <ul className="list-inside list-disc space-y-1">
            {prerequisites.map((prerequisite, index) => <li key={index}>{prerequisite}</li>)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
