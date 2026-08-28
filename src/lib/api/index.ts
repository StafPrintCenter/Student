// Mock API layer — mirrors future Laravel REST endpoints.

import {
  CALENDAR,
  CERTIFICATES,
  COMMUNITY_POSTS,
  DOCUMENTS,
  ENROLLMENTS,
  NOTIFICATIONS,
  PAYMENTS,
  STUDENT,
  TICKETS,
  TRAININGS,
} from "./mock-data";
import type {
  CalendarEvent,
  Certificate,
  CommunityPost,
  DashboardSnapshot,
  Enrollment,
  Lesson,
  NotificationItem,
  Payment,
  PaymentMethod,
  QuizAttempt,
  QuizQuestion,
  Student,
  StudentDocument,
  SupportTicket,
  Training,
} from "./types";
import { daysFromNow, delay, hasUnlockedAccess, minAccessAmount, nowISO, uuid } from "./utils";

// mutable in-memory copies
let student: Student = { ...STUDENT };
const enrollments: Enrollment[] = [...ENROLLMENTS];
const payments: Payment[] = [...PAYMENTS];
const notifications: NotificationItem[] = [...NOTIFICATIONS];
const tickets: SupportTicket[] = [...TICKETS];
const posts: CommunityPost[] = [...COMMUNITY_POSTS];
const quizAttempts: QuizAttempt[] = [];

// ------------- helpers -------------
function findLesson(training_uuid: string, lesson_uuid: string) {
  const t = TRAININGS.find((x) => x.uuid === training_uuid);
  if (!t) return { training: undefined, lesson: undefined };
  for (const m of t.modules) {
    const l = m.lessons.find((x) => x.uuid === lesson_uuid);
    if (l) return { training: t, lesson: l };
  }
  return { training: t, lesson: undefined };
}
function recomputeProgress(training_uuid: string) {
  const t = TRAININGS.find((x) => x.uuid === training_uuid);
  const en = enrollments.find((x) => x.training_uuid === training_uuid && x.student_uuid === student.uuid);
  if (!t || !en) return;
  const total = t.modules.reduce((s, m) => s + m.lessons.length, 0) || 1;
  const done = t.modules.reduce((s, m) => s + m.lessons.filter((l) => l.completed).length, 0);
  en.progress = Math.round((done / total) * 100);
  en.updated_at = nowISO();
  if (en.status === "confirmed" && en.progress > 0) en.status = "in_progress";
  if (en.progress === 100 && en.amount_due === 0) en.status = "completed";
}
function bestScoreFor(lesson_uuid: string) {
  const atts = quizAttempts.filter((a) => a.lesson_uuid === lesson_uuid);
  if (atts.length === 0) return null;
  return atts.reduce((max, a) => (a.score > max ? a.score : max), 0);
}
function pushNotif(input: Omit<NotificationItem, "uuid" | "created_at" | "updated_at" | "deleted_at" | "is_enabled">) {
  const n: NotificationItem = {
    uuid: uuid(), created_at: nowISO(), updated_at: nowISO(),
    deleted_at: null, is_enabled: true, ...input,
  };
  notifications.unshift(n);
}

// -------- Student profile ----------
export const studentApi = {
  me: () => delay(student),
  update: (patch: Partial<Student>) => {
    student = { ...student, ...patch, updated_at: nowISO() };
    return delay(student);
  },
  changePassword: (_current: string, _next: string) => delay({ ok: true }),
};

