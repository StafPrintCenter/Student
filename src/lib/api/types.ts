// Shared types mirroring the future Laravel REST API contracts.

export interface BaseModel {
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_enabled: boolean;
  sort_order?: number;
}

export type EnrollmentStatus = | "pending_approval" | "awaiting_initial_payment" | "waiting_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "suspended" | "expired";

export type PaymentStatus = | "pending" | "partial" | "paid" | "overdue" | "cancelled" | "refunded";

export type CertificateStatus =
  | "not_eligible"
  | "eligible"
  | "issued"
  | "downloaded"
  | "revoked";

export type PaymentMethod = "mobile_money" | "card" | "bank_transfer" | "cash";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";

export interface Student extends BaseModel {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  occupation?: string;
  birth_date?: string;
  biography?: string;
  emergency_contact?: string;
  photo_url?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correct: number[]; // indices of correct choices
  multi: boolean;   // true when several choices are correct
}

export interface InstructorFeedback {
  note?: number;      // 0-100
  comment: string;
  validated: boolean; // true when instructor validated the submission
  at: string;
}

export interface Instructor {
  uuid: string;
  name: string;
  title: string;
  bio: string;
  avatar_seed: string;
}

export interface Lesson extends BaseModel {
  title: string;
  duration_minutes: number;
  completed: boolean;
  kind: "video" | "reading" | "quiz" | "assignment" | "project" | "exercise";
  score?: number;
  // Rich content
  video_url?: string;             // for video kind (simulated)
  chapters?: { at: number; label: string }[];
  questions?: QuizQuestion[];     // for quiz + exercise
  quiz_time_limit_sec?: number;   // for quiz only
  brief?: string;                 // for assignment/project
  instructor_feedback?: InstructorFeedback;
}

export interface Module extends BaseModel {
  title: string;
  lessons: Lesson[];
}

export interface Training extends BaseModel {
  slug: string;
  title: string;
  theme: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  description: string;
  objectives: string[];
  prerequisites: string[];
  duration: string;
  duration_hours: number;
  price: number;
  registration_fee: number;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  instructor: string;                 // legacy display name
  instructor_profile?: Instructor;    // rich profile
  location: string;
  maximum_students: number;
  current_students: number;
  waiting_list_enabled: boolean;
  enrollment_status: "open" | "closed" | "full" | "waiting_list";
  published_at: string | null;
  cover_color: string;
  modules: Module[];
  next_session?: string;
  faq?: { q: string; a: string }[];
}

export interface Enrollment extends BaseModel {
  training_uuid: string;
  student_uuid: string;
  enrolled_at: string;
  expected_completion: string;
  status: EnrollmentStatus;
  progress: number;
  attendance: number;
  payment_status: PaymentStatus;
  certificate_status: CertificateStatus;
  amount_paid: number;
  amount_due: number;
  discount?: number;
  scholarship?: number;
}

export interface Payment extends BaseModel {
  enrollment_uuid: string;
  training_uuid: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  paid_at: string;
  invoice_url?: string;
  receipt_url?: string;
}

export interface Certificate extends BaseModel {
  training_uuid: string;
  training_title: string;
  number: string;
  issued_at: string | null;
  status: CertificateStatus;
  download_url?: string;
}

export interface NotificationItem extends BaseModel {
  kind:
  | "payment_received"
  | "payment_overdue"
  | "payment_reminder"
  | "lesson_published"
  | "assignment_graded"
  | "certificate_available"
  | "admin_message"
  | "training_updated"
  | "reminder";
  title: string;
  body: string;
  read: boolean;
  link?: string;
}

export interface CalendarEvent extends BaseModel {
  title: string;
  start: string;
  end: string;
  kind: "lesson" | "exam" | "assignment" | "live" | "appointment";
  training_uuid?: string;
  location?: string;
}

export interface StudentDocument extends BaseModel {
  name: string;
  kind: "invoice" | "receipt" | "enrollment" | "material" | "certificate" | "admin";
  training_uuid?: string;
  size_kb: number;
  url: string;
}

export interface SupportTicket extends BaseModel {
  subject: string;
  body: string;
  status: TicketStatus;
  messages: {
    uuid: string;
    from: "student" | "admin";
    body: string;
    at: string;
  }[];
}

export interface QuizAttempt {
  uuid: string;
  lesson_uuid: string;
  training_uuid: string;
  student_uuid: string;
  score: number;         // 0-100
  duration_sec: number;
  submitted_at: string;
  auto_submitted: boolean;
  answers: number[][];   // per-question selected indices
}

export interface CommunityReply {
  uuid: string;
  author: string;
  author_role: "student" | "instructor" | "admin";
  body: string;
  at: string;
}

export interface CommunityPost {
  uuid: string;
  author: string;
  author_role: "student" | "instructor" | "admin";
  training_uuid?: string;
  title: string;
  body: string;
  created_at: string;
  likes: number;
  liked: boolean;
  replies: CommunityReply[];
  tags?: string[];
}

export interface DashboardSnapshot {
  student: Student;
  current_trainings: (Enrollment & { training: Training })[];
  completed_trainings: number;
  upcoming_sessions: CalendarEvent[];
  attendance_percentage: number;
  overall_progress: number;
  certificates_earned: number;
  outstanding_balance: number;
  recent_payments: Payment[];
  recent_notifications: NotificationItem[];
  upcoming_deadlines: CalendarEvent[];
  payment_reminders: {
    enrollment_uuid: string;
    training_title: string;
    training_uuid: string;
    amount_due: number;
    reason: string;
    severity: "info" | "warning" | "danger";
  }[];
}
