import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APILessonLink } from "@/data/lesson";

interface LessonNavigationProps {
  previous: APILessonLink | null;
  next: APILessonLink | null;
  onNavigate: (lesson: APILessonLink) => void;
  onClose: () => void;
}

export function LessonNavigation({ previous, next, onNavigate, onClose }: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        disabled={!previous}
        title={previous?.title}
        onClick={() => previous && onNavigate(previous)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Précédente
      </Button>
      <Button variant="outline" size="sm" onClick={onClose}>
        Fermer
      </Button>
      <Button variant="ghost" size="sm" disabled={!next} title={next?.title} onClick={() => next && onNavigate(next)}>
        Suivante <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}