// -------- Trainings ----------
export interface TrainingFilters {
  search?: string;
  theme?: string;
  level?: string;
  sort?: "recent" | "az" | "price";
}
export const trainingApi = {
  list: (filters: TrainingFilters = {}) => {
    let items = TRAININGS.filter((t) => !t.deleted_at && t.is_enabled);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.theme.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (filters.theme) items = items.filter((t) => t.theme === filters.theme);
    if (filters.level) items = items.filter((t) => t.level === filters.level);
    if (filters.sort === "az") items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    if (filters.sort === "price") items = [...items].sort((a, b) => a.price - b.price);
    return delay(items);
  },
  detail: (id: string) =>
    delay(TRAININGS.find((t) => t.uuid === id || t.slug === id) ?? null),
  myEnrollments: () => {
    const rows = enrollments.map((e) => ({
      ...e,
      training: TRAININGS.find((t) => t.uuid === e.training_uuid)!,
    }));
    return delay(rows);
  },
  enroll: (training_uuid: string) => {
    const t = TRAININGS.find((x) => x.uuid === training_uuid);
    if (!t) return Promise.reject(new Error("Formation introuvable"));
    const already = enrollments.find(
      (e) => e.training_uuid === training_uuid && e.student_uuid === student.uuid,
    );
    if (already) return Promise.reject(new Error("Vous êtes déjà inscrit à cette formation."));
    const remaining = t.maximum_students - t.current_students;
    if (new Date(t.registration_deadline) < new Date()) {
      return Promise.reject(new Error("Les inscriptions sont fermées pour cette formation."));
    }
    if (remaining <= 0 && !t.waiting_list_enabled) {
      return Promise.reject(new Error("Cette formation est complète."));
    }
    const wait = remaining <= 0;
    const en: Enrollment = {
      uuid: uuid(),
      created_at: nowISO(),
      updated_at: nowISO(),
      deleted_at: null,
      is_enabled: true,
      training_uuid,
      student_uuid: student.uuid,
      enrolled_at: nowISO(),
      expected_completion: t.end_date,
      status: wait ? "pending_approval" : "awaiting_initial_payment",
      progress: 0,
      attendance: 0,
      payment_status: "pending",
      certificate_status: "not_eligible",
      amount_paid: 0,
      amount_due: t.price + t.registration_fee,
    };
    enrollments.push(en);
    pushNotif({
      kind: "reminder",
      title: `Inscription à « ${t.title} »`,
      body: `Réglez au minimum ${minAccessAmount(t).toLocaleString("fr-FR")} XOF pour débloquer le contenu.`,
      read: false,
      link: `/trainings/${t.uuid}`,
    });
    return delay({ enrollment: en, waiting_list: wait });
  },
};

// -------- Learning ----------
export const learningApi = {
  attempts: (lesson_uuid: string) =>
    delay([...quizAttempts.filter((a) => a.lesson_uuid === lesson_uuid)]
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))),
  bestScore: (lesson_uuid: string) => delay(bestScoreFor(lesson_uuid)),
  completeVideo: (training_uuid: string, lesson_uuid: string) => {
    const { lesson } = findLesson(training_uuid, lesson_uuid);
    if (!lesson) return Promise.reject(new Error("Leçon introuvable"));
    lesson.completed = true;
    recomputeProgress(training_uuid);
    return delay({ ok: true });
  },
  submitExercise: (input: {
    training_uuid: string;
    lesson_uuid: string;
    answers: number[][];
  }) => {
    const { lesson } = findLesson(input.training_uuid, input.lesson_uuid);
    if (!lesson || !lesson.questions) return Promise.reject(new Error("Exercice introuvable"));
    const score = gradeAnswers(lesson.questions, input.answers);
    lesson.completed = true;
    lesson.score = score;
    lesson.instructor_feedback = {
      comment: "Soumission reçue — en attente d'évaluation du formateur.",
      validated: false,
      at: nowISO(),
    };
    recomputeProgress(input.training_uuid);
    return delay({ score });
  },
  submitQuiz: (input: {
    training_uuid: string;
    lesson_uuid: string;
    answers: number[][];
    duration_sec: number;
    auto_submitted: boolean;
  }) => {
    const { lesson } = findLesson(input.training_uuid, input.lesson_uuid);
    if (!lesson || !lesson.questions) return Promise.reject(new Error("Quiz introuvable"));
    const score = gradeAnswers(lesson.questions, input.answers);
    const attempt: QuizAttempt = {
      uuid: uuid(),
      lesson_uuid: lesson.uuid,
      training_uuid: input.training_uuid,
      student_uuid: student.uuid,
      score,
      duration_sec: input.duration_sec,
      submitted_at: nowISO(),
      auto_submitted: input.auto_submitted,
      answers: input.answers,
    };
    quizAttempts.push(attempt);
    // best score becomes the official one
    const best = bestScoreFor(lesson.uuid) ?? score;
    lesson.score = best;
    if (best >= 50) lesson.completed = true;
    recomputeProgress(input.training_uuid);
    return delay({ attempt, best });
  },
  submitProject: (input: { training_uuid: string; lesson_uuid: string; body: string }) => {
    const { lesson } = findLesson(input.training_uuid, input.lesson_uuid);
    if (!lesson) return Promise.reject(new Error("Devoir introuvable"));
    lesson.completed = true;
    lesson.instructor_feedback = {
      comment: `Livrable reçu (${input.body.length} caractères). En attente d'évaluation du formateur.`,
      validated: false,
      at: nowISO(),
    };
    recomputeProgress(input.training_uuid);
    return delay({ ok: true });
  },
};

