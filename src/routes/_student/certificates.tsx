import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FilePreviewModal } from "@/components/site";
import { EmptyState } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { CertificateCard, VerifyCertificateDialog } from "@/components/pages/certificates";
import { resolveStorageUrl } from "@/lib/api/file";
import { useStudentTrainingsList } from "@/stores/useTrainingsStore";
import { useDownloadCertificate, useEnrollmentCertificates } from "@/stores/useCertificatesStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/certificates")({
  validateSearch: z.object({ certificateId: z.string().optional() }),
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Mes certificats de formation | ${SITE.name}` },
      {
        name: "description",
        content: `Consultez, téléchargez et faites vérifier les certificats obtenus à l'issue de vos formations chez ${SITE.name}.`,
      },
    ],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { certificateId } = Route.useSearch();
  const { items: enrollments, isLoading: enrollmentsLoading } = useStudentTrainingsList();
  const enrollmentIds = useMemo(() => enrollments.map((e) => e.enrollmentId), [enrollments]);
  const { certificates, isLoading: certificatesLoading } = useEnrollmentCertificates(enrollmentIds);

  const [verifyNumber, setVerifyNumber] = useState<string | null>(null);
  const downloadMutation = useDownloadCertificate();

  if (enrollmentsLoading || certificatesLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Formations"
          title="Mes certificats"
          description="Vos certificats de formation."
        />
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
  const previewEntry = entries.find(
    ({ data }) =>
      data.certificate?.id === certificateId &&
      (data.certificateStatus === "issued" || data.certificateStatus === "downloaded"),
  );
  const preview = previewEntry?.data.certificate;

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
                onView={() => {
                  const certificate = data.certificate;
                  if (certificate) {
                    void navigate({
                      search: (prev) => ({ ...prev, certificateId: certificate.id }),
                    });
                  }
                }}
                onVerify={() => data.certificate && setVerifyNumber(data.certificate.number)}
              />
            ))}
          </div>
          {notEligibleCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {notEligibleCount} formation{notEligibleCount > 1 ? "s" : ""} pas encore éligible
              {notEligibleCount > 1 ? "s" : ""} au certificat.
            </p>
          )}
        </>
      )}

      <FilePreviewModal
        url={resolveStorageUrl(preview?.downloadUrl)}
        title={preview ? `Certificat ${preview.number}` : ""}
        onClose={() =>
          void navigate({
            search: (prev) => ({ ...prev, certificateId: undefined }),
            replace: true,
          })
        }
        onDownload={() => {
          if (!preview) return;
          downloadMutation.mutate(preview.id, {
            onError: (err) =>
              toast.error(err instanceof Error ? err.message : "Erreur lors du téléchargement"),
          });
        }}
      />

      {verifyNumber && (
        <VerifyCertificateDialog number={verifyNumber} onClose={() => setVerifyNumber(null)} />
      )}
    </div>
  );
}
