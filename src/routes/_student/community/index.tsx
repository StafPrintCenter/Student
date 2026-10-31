import { createFileRoute } from "@tanstack/react-router";
import { CommunityBoard } from "@/components/portal/community/community-board";

export const Route = createFileRoute("/_student/community/")({
  head: () => ({
    meta: [
      { title: "Communauté - STAF Student Portal" },
      { name: "description", content: "Échangez avec les autres apprenants et vos formateurs." },
    ],
  }),
  component: CommunityBoard,
});