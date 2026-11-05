export type StudentMfaMethodType = "email" | "totp";

export interface APIStudentMfaMethod {
  id: string | null; // null pour la méthode e-mail
  type: StudentMfaMethodType;
  label: string;
  hint: string | null;
  enabled: boolean;
  confirmedAt: string | null;
  lastUsedAt: string | null;
}

export interface APIStudentMfaStatus {
  enabled: boolean;
  enforced: boolean;
  defaultMethod: StudentMfaMethodType;
  methods: APIStudentMfaMethod[];
  recoveryCodesRemaining: number;
  recoveryCodesGeneratedAt: string | null;
}

export interface APIStudentMfaRecoveryCodes {
  recoveryCodes: string[];
  recoveryCodesRemaining: number;
}

export interface APIStudentMfaTotpSetup {
  secret: string;
  otpauthUri: string;
  issuer: string;
  account: string;
}

export interface StudentMfaPasswordPayload {
  password: string;
}

export interface StudentMfaDefaultPayload {
  method: StudentMfaMethodType;
}

export interface StudentMfaTotpConfirmPayload {
  code: string;
  makeDefault?: boolean;
}

export interface StudentMfaDeleteMethodPayload {
  id: string;
  password: string;
}

export interface StudentMfaEmailMethodPayload {
  enabled: boolean;
  password: string;
}