function gradeAnswers(questions: QuizQuestion[], answers: number[][]) {
  let good = 0;
  questions.forEach((q, i) => {
    const a = [...(answers[i] ?? [])].sort();
    const c = [...q.correct].sort();
    if (a.length === c.length && a.every((v, k) => v === c[k])) good += 1;
  });
  return Math.round((good / questions.length) * 100);
}

// -------- Payments ----------
export const paymentApi = {
  list: () => delay([...payments].sort((a, b) => b.paid_at.localeCompare(a.paid_at))),
  byEnrollment: (enrollment_uuid: string) =>
    delay(payments.filter((p) => p.enrollment_uuid === enrollment_uuid)),
  summary: () => {
    const rows = enrollments.map((e) => {
      const t = TRAININGS.find((x) => x.uuid === e.training_uuid)!;
      return { enrollment: e, training: t, due_date: t.end_date };
    });
    const totalDue = rows.reduce((s, r) => s + r.enrollment.amount_due, 0);
    const totalPaid = rows.reduce((s, r) => s + r.enrollment.amount_paid, 0);
    return delay({ rows, totalDue, totalPaid });
  },
  create: (input: { enrollment_uuid: string; amount: number; method: PaymentMethod }) => {
    const e = enrollments.find((x) => x.uuid === input.enrollment_uuid);
    if (!e) return Promise.reject(new Error("Inscription introuvable"));
    if (input.amount <= 0) return Promise.reject(new Error("Montant invalide"));
    const t = TRAININGS.find((x) => x.uuid === e.training_uuid);
    const payment: Payment = {
      uuid: uuid(),
      created_at: nowISO(),
      updated_at: nowISO(),
      deleted_at: null,
      is_enabled: true,
      enrollment_uuid: e.uuid,
      training_uuid: e.training_uuid,
      amount: input.amount,
      method: input.method,
      reference: `${input.method.toUpperCase()}-${Math.floor(Math.random() * 1e6)}`,
      status: "paid",
      paid_at: nowISO(),
    };
    payments.unshift(payment);
    e.amount_paid += input.amount;
    e.amount_due = Math.max(0, e.amount_due - input.amount);
    e.payment_status = e.amount_due === 0 ? "paid" : "partial";
    if (t && e.status === "awaiting_initial_payment" && hasUnlockedAccess(e, t)) {
      e.status = e.amount_due === 0 ? "confirmed" : "in_progress";
    } else if (e.status === "waiting_payment" && e.amount_due === 0) {
      e.status = "confirmed";
    }
    pushNotif({
      kind: "payment_received",
      title: "Paiement reçu",
      body: `Merci ! Paiement de ${input.amount.toLocaleString("fr-FR")} XOF enregistré (${payment.reference}).`,
      read: false,
      link: "/payments",
    });
    return delay(payment);
  },
};

