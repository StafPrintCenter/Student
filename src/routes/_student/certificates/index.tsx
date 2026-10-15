import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Award } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/portal/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CertificateCard } from "@/components/portal/certificates/certificate-card";
import { VerifyCertificateDialog } from "@/components/portal/certificates/verify-certificate-dialog";
import { FilePreviewModal } from "@/components/site/FilePreviewModal";
import { resolveStorageUrl } from "@/lib/file-url";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";
import { useDownloadCertificate, useEnrollmentCertificates } from "@/stores/useCertificatesStore";

export const Route = createFileRoute("/_student/certificates/")({
  head: () => ({
    meta: [
      { title: "Mes certificats - STAF Student Portal" },
      { name: "description", content: "Vos certificats de formation, consultation, téléchargement et vérification." },
    ],
  }),
  component: CertificatesPage,
});

type Preview = { url: string | null; title: string; certificateId: string };

function CertificatesPage() {
  const { items: enrollments, isLoading: enrollmentsLoading } = useStudentTrainingsList();
  const enrollmentIds = useMemo(() => enrollments.map((e) => e.enrollmentId), [enrollments]);
  const { certificates, isLoading: certificatesLoading } = useEnrollmentCertificates(enrollmentIds);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [verifyNumber, setVerifyNumber] = useState<string | null>(null);
  const downloadMutation = useDownloadCertificate();

  if (enrollmentsLoading || certificatesLoading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Formations" title="Mes certificats" description="Vos certificats de formation." />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      </div>
    );
  }

  // Les formations non éligibles n'ont pas de certificat à afficher
  const entries = enrollments.flatMap((enrollment) => {
    const data = certificates[enrollment.enrollmentId];
    return data && data.certificateStatus !== "not_eligible" ? [{ enrollment, data }] : [];
  });
  const notEligibleCount = enrollments.length - entries.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formations"
        title="Mes certificats"
        description="Consultez, téléchargez et faites vérifier les certificats de vos formations."
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Aucun certificat pour le moment"
          description="Vos certificats apparaîtront ici dès que vous serez éligible à l'issue d'une formation."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {entries.map(({ enrollment, data }) => (
              <CertificateCard
                key={enrollment.enrollmentId}
                enrollment={enrollment}
                data={data}
                onView={() =>
                  data.certificate &&
                  setPreview({
                    url: resolveStorageUrl(data.certificate.downloadUrl),
                    title: `Certificat ${data.certificate.number}`,
                    certificateId: data.certificate.id,
                  })
                }
                onVerify={() => data.certificate && setVerifyNumber(data.certificate.number)}
              />
            ))}
          </div>
          {notEligibleCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {notEligibleCount} formation{notEligibleCount > 1 ? "s" : ""} pas encore éligible{notEligibleCount > 1 ? "s" : ""} au certificat.
            </p>
          )}
        </>
      )}

      <FilePreviewModal
        url={preview?.url ?? null}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
        onDownload={() => {
          if (!preview) return;
          downloadMutation.mutate(preview.certificateId, {
            onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors du téléchargement"),
          });
        }}
      />

      {verifyNumber && <VerifyCertificateDialog number={verifyNumber} onClose={() => setVerifyNumber(null)} />}
    </div>
  );
}