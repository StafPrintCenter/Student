import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MFA_KEY, buildForm, mfaRequest } from "@/stores/useMfaStore";
import type {
  APIStudentPasskeyCreationOptions,
  APIStudentPasskeyRegisterResponse,
  StudentPasskeyOptionsPayload,
  StudentPasskeyRegisterPayload,
  StudentPasskeyDeletePayload,
} from "@/data/passkeys";
import type { APIStudentMfaStatus } from "@/data/mfa";

export const fetchStudentPasskeyOptions = (payload: StudentPasskeyOptionsPayload) =>
  mfaRequest<APIStudentPasskeyCreationOptions>(
    "/passkeys/options",
    "Impossible de démarrer l'enregistrement de la clé d'accès.",
    { method: "POST", body: buildForm({ password: payload.password }) }
  );

export const registerStudentPasskey = (payload: StudentPasskeyRegisterPayload) => {
  const fields: Record<string, string> = {
    credential: payload.credential,
    makeDefault: payload.makeDefault ? "1" : "0",
  };
  if (payload.name) fields.name = payload.name;

  return mfaRequest<APIStudentPasskeyRegisterResponse>(
    "/passkeys/register",
    "Impossible d'enregistrer la clé d'accès.",
    { method: "POST", body: buildForm(fields) }
  );
};

export function useStudentPasskeyOptions() {
  return useMutation({ mutationFn: fetchStudentPasskeyOptions });
}

/** Le résultat complet (avec `recoveryCodes`) est renvoyé à l'appelant ; le cache ne garde que l'état MFA */
export function useRegisterStudentPasskey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerStudentPasskey,
    onSuccess: ({ recoveryCodes: _recoveryCodes, ...status }) => qc.setQueryData(MFA_KEY, status),
  });
}

export const deleteStudentPasskey = (payload: StudentPasskeyDeletePayload) =>
  mfaRequest<APIStudentMfaStatus>(
    `/passkeys/${payload.id}`,
    "Impossible de supprimer cette clé d'accès.",
    { method: "DELETE", body: buildForm({ password: payload.password }) }
  );

export function useDeleteStudentPasskey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStudentPasskey,
    onSuccess: (status) => qc.setQueryData(MFA_KEY, status),
  });
}