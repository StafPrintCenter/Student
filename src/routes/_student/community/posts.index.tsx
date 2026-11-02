import { createFileRoute } from "@tanstack/react-router";
import { CommunityBoard } from "@/components/pages/community/home";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/community/posts/")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Communauté | ${SITE.name}` },
      { name: "description", content: "Échangez avec les autres apprenants et vos formateurs." },
    ],
  }),
  component: CommunityBoard,
});