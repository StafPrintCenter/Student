/**
 * Type aligné sur la réponse de l'API student (StudentResource)
 * et /auth/me (racine directe)
 */
export type APIStudentUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullname?: string;
  name?: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  occupation?: string | null;
  photo?: string | null;
  bio?: string | null;
  isActive?: boolean;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type APIStudentLoginResponse = {
  student: APIStudentUser;
  token: string;
};

export type StudentMfaLoginMethod = "email" | "totp" | "recovery" | "passkey";

export interface APIStudentMfaChallengeMethod {
  type: "email" | "totp" | "passkey";
  label: string;
  hint: string | null;
}

export interface APIStudentMfaChallenge {
  mfaRequired: true;
  challengeToken: string;
  defaultMethod: "email" | "totp" | "passkey";
  methods: APIStudentMfaChallengeMethod[];
  recoveryCodesAvailable: boolean;
  emailCodeSent: boolean;
  expiresAt: string;
}

export type APIStudentLoginResult = APIStudentLoginResponse | APIStudentMfaChallenge;

export interface StudentMfaVerifyPayload {
  challengeToken: string;
  method: StudentMfaLoginMethod;
  code: string;
}

export interface APIStudentMfaEmailResend {
  emailCodeSent: boolean;
  hint: string;
  retryAfter: number;
}

export function isStudentMfaChallenge(
  result: APIStudentLoginResult,
): result is APIStudentMfaChallenge {
  return "mfaRequired" in result && result.mfaRequired === true;
}

export interface StudentInviteVerifyResponse {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
}
