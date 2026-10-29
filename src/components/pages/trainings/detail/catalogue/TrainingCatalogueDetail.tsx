import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudienceCard } from "./AudienceCard";
import { CertificationCard } from "./CertificationCard";
import { EnrollmentCard } from "./EnrollmentCard";
import { ObjectivesCard } from "./ObjectivesCard";
import { ProgramCard } from "./ProgramCard";
import { TrainingHero } from "./TrainingHero";
import type { APIPublicTrainingDetail } from "@/data/trainings";

interface TrainingCatalogueDetailProps {
  training: APIPublicTrainingDetail;
  isEnrolled: boolean;
  isSubmitting: boolean;
  onSubscribe: () => void;
}

export function TrainingCatalogueDetail({
  training,
  isEnrolled,
  isSubmitting,
  onSubscribe,
}: TrainingCatalogueDetailProps) {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/trainings"><ArrowLeft className="mr-1 h-4 w-4" /> Retour</Link>
      </Button>

      <TrainingHero training={training} isEnrolled={isEnrolled} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ObjectivesCard objectives={training.objectives} />
          <AudienceCard audience={training.audience} prerequisites={training.prerequisites} />
          <ProgramCard program={training.program} />
        </div>

        <div className="space-y-6">
          <CertificationCard certification={training.certification} schedule={training.schedule} />
          <EnrollmentCard
            training={training}
            isEnrolled={isEnrolled}
            isSubmitting={isSubmitting}
            onSubscribe={onSubscribe}
          />
        </div>
      </div>
    </div>
  );
}
