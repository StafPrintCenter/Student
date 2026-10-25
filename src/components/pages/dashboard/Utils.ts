import type { TrainingEnrollmentStatus } from "@/data/trainings";

const ACTIVE_STATUSES: TrainingEnrollmentStatus[] = ["confirmed", "in_progress"];
const NON_PAYABLE_STATUSES: TrainingEnrollmentStatus[] = ["cancelled", "expired", "waiting_list"];

/** Inscription « en cours » : confirmée ou démarrée (ni terminée, ni en liste d'attente, annulée ou expirée) */
export const isActiveEnrollment = (status: TrainingEnrollmentStatus) => ACTIVE_STATUSES.includes(status);

/** Une inscription annulée, expirée ou en liste d'attente n'appelle ni rappel ni règlement */
export const isPayableEnrollment = (status: TrainingEnrollmentStatus) => !NON_PAYABLE_STATUSES.includes(status);