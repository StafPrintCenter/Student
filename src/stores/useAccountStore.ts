import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIStudentProfile,
  StudentProfilePayload,
  StudentEmailChangeRequestPayload,
  APIStudentEmailChangeRequestResponse,
  StudentPasswordChangePayload,
  APIStudentPasswordChangeResponse,
  StudentEmailChangeConfirmPayload,
} from "@/data/account";

export class StudentAccountApiError extends Error {}

async function accountRequest<T>(
  path: string,
  method: "POST" | "PUT",
  body: FormData,
  fallbackMessage: string,
): Promise<T> {
  const response = await studentFetch(`/api/student/account/${path}`, { method, body });
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new StudentAccountApiError(error.message);
  }
  return response.json();
}

export async function updateStudentProfile(
  payload: StudentProfilePayload,
): Promise<APIStudentProfile> {
  const fd = new FormData();
  fd.append("firstName", payload.firstName);
  fd.append("lastName", payload.lastName);
  if (payload.phone !== undefined) fd.append("phone", payload.phone);
  if (payload.birthDate !== undefined) fd.append("birthDate", payload.birthDate);
  if (payload.address !== undefined) fd.append("address", payload.address);
  if (payload.occupation !== undefined) fd.append("occupation", payload.occupation);
  fd.append("bio", payload.bio ?? "");
  fd.append("removePhoto", payload.removePhoto ? "1" : "0");
  if (payload.photo) fd.append("photo", payload.photo);

  const json = await accountRequest<{ data: APIStudentProfile }>(
    "profile",
    "PUT",
    fd,
    "Impossible de modifier le profil.",
  );
  return json.data;
}

export async function requestStudentEmailChange(
  payload: StudentEmailChangeRequestPayload,
): Promise<APIStudentEmailChangeRequestResponse> {
  const fd = new FormData();
  fd.append("newEmail", payload.newEmail);
  fd.append("password", payload.password);

  return accountRequest<APIStudentEmailChangeRequestResponse>(
    "email/request",
    "POST",
    fd,
    "Impossible d'envoyer le code de confirmation.",
  );
}

export async function confirmStudentEmailChange(
  payload: StudentEmailChangeConfirmPayload,
): Promise<APIStudentProfile> {
  const fd = new FormData();
  fd.append("code", payload.code);

  const json = await accountRequest<{ data: APIStudentProfile }>(
    "email/confirm",
    "POST",
    fd,
    "Code invalide ou expiré.",
  );
  return json.data;
}

export async function changeStudentPassword(
  payload: StudentPasswordChangePayload,
): Promise<APIStudentPasswordChangeResponse> {
  const fd = new FormData();
  fd.append("currentPassword", payload.currentPassword);
  fd.append("password", payload.password);
  fd.append("password_confirmation", payload.passwordConfirmation);
  fd.append("revokeOtherSessions", String(payload.revokeOtherSessions));

  return accountRequest<APIStudentPasswordChangeResponse>(
    "password",
    "PUT",
    fd,
    "Impossible de modifier le mot de passe.",
  );
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentProfilePayload) => updateStudentProfile(payload),
    onSuccess: (profile) => qc.setQueryData(["current-student"], profile),
  });
}

export function useRequestStudentEmailChange() {
  return useMutation({
    mutationFn: (payload: StudentEmailChangeRequestPayload) => requestStudentEmailChange(payload),
  });
}

export function useConfirmStudentEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentEmailChangeConfirmPayload) => confirmStudentEmailChange(payload),
    onSuccess: (profile) => qc.setQueryData(["current-student"], profile),
  });
}

export function useChangeStudentPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentPasswordChangePayload) => changeStudentPassword(payload),
    onSuccess: (_response, payload) => {
      if (payload.revokeOtherSessions) {
        return qc.invalidateQueries({ queryKey: ["student-sessions"] });
      }
    },
  });
}
