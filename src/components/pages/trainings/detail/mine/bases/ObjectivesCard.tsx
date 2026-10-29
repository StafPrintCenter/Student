import { CheckCircle2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainingMineObjectivesCard({ objectives }: { objectives: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" /> Objectifs pédagogiques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {objectives.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}