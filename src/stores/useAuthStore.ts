import { useQuery } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import { parseApiError } from "@/lib/api-error";
import type { APIStudentUser, APIStudentLoginResponse, StudentInviteVerifyResponse } from "@/data/auth";

export class StudentAuthApiError extends Error { }

export async function loginStudent(email: string, password: string): Promise<APIStudentLoginResponse> {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const response = await studentFetch(`/api/student/auth/login`, { method: "POST", body: formData });
  if (!response.ok) {
    const error = await parseApiError(response, "Email ou mot de passe incorrect.");
    throw new StudentAuthApiError(error.message);
  }

  return response.json();
}

/**
 * Revalide la session via le cookie httpOnly envoyé automatiquement.
 * Retourne null si aucune session valide n'est active (401).
 */
export async function fetchStudentMe(): Promise<APIStudentUser | null> {
  const response = await studentFetch(`/api/student/auth/me`);
  if (response.status === 401) return null;
  if (!response.ok) {
    const error = await parseApiError(response, "Erreur lors de la vérification de la session.");
    throw new StudentAuthApiError(error.message);
  }
  const body = await response.json();
  return body?.data ?? body?.student ?? body;
}

export async function logoutStudent(): Promise<void> {
  const response = await studentFetch(`/api/student/auth/logout`, { method: "POST" });
  if (!response.ok) {
    throw await parseApiError(response, "Erreur lors de la déconnexion.");
  }
}

function buildInviteQuery(params: { student: string; expires: string; signature: string }) {
  return new URLSearchParams({
    student: params.student,
    expires: params.expires,
    signature: params.signature,
  }).toString();
}

export async function verifyStudentInvite(params: {
  student: string;
  expires: string;
  signature: string;
}): Promise<StudentInviteVerifyResponse> {
  const response = await studentFetch(
    `/api/student/auth/invite-accept?${buildInviteQuery(params)}`
  );
  if (!response.ok) {
    const error = await parseApiError(response, "Ce lien d'invitation est invalide ou a expiré.");
    throw new StudentAuthApiError(error.message);
  }
  const body = await response.json();
  return body.data as StudentInviteVerifyResponse;
}

export async function acceptStudentInvite(params: {
  student: string;
  expires: string;
  signature: string;
  password: string;
}): Promise<{ message: string }> {
  const fd = new FormData();
  fd.append("password", params.password);

  const response = await studentFetch(
    `/api/student/auth/invite-accept?${buildInviteQuery(params)}`,
    {
      method: "POST",
      body: fd,
    }
  );
  if (!response.ok) {
    const error = await parseApiError(response, "Ce lien d'invitation est invalide ou a expiré.");
    throw new StudentAuthApiError(error.message);
  }
  const body = await response.json();
  return body as { message: string };
}

/**
 * Hook pour récupérer l'étudiant actuellement connecté
 */
export function useCurrentStudent() {
  const { data: student, isLoading, error } = useQuery({
    queryKey: ["current-student"],
    queryFn: fetchStudentMe,
    staleTime: 1000 * 60 * 5, // Met en cache les données pendant 5 minutes
    retry: false, // Ne pas réessayer indéfiniment en cas de 401
  });

  return {
    student: student ?? null,
    isLoading,
    isAuthenticated: !!student,
    error,
  };
}
