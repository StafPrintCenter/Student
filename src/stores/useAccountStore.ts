import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIStudentProfile,
  StudentProfilePayload,
  StudentEmailChangeRequestPayload,
  StudentEmailChangeRequestResponse,
  StudentEmailChangeConfirmPayload,
} from "@/data/account";

export class StudentAccountApiError extends Error { }

const RESOURCE_KEY = "account";

/** Payload -> FormData : ignore undefined, gère File, booléens ("1"/"0") et null */
function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else if (value === null) {
      // photo null = pas de fichier : on n'envoie rien
      if (key !== "photo") fd.append(key, "");
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

export async function updateStudentProfile(payload: StudentProfilePayload): Promise<APIStudentProfile> {
  const response = await studentFetch(`/api/student/account/profile`, {
    method: "PUT",
    body: buildFormData({ ...payload }),
  });
  if (!response.ok) {
    const error = await parseApiError(response, "Erreur lors de la modification du profil.");
    throw new StudentAccountApiError(error.message);
  }
  const json: { data: APIStudentProfile } = await response.json();
  return json.data;
}

export async function requestStudentEmailChange(
  payload: StudentEmailChangeRequestPayload
): Promise<StudentEmailChangeRequestResponse> {
  const response = await studentFetch(`/api/student/account/email/request`, {
    method: "POST",
    body: buildFormData({ ...payload }),
  });
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible d'envoyer le code de confirmation.");
    throw new StudentAccountApiError(error.message);
  }
  return response.json();
}

export async function confirmStudentEmailChange(
  payload: StudentEmailChangeConfirmPayload
): Promise<APIStudentProfile> {
  const response = await studentFetch(`/api/student/account/email/confirm`, {
    method: "POST",
    body: buildFormData({ ...payload }),
  });
  if (!response.ok) {
    const error = await parseApiError(response, "Code invalide ou expiré.");
    throw new StudentAccountApiError(error.message);
  }
  const json: { data: APIStudentProfile } = await response.json();
  return json.data;
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentProfilePayload) => updateStudentProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESOURCE_KEY] });
      qc.invalidateQueries({ queryKey: ["current-student"] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESOURCE_KEY] });
      qc.invalidateQueries({ queryKey: ["current-student"] });
    },
  });
}