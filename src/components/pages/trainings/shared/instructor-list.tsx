import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { resolveStorageUrl } from "@/lib/file-url";
import { sortInstructors, trainingInstructorRoleLabels, type APITrainingInstructor } from "@/data/trainings";

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function InstructorAvatar({ name, photo }: { name: string; photo: string | null }) {
  const src = resolveStorageUrl(photo);
  if (src) {
    return <img src={src} alt={name} className="h-12 w-12 shrink-0 rounded-full border border-border object-cover" />;
  }
  return (
    <span
      aria-hidden
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
    >
      {initialsOf(name)}
    </span>
  );
}

export function InstructorList({ instructors }: { instructors: APITrainingInstructor[] }) {
  return (
    <ul className="divide-y">
      {sortInstructors(instructors).map((instructor) => (
        <li key={instructor.instructorId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <InstructorAvatar name={instructor.name} photo={instructor.photo} />
          <div className="min-w-0 space-y-1">
            <p className="font-medium">{instructor.name}</p>
            <Badge
              variant="outline"
              className={cn("text-[10px]", instructor.role === "lead" && "border-primary/40 bg-primary/10 text-primary")}
            >
              {trainingInstructorRoleLabels[instructor.role] ?? instructor.role}
            </Badge>
            {instructor.bio && (
              <p className="whitespace-pre-line pt-1 text-xs text-muted-foreground">{instructor.bio}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}