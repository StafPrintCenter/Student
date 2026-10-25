import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/portal/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyEnrollments } from "@/components/portal/trainings/my-enrollments";
import { Catalog } from "@/components/portal/trainings/catalog";

export const Route = createFileRoute("/_student/trainings/")({
  head: () => ({
    meta: [
      { title: "Mes formations - STAF Student Portal" },
      { name: "description", content: "Toutes vos formations et le catalogue disponible." },
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