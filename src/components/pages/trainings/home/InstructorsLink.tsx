import { useState } from "react";
import { UserRound } from "lucide-react";
import { InstructorsDialog } from "./InstructorsDialog";
import { summarizeInstructors, type APITrainingInstructor } from "@/data/trainings";

/** Nom du formateur (+ n autres) ; au clic, ouvre le modal avec tous les formateurs */
export function InstructorsLink({
  instructors,
  trainingTitle,
}: {
  instructors: APITrainingInstructor[];
  trainingTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const summary = summarizeInstructors(instructors);

  if (!summary) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <UserRound className="h-3.5 w-3.5 shrink-0" /> Formateur non assigné
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Voir les formateurs"
        className="flex max-w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
      >
        <UserRound className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{summary}</span>
      </button>
      {open && (
        <InstructorsDialog instructors={instructors} trainingTitle={trainingTitle} onClose={() => setOpen(false)} />
      )}
    </>
  );
}