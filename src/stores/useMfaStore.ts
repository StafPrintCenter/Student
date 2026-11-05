import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIStudentMfaStatus,
  APIStudentMfaRecoveryCodes,
  APIStudentMfaTotpSetup,
  StudentMfaPasswordPayload,
  StudentMfaDefaultPayload,
  StudentMfaTotpConfirmPayload,
  StudentMfaDeleteMethodPayload,
  StudentMfaEmailMethodPayload,
} from "@/data/mfa";

export class StudentMfaApiError extends Error {}

const MFA_KEY = ["student-mfa"] as const;
const BASE_PATH = "/api/student/account/security/mfa";

function buildForm(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.append(key, value);
  return fd;
}

async function mfaRequest<T>(
  path: string,
  fallbackMessage: string,
  init?: { method: "POST" | "PUT" | "DELETE"; body: FormData },
): Promise<T> {
  const response = await studentFetch(`${BASE_PATH}${path}`, init);
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new StudentMfaApiError(error.message);
  }
  return response.json();
}

/* ---------- Fonctions ---------- */

export const fetchStudentMfaStatus = () =>
  mfaRequest<APIStudentMfaStatus>("", "Impossible de charger les paramètres de sécurité.");

export const enableStudentMfa = (payload: StudentMfaPasswordPayload) =>
  mfaRequest<APIStudentMfaStatus>("/enable", "Impossible d'activer la double authentification.", {
    method: "POST",
    body: buildForm({ password: payload.password }),
  });

export const disableStudentMfa = (payload: StudentMfaPasswordPayload) =>
  mfaRequest<APIStudentMfaStatus>(
    "/disable",
    "Impossible de désactiver la double authentification.",
    {
      method: "POST",
      body: buildForm({ password: payload.password }),
    },
  );

export const setStudentMfaDefault = (payload: StudentMfaDefaultPayload) =>
  mfaRequest<APIStudentMfaStatus>("/default", "Impossible de définir la méthode par défaut.", {
    method: "PUT",
    body: buildForm({ method: payload.method }),
  });

export const regenerateStudentMfaRecoveryCodes = (payload: StudentMfaPasswordPayload) =>
  mfaRequest<APIStudentMfaRecoveryCodes>(
    "/recovery-codes/regenerate",
    "Impossible de générer de nouveaux codes de secours.",
    { method: "POST", body: buildForm({ password: payload.password }) },
  );

export const setupStudentMfaTotp = (payload: StudentMfaPasswordPayload) =>
  mfaRequest<APIStudentMfaTotpSetup>("/totp/setup", "Impossible de démarrer la configuration.", {
    method: "POST",
    body: buildForm({ password: payload.password }),
  });

export const confirmStudentMfaTotp = (payload: StudentMfaTotpConfirmPayload) =>
  mfaRequest<APIStudentMfaStatus>("/totp/confirm", "Code invalide ou expiré.", {
    method: "POST",
    body: buildForm({
      code: payload.code,
      makeDefault: payload.makeDefault ? "1" : "0",
    }),
  });

export const deleteStudentMfaMethod = (payload: StudentMfaDeleteMethodPayload) =>
  mfaRequest<APIStudentMfaStatus>(
    `/methods/${payload.id}`,
    "Impossible de supprimer cette méthode.",
    {
      method: "DELETE",
      body: buildForm({ password: payload.password }),
    },
  );

export const setStudentMfaEmailMethod = (payload: StudentMfaEmailMethodPayload) =>
  mfaRequest<APIStudentMfaStatus>("/email", "Impossible de modifier la méthode e-mail.", {
    method: "PUT",
    body: buildForm({
      enabled: payload.enabled ? "1" : "0",
      password: payload.password,
    }),
  });

/* ---------- Hooks ---------- */

export function useStudentMfaStatus() {
  const query = useQuery({
    queryKey: MFA_KEY,
    queryFn: fetchStudentMfaStatus,
    staleTime: 1000 * 30,
    retry: false,
  });
  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** Les mutations qui renvoient l'état MFA complet le placent directement dans le cache */
function useStatusMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<APIStudentMfaStatus>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (status) => qc.setQueryData(MFA_KEY, status),
  });
}

export const useEnableStudentMfa = () => useStatusMutation(enableStudentMfa);
export const useDisableStudentMfa = () => useStatusMutation(disableStudentMfa);
export const useSetStudentMfaDefault = () => useStatusMutation(setStudentMfaDefault);
export const useConfirmStudentMfaTotp = () => useStatusMutation(confirmStudentMfaTotp);
export const useDeleteStudentMfaMethod = () => useStatusMutation(deleteStudentMfaMethod);
export const useSetStudentMfaEmailMethod = () => useStatusMutation(setStudentMfaEmailMethod);

export function useSetupStudentMfaTotp() {
  return useMutation({ mutationFn: setupStudentMfaTotp });
}

/** La régénération ne renvoie que les codes : on invalide l'état pour rafraîchir le compteur */
export function useRegenerateStudentMfaRecoveryCodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: regenerateStudentMfaRecoveryCodes,
    onSuccess: () => qc.invalidateQueries({ queryKey: MFA_KEY }),
  });
}
