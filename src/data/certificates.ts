/** Aligné sur App\Enums\CertificateEligibilityStatus (backend) */
export type CertificateEligibilityStatus = "not_eligible" | "eligible" | "issued" | "downloaded" | "revoked";

/** Aligné sur App\Enums\CertificateStatus (backend), utilisé par la vérification publique */
export type CertificateValidityStatus = "active" | "revoked";

interface StatusBadgeConfig {
  label: string;
  className: string;
}

export const certificateEligibilityStatusMap: Record<CertificateEligibilityStatus, StatusBadgeConfig> = {
  not_eligible: { label: "Non éligible", className: "bg-muted text-muted-foreground border-border" },
  eligible: { label: "Éligible", className: "bg-info/15 text-info border-info/40" },
  issued: { label: "Délivré", className: "bg-success/15 text-success border-success/40" },
  downloaded: { label: "Téléchargé", className: "bg-success/15 text-success border-success/40" },
  revoked: { label: "Révoqué", className: "bg-destructive/10 text-destructive border-destructive/40" },
};

export const certificateValidityStatusMap: Record<CertificateValidityStatus, StatusBadgeConfig> = {
  active: { label: "Actif", className: "bg-success/15 text-success border-success/40" },
  revoked: { label: "Révoqué", className: "bg-destructive/10 text-destructive border-destructive/40" },
};

export type APICertificate = {
  id: string;
  number: string;
  issuedAt: string;
  downloadUrl: string;
};

/** Réponse de GET /api/student/enrollments/{enrollmentId}/certificate */
export type APIEnrollmentCertificateResponse = {
  certificateStatus: CertificateEligibilityStatus;
  /** Présent uniquement une fois le certificat délivré */
  certificate: APICertificate | null;
};

/** Réponse de POST /api/student/trainings/certificates/{certificateId}/download */
export type APICertificateDownloadResult = {
  downloadUrl: string;
};

/** Réponse de GET /api/public/trainings/certificates/verify/{number} (champs absents si invalide) */
export type APICertificateVerifyResult = {
  valid: boolean;
  studentName?: string;
  trainingTitle?: string;
  instructorName?: string;
  issuedAt?: string;
  status?: CertificateValidityStatus;
};