import { useEffect, useState, useCallback } from "react";
import { loginStudent, fetchStudentMe, logoutStudent, verifyStudentInvite, acceptStudentInvite, StudentAuthApiError } from "@/stores/useAuthStore";
import type { StudentInviteVerifyResponse } from "@/data/auth";

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

function toStudentAuthUser(rawStudent: any): StudentAuthUser {
  const student = rawStudent?.data ?? rawStudent?.student ?? rawStudent ?? {};
  const firstName = student.firstName ?? student.first_name ?? "";
  const lastName = student.lastName ?? student.last_name ?? "";
  const fullName = (student.fullname ?? student.name ?? `${firstName} ${lastName}`.trim()) || "Étudiant";

  return {
    id: student.id ?? "",
    firstName: firstName,
    lastName: lastName,
    name: fullName,
    fullname: fullName,
    email: student.email ?? "",
    phone: student.phone ?? null,
    birthDate: student.birthDate ?? student.birth_date ?? null,
    address: student.address ?? null,
    occupation: student.occupation ?? null,
    photo: student.photo ?? null,
    bio: student.bio ?? null,
    isActive: student.isActive ?? student.is_active ?? true,
    isBlocked: student.isBlocked ?? student.is_blocked ?? false,
    blockedAt: student.blockedAt ?? student.blocked_at ?? null,
    blockedReason: student.blockedReason ?? student.blocked_reason ?? null,
    createdAt: student.createdAt ?? student.created_at ?? "",
    updatedAt: student.updatedAt ?? student.updated_at ?? "",
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

  const login = useCallback(async (email: string, password: string) => {
    await loginStudent(email, password);
    const student = await fetchStudentMe();
    if (!student) {
      throw new StudentAuthApiError("La session n'a pas pu être établie.");
    }
    sharedUser = toStudentAuthUser(student);
    sharedReady = true;
    notify();
  }, []);

  const logout = useCallback(async () => {
    await logoutStudent();
    sharedUser = null;
    notify();
  }, []);

  const verifyInvite = useCallback(
    async (params: { student: string; expires: string; signature: string }): Promise<StudentInviteVerifyResponse> => {
      return verifyStudentInvite(params);
    },
    []
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
    []
  );

  return {
    user: sharedUser,
    isAuthenticated: !!sharedUser,
    ready: sharedReady,
    login,
    logout,
    verifyInvite,
    acceptInvite,
  };
}