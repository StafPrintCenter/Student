import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sortInstructors, trainingInstructorRoleLabels, type APITrainingInstructor } from "@/data/trainings";
import { UserAvatar } from "@/components/site/UserAvatar";

export function InstructorList({ instructors }: { instructors: APITrainingInstructor[] }) {
  return (
    <ul className="divide-y">
      {sortInstructors(instructors).map((instructor) => (
        <li key={instructor.instructorId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <UserAvatar
            name={instructor.name}
            photo={instructor.photo}
            className="h-12 w-12 shrink-0 border border-border"
            imageClassName="object-cover"
            fallbackClassName="bg-primary/10 text-sm font-semibold text-primary"
          />
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