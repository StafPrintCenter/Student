export type StudentHealthLevel = "excellent" | "good" | "fair" | "low";
export type StudentHealthCategory = "security" | "profile";

export interface APIStudentHealthBreakdownEntry {
  percent: number;
  earned: number;
  total: number;
}

export interface APIStudentHealthItem {
  id: string;
  category: StudentHealthCategory;
  label: string;
  done: boolean;
  points: number;
}

export interface APIStudentHealthRecommendation {
  id: string;
  priority: number;
  type: StudentHealthCategory;
  level: "warning" | "info";
  urgent: boolean;
  title: string;
  message: string;
  action: { label: string; target: string };
  points: number;
  dismissed: boolean;
  ageDays?: number;
  sessions?: number;
  staleSessions?: number;
  missing?: string[];
}

export interface APIStudentHealth {
  score: number;
  level: StudentHealthLevel;
  label: string;
  breakdown: Record<StudentHealthCategory, APIStudentHealthBreakdownEntry>;
  items: APIStudentHealthItem[];
  recommendations: APIStudentHealthRecommendation[];
  dismissedCount: number;
  snoozeDays: number;
}

export interface StudentHealthDismissPayload {
  id: string;
  restore?: boolean;
}

export interface APIStudentHealthDismissResponse {
  id: string;
  dismissed: boolean;
  snoozeDays: number;
}