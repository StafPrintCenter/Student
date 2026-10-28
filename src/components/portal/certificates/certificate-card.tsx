import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Award, Calendar, Eye, Hash, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { certificateEligibilityStatusMap, type APIEnrollmentCertificateResponse } from "@/data/certificates";
import type { APIStudentTrainingEnrollment } from "@/data/trainings";

interface CertificateCardProps {
  enrollment: APIStudentTrainingEnrollment;
  data: APIEnrollmentCertificateResponse;
  onView: () => void;
  onVerify: () => void;
}

export function CertificateCard({ enrollment, data, onView, onVerify }: CertificateCardProps) {
  const { certificateStatus, certificate } = data;
  const config = certificateEligibilityStatusMap[certificateStatus];
  const canView = !!certificate && (certificateStatus === "issued" || certificateStatus === "downloaded");

  return (
    <Card
      className="overflow-hidden border-t-4"
      style={{ borderTopColor: enrollment.coverColor ?? "var(--border)" }}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {enrollment.theme} · {enrollment.level}
              </p>
              <Link
                to="/trainings/$id/mine"
                params={{ id: enrollment.trainingId }}
                className="block truncate font-medium hover:text-primary hover:underline"
              >
                {enrollment.trainingTitle}
              </Link>
            </div>
          </div>
          <Badge variant="outline" className={cn("shrink-0 font-medium", config.className)}>
            {config.label}
          </Badge>
        </div>

        {certificate ? (
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> Numéro
              </dt>
              <dd className="font-mono font-medium">{certificate.number}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Délivré le
              </dt>
              <dd className="font-medium">
                {format(new Date(certificate.issuedAt), "d MMMM yyyy", { locale: fr })}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            Vous êtes éligible : votre certificat sera disponible dès qu'il aura été délivré.
          </p>
        )}

        {certificate && (
          <div className="flex items-center gap-2 border-t border-border pt-3">
            {canView && (
              <Button size="sm" className="flex-1" onClick={onView}>
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Voir le certificat
              </Button>
            )}
            <Button size="sm" variant="outline" className={cn(!canView && "flex-1")} onClick={onVerify}>
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Vérifier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
