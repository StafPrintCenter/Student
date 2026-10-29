import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APICertificateDownloadResult,
  APICertificateVerifyResult,
  APIEnrollmentCertificateResponse,
} from "@/data/certificates";

const resourceKey = "certificates";

/* ---- Certificat d'une inscription ---- */

async function fetchEnrollmentCertificate(enrollmentId: string): Promise<APIEnrollmentCertificateResponse | null> {
  const response = await studentFetch(`/api/student/trainings/enrollments/${enrollmentId}/certificate`);
  if (response.status === 404) return null;
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la récupération du certificat.");
  return response.json();
}

export const fetchStudentEnrollmentCertificate = fetchEnrollmentCertificate;

/** Certificat d'une seule inscription (même clé de cache que useEnrollmentCertificates : pas de double appel) */
export function useEnrollmentCertificate(enrollmentId: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "enrollment", enrollmentId],
    queryFn: () => fetchEnrollmentCertificate(enrollmentId as string),
    enabled: !!enrollmentId,
    staleTime: 1000 * 30,
  });
  return { data: query.data ?? null, isLoading: query.isLoading, isError: query.isError };
}

/**
 * Aucun endpoint ne liste les certificats : on interroge celui de chaque inscription.
 * `certificates` est indexé par enrollmentId (null = 404, absent = pas encore chargé ou en erreur).
 */
export function useEnrollmentCertificates(enrollmentIds: string[]) {
  const results = useQueries({
    queries: enrollmentIds.map((id) => ({
      queryKey: [resourceKey, "enrollment", id],
      queryFn: () => fetchEnrollmentCertificate(id),
      staleTime: 1000 * 30,
    })),
  });

  const certificates: Record<string, APIEnrollmentCertificateResponse | null> = {};
  enrollmentIds.forEach((id, i) => {
    const data = results[i]?.data;
    if (data !== undefined) certificates[id] = data;
  });

  return { certificates, isLoading: results.some((r) => r.isLoading) };
}

/* ---- Téléchargement (enregistre le téléchargement côté backend) ---- */

async function downloadCertificate(certificateId: string): Promise<APICertificateDownloadResult> {
  const response = await studentFetch(`/api/student/trainings/certificates/${certificateId}/download`, {
    method: "POST",
  });
  if (!response.ok) throw await parseApiError(response, "Erreur lors du téléchargement du certificat.");
  return response.json();
}

export const downloadStudentCertificate = downloadCertificate;

export function useDownloadCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certificateId: string) => downloadCertificate(certificateId),
    // le statut passe à "downloaded"
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Vérification publique d'un certificat ---- */

async function verifyCertificate(number: string): Promise<APICertificateVerifyResult> {
  const response = await studentFetch(`/api/public/trainings/certificates/verify/${encodeURIComponent(number)}`);
  if (response.status === 404) return { valid: false };
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la vérification du certificat.");
  return response.json();
}

export const verifyStudentCertificate = verifyCertificate;

export function useVerifyCertificate() {
  return useMutation({
    mutationFn: (number: string) => verifyCertificate(number),
  });
}