// -------- Progress ----------
export const progressApi = {
  overview: () => {
    const rows = enrollments.map((e) => ({
      enrollment: e,
      training: TRAININGS.find((t) => t.uuid === e.training_uuid)!,
    }));
    const overall = rows.length
      ? Math.round(rows.reduce((s, r) => s + r.enrollment.progress, 0) / rows.length)
      : 0;
    const attendance = rows.length
      ? Math.round(rows.reduce((s, r) => s + r.enrollment.attendance, 0) / rows.length)
      : 0;
    return delay({ rows, overall, attendance });
  },
};

// -------- Certificates ----------
export const certificateApi = {
  list: () => delay(CERTIFICATES),
  verify: (num: string) => delay(CERTIFICATES.find((c) => c.number === num) ?? null),
};

// -------- Notifications ----------
export const notificationApi = {
  list: () => delay([...notifications]),
  markRead: (id: string) => {
    const n = notifications.find((x) => x.uuid === id);
    if (n) n.read = true;
    return delay({ ok: true });
  },
  markAllRead: () => {
    notifications.forEach((n) => (n.read = true));
    return delay({ ok: true });
  },
};

// -------- Calendar ----------
export const calendarApi = {
  list: () => delay([...CALENDAR].sort((a, b) => a.start.localeCompare(b.start))),
  upcoming: (limit = 5) =>
    delay(
      [...CALENDAR]
        .filter((e) => new Date(e.start) >= new Date())
        .sort((a, b) => a.start.localeCompare(b.start))
        .slice(0, limit),
    ),
};

// -------- Documents ----------
export const documentApi = {
  list: (kind?: StudentDocument["kind"]) =>
    delay(kind ? DOCUMENTS.filter((d) => d.kind === kind) : [...DOCUMENTS]),
};

// -------- Support ----------
export const supportApi = {
  list: () => delay([...tickets]),
  create: (input: { subject: string; body: string }) => {
    const tk: SupportTicket = {
      uuid: uuid(), created_at: nowISO(), updated_at: nowISO(),
      deleted_at: null, is_enabled: true,
      subject: input.subject, body: input.body, status: "open",
      messages: [{ uuid: uuid(), from: "student", body: input.body, at: nowISO() }],
    };
    tickets.unshift(tk);
    return delay(tk);
  },
  reply: (id: string, body: string) => {
    const tk = tickets.find((t) => t.uuid === id);
    if (!tk) return Promise.reject(new Error("Ticket introuvable"));
    tk.messages.push({ uuid: uuid(), from: "student", body, at: nowISO() });
    tk.status = "pending";
    return delay(tk);
  },
};

// -------- Community ----------
export const communityApi = {
  list: (filter?: { training_uuid?: string; tag?: string }) => {
    let out = [...posts];
    if (filter?.training_uuid) out = out.filter((p) => p.training_uuid === filter.training_uuid);
    if (filter?.tag) out = out.filter((p) => p.tags?.includes(filter.tag!));
    return delay(out.sort((a, b) => b.created_at.localeCompare(a.created_at)));
  },
  create: (input: { title: string; body: string; training_uuid?: string; tags?: string[] }) => {
    const p: CommunityPost = {
      uuid: uuid(),
      author: `${student.first_name} ${student.last_name}`,
      author_role: "student",
      title: input.title,
      body: input.body,
      training_uuid: input.training_uuid,
      created_at: nowISO(),
      likes: 0,
      liked: false,
      replies: [],
      tags: input.tags,
    };
    posts.unshift(p);
    return delay(p);
  },
  like: (post_uuid: string) => {
    const p = posts.find((x) => x.uuid === post_uuid);
    if (!p) return Promise.reject(new Error("Post introuvable"));
    p.liked = !p.liked;
    p.likes += p.liked ? 1 : -1;
    return delay(p);
  },
  reply: (post_uuid: string, body: string) => {
    const p = posts.find((x) => x.uuid === post_uuid);
    if (!p) return Promise.reject(new Error("Post introuvable"));
    p.replies.push({
      uuid: uuid(),
      author: `${student.first_name} ${student.last_name}`,
      author_role: "student",
      body,
      at: nowISO(),
    });
    return delay(p);
  },
};

