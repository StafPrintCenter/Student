import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, MapPin, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { APIPublicTrainingDetail } from "@/data/trainings";

export function TrainingHero({
  training,
  isEnrolled,
}: {
  training: APIPublicTrainingDetail;
  isEnrolled: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div
        className="h-24"
        style={{
          background: `linear-gradient(135deg, ${training.coverColor}, color-mix(in oklab, ${training.coverColor} 40%, transparent))`,
        }}
      />
      <CardContent className="space-y-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">{training.theme}</Badge>
          <Badge variant="outline">{training.level}</Badge>
          <Badge variant="outline">{training.duration}</Badge>
          {isEnrolled && <Badge variant="success">Déjà inscrit</Badge>}
        </div>
        <h1 className="font-display text-3xl leading-tight md:text-4xl">{training.title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{training.short}</p>
        <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:grid-cols-4">
          <TrainingInfo icon={Clock} label="Durée" value={`${training.durationHours} h`} />
          <TrainingInfo icon={Users} label="Places" value={`${training.seatsRemaining}/${training.maxSeats}`} />
          <TrainingInfo icon={MapPin} label="Lieu" value={training.location} />
          <TrainingInfo
            icon={Calendar}
            label="Démarre"
            value={format(new Date(training.startDate), "d MMM yyyy", { locale: fr })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TrainingInfo({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
