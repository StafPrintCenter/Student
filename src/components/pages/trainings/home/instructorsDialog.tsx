import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstructorList } from "@/components/pages/trainings/shared/instructor-list";
import type { APITrainingInstructor } from "@/data/trainings";

interface InstructorsDialogProps {
  instructors: APITrainingInstructor[];
  trainingTitle?: string;
  onClose: () => void;
}

export function InstructorsDialog({ instructors, trainingTitle, onClose }: InstructorsDialogProps) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{instructors.length > 1 ? "Formateurs" : "Formateur"}</DialogTitle>
          {trainingTitle && <DialogDescription>{trainingTitle}</DialogDescription>}
        </DialogHeader>
        <InstructorList instructors={instructors} />
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
}