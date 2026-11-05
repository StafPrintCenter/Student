import { useQuery } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIStudentUser,
  StudentInviteVerifyResponse,
  APIStudentLoginResult,
  APIStudentMfaEmailResend,
  StudentMfaVerifyPayload,
} from "@/data/auth";

export class StudentAuthApiError extends Error { }

export async function loginStudent(email: string, password: string): Promise<APIStudentLoginResult> {
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
  const response = await studentFetch(`/api/student/account/me`);
  if (response.status === 401) return null;
  if (!response.ok) {
    const error = await parseApiError(response, "Erreur lors de la vérification de la session.");
    throw new StudentAuthApiError(error.message);
  }
  const body = await response.json();
  return body?.data ?? body?.student ?? body;
}

export async function logoutStudent(): Promise<void> {
  const response = await studentFetch(`/api/student/account/logout`, { method: "POST" });
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

export async function forgotStudentPassword(email: string): Promise<{ message: string }> {
  const fd = new FormData();
  fd.append("email", email);

  const response = await studentFetch(`/api/student/auth/forgot-password`, { method: "POST", body: fd });
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible d'envoyer l'e-mail de réinitialisation.");
    throw new StudentAuthApiError(error.message);
  }
  return (await response.json()) as { message: string };
}

export async function resetStudentPassword(params: {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<{ message: string }> {
  const fd = new FormData();
  fd.append("email", params.email);
  fd.append("token", params.token);
  fd.append("password", params.password);
  fd.append("password_confirmation", params.passwordConfirmation);

  const response = await studentFetch(`/api/student/auth/reset-password`, { method: "POST", body: fd });
  if (!response.ok) {
    const error = await parseApiError(response, "Ce lien de réinitialisation est invalide ou a expiré.");
    throw new StudentAuthApiError(error.message);
  }
  return (await response.json()) as { message: string };
}

export class StudentMfaLoginError extends StudentAuthApiError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly attemptsLeft?: number,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "StudentMfaLoginError";
  }
}

async function buildMfaLoginError(
  response: Response,
  fallback: string,
): Promise<StudentMfaLoginError> {
  const body = await response.json().catch(() => null);
  return new StudentMfaLoginError(
    body?.message || fallback,
    response.status,
    body?.code,
    body?.attemptsLeft,
    body?.retryAfter,
  );
}

export async function sendStudentMfaEmailCode(
  challengeToken: string,
): Promise<APIStudentMfaEmailResend> {
  const formData = new FormData();
  formData.append("challengeToken", challengeToken);

  const response = await studentFetch(`/api/student/auth/mfa/send-email`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw await buildMfaLoginError(response, "Impossible d'envoyer le code par e-mail.");
  }
  return response.json();
}

export async function verifyStudentMfa(payload: StudentMfaVerifyPayload): Promise<void> {
  const formData = new FormData();
  formData.append("challengeToken", payload.challengeToken);
  formData.append("method", payload.method);
  formData.append("code", payload.code);

  const response = await studentFetch(`/api/student/auth/mfa/verify`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw await buildMfaLoginError(response, "Code invalide ou expiré.");
  }
}
