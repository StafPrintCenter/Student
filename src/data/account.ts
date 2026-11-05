import type { APIStudentUser } from "@/data/auth";

export type APIStudentProfile = APIStudentUser;

export interface StudentProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  occupation?: string;
  bio?: string;
  photo?: File | null;
  removePhoto?: boolean;
}

export interface StudentEmailChangeRequestPayload {
  newEmail: string;
  password: string;
}

export interface StudentEmailChangeConfirmPayload {
  code: string;
}

export interface StudentPasswordChangePayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
  revokeOtherSessions: boolean;
}

export interface APIStudentPasswordChangeResponse {
  message: string;
  revokedSessions: number;
}

export interface APIStudentEmailChangeRequestResponse {
  message: string;
  hint: string;
  expiresInMinutes: number;
}