// -------- Dashboard ----------
export const dashboardApi = {
  snapshot: async (): Promise<DashboardSnapshot> => {
    const current = enrollments
      .filter((e) => ["in_progress", "waiting_payment", "confirmed", "awaiting_initial_payment"].includes(e.status))
      .map((e) => ({ ...e, training: TRAININGS.find((t) => t.uuid === e.training_uuid)! }));
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const attendance =
      enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + e.attendance, 0) / enrollments.length)
        : 0;
    const overall =
      enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
        : 0;
    const outstanding = enrollments.reduce((s, e) => s + e.amount_due, 0);
    const upcoming = [...CALENDAR]
      .filter((e) => new Date(e.start) >= new Date())
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 4);

    // Payment reminders
    const reminders: DashboardSnapshot["payment_reminders"] = [];
    for (const e of enrollments) {
      if (e.amount_due <= 0) continue;
      const t = TRAININGS.find((x) => x.uuid === e.training_uuid);
      if (!t) continue;
      const daysToEnd = Math.round((new Date(t.end_date).getTime() - Date.now()) / 86400000);
      if (daysToEnd < 0) {
        reminders.push({
          enrollment_uuid: e.uuid, training_title: t.title, training_uuid: t.uuid,
          amount_due: e.amount_due, severity: "danger",
          reason: `Formation terminée depuis ${Math.abs(daysToEnd)} j — solde à régulariser.`,
        });
      } else if (daysToEnd <= 15) {
        reminders.push({
          enrollment_uuid: e.uuid, training_title: t.title, training_uuid: t.uuid,
          amount_due: e.amount_due, severity: "warning",
          reason: `Fin de formation dans ${daysToEnd} j — solde restant à régler.`,
        });
      } else if (e.progress >= 50) {
        reminders.push({
          enrollment_uuid: e.uuid, training_title: t.title, training_uuid: t.uuid,
          amount_due: e.amount_due, severity: "info",
          reason: `Vous avez atteint ${e.progress}% — pensez à régler le solde.`,
        });
      }
    }

    const snapshot: DashboardSnapshot = {
      student,
      current_trainings: current,
      completed_trainings: completed,
      upcoming_sessions: upcoming,
      attendance_percentage: attendance,
      overall_progress: overall,
      certificates_earned: CERTIFICATES.filter((c) => c.status === "issued").length,
      outstanding_balance: outstanding,
      recent_payments: [...payments].slice(0, 4),
      recent_notifications: [...notifications].slice(0, 5),
      upcoming_deadlines: upcoming.filter(
        (e) => e.kind === "assignment" || e.kind === "exam",
      ),
      payment_reminders: reminders,
    };
    return delay(snapshot);
  },
};

// -------- Global search ----------
export const searchApi = {
  all: (q: string) => {
    const query = q.toLowerCase().trim();
    if (!query) return delay({ trainings: [], lessons: [], documents: [], payments: [], certificates: [], notifications: [] });
    return delay({
      trainings: TRAININGS.filter((t) => t.title.toLowerCase().includes(query)),
      lessons: TRAININGS.flatMap((t) =>
        t.modules.flatMap((m) =>
          m.lessons
            .filter((l) => l.title.toLowerCase().includes(query))
            .map((l) => ({ ...l, training: t })),
        ),
      ),
      documents: DOCUMENTS.filter((d) => d.name.toLowerCase().includes(query)),
      payments: payments.filter((p) => p.reference.toLowerCase().includes(query)),
      certificates: CERTIFICATES.filter((c) =>
        c.number.toLowerCase().includes(query) || c.training_title.toLowerCase().includes(query),
      ),
      notifications: notifications.filter(
        (n) => n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query),
      ),
    });
  },
};

// re-exports used by pages
export { daysFromNow };

// re-export util helpers for pages
export { hasUnlockedAccess, minAccessAmount } from "./utils";
export type { Lesson, Training, Enrollment };
