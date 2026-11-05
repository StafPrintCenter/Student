import { useEffect, useState, useCallback } from "react";
import {
  loginStudent,
  fetchStudentMe,
  logoutStudent,
  verifyStudentInvite,
  acceptStudentInvite,
  forgotStudentPassword,
  resetStudentPassword,
  StudentAuthApiError,
  sendStudentMfaEmailCode,
  verifyStudentMfa,
} from "@/stores/useAuthStore";
import { isStudentMfaChallenge } from "@/data/auth";
import type {
  StudentInviteVerifyResponse,
  StudentMfaVerifyPayload,
  APIStudentMfaChallenge,
  APIStudentMfaEmailResend,
} from "@/data/auth";

export interface StudentAuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  fullname: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  occupation: string | null;
  photo: string | null;
  bio: string | null;
  isActive: boolean;
  isBlocked: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toStudentAuthUser(rawStudent: unknown): StudentAuthUser {
  const response = asRecord(rawStudent);
  const student = asRecord(response.data ?? response.student ?? response);
  const firstName = stringValue(student.firstName ?? student.first_name);
  const lastName = stringValue(student.lastName ?? student.last_name);
  const fullName =
    stringValue(student.fullname ?? student.name) ||
    `${firstName} ${lastName}`.trim() ||
    "Étudiant";

  return {
    id: stringValue(student.id),
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    fullname: fullName,
    email: stringValue(student.email),
    phone: nullableString(student.phone),
    birthDate: nullableString(student.birthDate ?? student.birth_date),
    address: nullableString(student.address),
    occupation: nullableString(student.occupation),
    photo: nullableString(student.photo),
    bio: nullableString(student.bio),
    isActive: booleanValue(student.isActive ?? student.is_active, true),
    isBlocked: booleanValue(student.isBlocked ?? student.is_blocked, false),
    blockedAt: nullableString(student.blockedAt ?? student.blocked_at),
    blockedReason: nullableString(student.blockedReason ?? student.blocked_reason),
    createdAt: stringValue(student.createdAt ?? student.created_at),
    updatedAt: stringValue(student.updatedAt ?? student.updated_at),
  };
}

let sharedUser: StudentAuthUser | null = null;
let sharedReady = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function bootstrap() {
  try {
    const student = await fetchStudentMe();
    sharedUser = student ? toStudentAuthUser(student) : null;
  } catch {
    sharedUser = null;
  } finally {
    sharedReady = true;
    notify();
  }
}

let bootstrapped = false;

export type StudentLoginOutcome =
  { status: "authenticated" } | { status: "mfa"; challenge: APIStudentMfaChallenge };

async function completeSession() {
  const student = await fetchStudentMe();
  if (!student) {
    throw new StudentAuthApiError("La session n'a pas pu être établie.");
  }
  sharedUser = toStudentAuthUser(student);
  sharedReady = true;
  notify();
}

export function useStudentAuth() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);

    if (!bootstrapped) {
      bootstrapped = true;
      bootstrap();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<StudentLoginOutcome> => {
      const result = await loginStudent(email, password);
      if (isStudentMfaChallenge(result)) {
        return { status: "mfa", challenge: result };
      }
      await completeSession();
      return { status: "authenticated" };
    },
    [],
  );

  const verifyMfa = useCallback(async (payload: StudentMfaVerifyPayload): Promise<void> => {
    await verifyStudentMfa(payload);
    await completeSession();
  }, []);

  const sendMfaEmailCode = useCallback(
    (challengeToken: string): Promise<APIStudentMfaEmailResend> =>
      sendStudentMfaEmailCode(challengeToken),
    [],
  );

  const refresh = useCallback(async () => {
    await bootstrap();
  }, []);

  const logout = useCallback(async () => {
    await logoutStudent();
    sharedUser = null;
    notify();
  }, []);

  const verifyInvite = useCallback(
    async (params: {
      student: string;
      expires: string;
      signature: string;
    }): Promise<StudentInviteVerifyResponse> => {
      return verifyStudentInvite(params);
    },
    [],
  );

  const acceptInvite = useCallback(
    async (params: {
      student: string;
      expires: string;
      signature: string;
      password: string;
    }): Promise<{ message: string }> => {
      return acceptStudentInvite(params);
    },
    [],
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<{ message: string }> => forgotStudentPassword(email),
    [],
  );

  const resetPassword = useCallback(
    async (params: {
      email: string;
      token: string;
      password: string;
      passwordConfirmation: string;
    }): Promise<{ message: string }> => resetStudentPassword(params),
    [],
  );

  const setUser = useCallback((raw: unknown) => {
    sharedUser = toStudentAuthUser(raw);
    sharedReady = true;
    notify();
  }, []);

  return {
    user: sharedUser,
    isAuthenticated: !!sharedUser,
    ready: sharedReady,
    login,
    logout,
    verifyInvite,
    acceptInvite,
    forgotPassword,
    resetPassword,
    setUser,
    verifyMfa,
    sendMfaEmailCode,
    refresh,
  };
}
