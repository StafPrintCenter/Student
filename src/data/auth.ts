/**
 * Type aligné sur la réponse de l'API student (StudentResource)
 * et /auth/me (racine directe)
 */
export type APIStudentUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
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

export interface StudentInviteVerifyResponse {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
}