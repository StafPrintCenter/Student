export type StudentRegistrationSource = "self_registered" | "invited" | string;

export type StudentTrainingAssignment = {
  assignmentId: string;
  trainingId: string;
  trainingTitle: string | null;
  trainingStatus: string | null;
  role: "lead" | "assistant" | string;
  assignedAt: string | null;
};


/**
 * Type aligné sur inscription et connexion
 */
export interface StudentRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
}
export interface StudentAuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  registrationSource: string | null;
  photo: string | null;
  bio: string | null;
  isActive: boolean;
  isBlocked: boolean;
  isPending: boolean;
  needsApproval: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  invitedBy: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  trainings?: StudentTrainingAssignment[];
  createdAt: string;
}

/**
 * Type aligné sur StudentResource
 */
export type APIStudentUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  registrationSource: StudentRegistrationSource | null;
  photo: string | null;
  bio: string | null;
  isActive: boolean;
  isBlocked: boolean;
  isPending: boolean;
  needsApproval: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  invitedBy: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  trainings?: StudentTrainingAssignment[];
  createdAt: string;
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

export const roleLabels: Record<string, string> = {
  lead: "Formateur principal",
  assistant: "Formateur assistant",
};

export function getStudentRoleLabel(trainings?: { role: string }[]): string {
  const primaryRole = trainings?.[0]?.role;
  if (!primaryRole) return "Non assigné";
  return roleLabels[primaryRole.toLowerCase()] ?? primaryRole;
}