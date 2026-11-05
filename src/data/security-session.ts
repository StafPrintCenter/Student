export type StudentSessionDeviceType = "desktop" | "mobile" | "tablet" | (string & {});

export interface APIStudentSession {
  id: number;
  isCurrent: boolean;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: StudentSessionDeviceType;
  ipAddress: string;
  authMethod: string; // "password" | "email" | ...
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

export interface APIStudentSessionsResponse {
  data: APIStudentSession[];
  total: number;
}

export interface APIStudentSessionMessage {
  message: string;
}

export interface APIStudentSessionRevokeResponse {
  message: string;
  revoked: number;
}