import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import { buildFormData } from "@/lib/build-form-data";
import type {
  APIStudentMfaStatus,
  APIStudentMfaTotpSetup,
  APIStudentMfaRecoveryCodes,
  StudentMfaPasswordPayload,
  StudentMfaDefaultPayload,
  StudentMfaTotpConfirmPayload,
  StudentMfaDeleteMethodPayload,
} from "@/data/mfa";

export class StudentMfaApiError extends Error { }

const RESOURCE_KEY = "mfa";
const BASE = "/api/student/account/security/mfa";

async function mfaCall<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  payload: Record<string, unknown> | undefined,
  fallbackMessage: string
): Promise<T> {
  const response = await studentFetch(`${BASE}${path}`, {
    method,
    ...(payload ? { body: buildFormData(payload) } : {}),
  });
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new StudentMfaApiError(error.message);
  }
  return response.json();
}

export const fetchStudentMfaStatus = () =>
  mfaCall<APIStudentMfaStatus>("", "GET", undefined, "Erreur lors de la récupération de la MFA.");

export const enableStudentMfa = (p: StudentMfaPasswordPayload) =>
  mfaCall<APIStudentMfaStatus>("/enable", "POST", { ...p }, "Impossible d'activer la MFA.");

export const disableStudentMfa = (p: StudentMfaPasswordPayload) =>
  mfaCall<APIStudentMfaStatus>("/disable", "POST", { ...p }, "Impossible de désactiver la MFA.");

export const setStudentMfaDefaultMethod = (p: StudentMfaDefaultPayload) =>
  mfaCall<APIStudentMfaStatus>("/default", "PUT", { ...p }, "Impossible de changer la méthode par défaut.");

export const regenerateStudentRecoveryCodes = (p: StudentMfaPasswordPayload) =>
  mfaCall<APIStudentMfaRecoveryCodes>("/recovery-codes/regenerate", "POST", { ...p }, "Impossible de générer les codes.");

export const setupStudentTotp = (p: StudentMfaPasswordPayload) =>
  mfaCall<APIStudentMfaTotpSetup>("/totp/setup", "POST", { ...p }, "Impossible de démarrer la configuration.");

export const confirmStudentTotp = (p: StudentMfaTotpConfirmPayload) =>
  mfaCall<APIStudentMfaStatus>("/totp/confirm", "POST", { ...p }, "Code invalide ou expiré.");

export const deleteStudentMfaMethod = ({ id, password }: StudentMfaDeleteMethodPayload) =>
  mfaCall<APIStudentMfaStatus>(`/methods/${id}`, "DELETE", { password }, "Impossible de supprimer cette méthode.");

export function useStudentMfaStatus() {
  const query = useQuery({
    queryKey: [RESOURCE_KEY, "status"],
    queryFn: fetchStudentMfaStatus,
    staleTime: 1000 * 30,
  });
  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** Mutation dont la réponse est le nouvel état MFA : on met le cache à jour puis on invalide */
function useStatusMutation<TVars>(fn: (vars: TVars) => Promise<APIStudentMfaStatus>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (status) => {
      qc.setQueryData([RESOURCE_KEY, "status"], status);
      qc.invalidateQueries({ queryKey: [RESOURCE_KEY] });
    },
  });
}

export const useEnableStudentMfa = () => useStatusMutation(enableStudentMfa);
export const useDisableStudentMfa = () => useStatusMutation(disableStudentMfa);
export const useSetStudentMfaDefaultMethod = () => useStatusMutation(setStudentMfaDefaultMethod);
export const useConfirmStudentTotp = () => useStatusMutation(confirmStudentTotp);
export const useDeleteStudentMfaMethod = () => useStatusMutation(deleteStudentMfaMethod);

export function useSetupStudentTotp() {
  return useMutation({ mutationFn: setupStudentTotp });
}

export function useRegenerateStudentRecoveryCodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: regenerateStudentRecoveryCodes,
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESOURCE_KEY] }),
  });
}