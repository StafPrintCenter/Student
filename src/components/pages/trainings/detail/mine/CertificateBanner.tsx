import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Award, Hourglass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrollmentCertificate } from "@/stores/useCertificatesStore";

export function CertificateAvailableBanner({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading } = useEnrollmentCertificate(enrollmentId);

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data) return null;

  const { certificateStatus, certificate } = data;

  if (certificate && (certificateStatus === "issued" || certificateStatus === "downloaded")) {
    return (
      <Card className="border-success/40 bg-success/5">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 text-sm">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Félicitations, votre certificat est disponible</p>
              <p className="text-xs text-muted-foreground">
                N° <span className="font-mono">{certificate.number}</span> · délivré le{" "}
                {format(new Date(certificate.issuedAt), "d MMMM yyyy à HH:MM", { locale: fr })}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/certificates" search={{ certificateId: certificate.id }}>
              Voir mon certificat <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (certificateStatus === "eligible") {
    return (
      <Card className="border-info/40 bg-info/5">
        <CardContent className="flex items-start gap-4 p-4 text-sm">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-info/15 text-info">
            <Hourglass className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Vous êtes éligible au certificat</p>
            <p className="text-xs text-muted-foreground">
              Il sera disponible dans votre espace certificats dès qu'il aura été délivré.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // not_eligible / revoked : rien à annoncer ici
  return null;
}