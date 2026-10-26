import { BookOpen, ClipboardList, Sparkles, Trophy, Video } from "lucide-react";

export const kindIcons: Record<string, typeof Video> = {
  video: Video,
  reading: BookOpen,
  quiz: Trophy,
  exercise: ClipboardList,
  assignment: ClipboardList,
  project: Sparkles,
};