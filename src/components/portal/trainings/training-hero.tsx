import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, MapPin, Users, CircleEuro } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { AccessBadge } from "@/components/portal/trainings/AccessBadge";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import {
  trainingEnrollmentStatusMap,
  type APIStudentTrainingDetail,
  type APIStudentTrainingEnrollmentInfo,
} from "@/data/trainings";

interface TrainingHeroProps {
  training: APIStudentTrainingDetail;
  enrollment: APIStudentTrainingEnrollmentInfo;
  contentLocked: boolean;
}

export function TrainingHero({ training, enrollment, contentLocked }: TrainingHeroProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div
        className="relative h-28"
        style={{
          background: `linear-gradient(135deg, ${training.coverColor}, color-mix(in oklab, ${training.coverColor} 30%, transparent))`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>
      <div className="space-y-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">{training.theme}</Badge>
          <Badge variant="outline">{training.level}</Badge>
          <Badge variant="outline">{training.duration}</Badge>
          <StatusBadge status={enrollment.status} map={trainingEnrollmentStatusMap} />
          <Badge variant="outline"><CircleEuro className="h-3 w-3 mr-2" /> {formatFCFA(training.price)}</Badge>
          <AccessBadge unlocked={!contentLocked} />
        </div>

        <h1 className="font-display text-3xl leading-tight md:text-4xl">{training.title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{training.short}</p>

        <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:grid-cols-4">
          <Info icon={Clock} label="Durée" value={`${training.durationHours} h (${training.duration})`} />
          <Info icon={Users} label="Places restantes" value={`${training.seatsRemaining} / ${training.maxSeats}`} />
          <Info icon={MapPin} label="Lieu" value={training.location} />
          <Info
            icon={Calendar}
            label="Période"
            value={`${format(new Date(training.startDate), "d MMM", { locale: fr })} - ${format(new Date(training.endDate), "d MMM yyyy", { locale: fr })}`}
          />
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}