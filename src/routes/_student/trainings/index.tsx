import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/site";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyEnrollments, Catalog } from "@/components/pages/trainings/home";
import { SITE } from "@/data/site";

const PAGE_TITLE = `Mes formations - ${SITE.tool} | ${SITE.name}`;
const PAGE_DESC = `Toutes vos formations et le catalogue disponible sur ${SITE.tool} de ${SITE.name}.`;

export const Route = createFileRoute("/_student/trainings/")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainingsPage,
});

function TrainingsPage() {
  const [tab, setTab] = useState<"mine" | "catalog">("mine");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formations"
        title="Mes formations"
        description="Suivez vos inscriptions actives et découvrez de nouvelles formations."
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "catalog")}>
        <TabsList>
          <TabsTrigger value="mine">Mes inscriptions</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-6">
          <MyEnrollments />
        </TabsContent>
        <TabsContent value="catalog" className="mt-6">
          <Catalog />
        </TabsContent>
      </Tabs>
    </div>
  );
}