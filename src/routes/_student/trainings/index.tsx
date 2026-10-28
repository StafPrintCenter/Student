import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/site";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentTab, CatalogTab } from "@/components/pages/trainings/home";
import { SITE } from "@/data/site";

const PAGE_TITLE = `${SITE.tool} - Mes formations et le catalogue | ${SITE.name}`;
const PAGE_DESC = `Suivez vos formations en cours et découvrez les nouvelles formations disponibles chez ${SITE.name}.`;

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
          <EnrollmentTab />
        </TabsContent>
        <TabsContent value="catalog" className="mt-6">
          <CatalogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}