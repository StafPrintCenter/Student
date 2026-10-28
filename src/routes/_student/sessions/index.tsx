import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/site";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionsListItem, SessionsCalendar } from "@/components/pages/sessions/home";
import { } from "@/components/pages/sessions/home/ListItem";

export const Route = createFileRoute("/_student/sessions/")({
  head: () => ({
    meta: [
      { title: "Mes sessions - STAF Student Portal" },
      { name: "description", content: "Vos sessions de formation, en liste ou dans le calendrier." },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const [tab, setTab] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Session"
        title="Mes sessions"
        description="Consultez vos sessions de formation et confirmez votre présence."
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "list" | "calendar")}>
        <TabsList>
          <TabsTrigger value="list">Vue liste</TabsTrigger>
          <TabsTrigger value="calendar">Vue calendrier</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <SessionsListItem />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <SessionsCalendar onShowList={() => setTab("list")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}