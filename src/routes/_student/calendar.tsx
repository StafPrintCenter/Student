import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Video, ClipboardList, Users, FileCheck2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { calendarApi } from "@/lib/api";
import type { CalendarEvent } from "@/lib/api/types";

export const Route = createFileRoute("/_student/calendar")({
  head: () => ({
    meta: [
      { title: "Calendrier - STAF Student Portal" },
      { name: "description", content: "Emploi du temps, examens, rendus et rendez-vous." },
      { property: "og:title", content: "Calendrier - STAF" },
      { property: "og:description", content: "Emploi du temps et échéances." },
    ],
  }),
  component: () => {
    const { data } = useQuery({ queryKey: ["calendar"], queryFn: calendarApi.list });
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    const events = data ?? [];
    const forDay = events.filter((e) => selected && isSameDay(new Date(e.start), selected));

    const iconFor = (k: CalendarEvent["kind"]) => {
      switch (k) {
        case "live": return Video;
        case "exam": return ClipboardList;
        case "assignment": return FileCheck2;
        case "appointment": return Users;
        default: return CalendarDays;
      }
    };
    const labelFor: Record<CalendarEvent["kind"], string> = {
      lesson: "Leçon", live: "Live", exam: "Examen", assignment: "Rendu", appointment: "RDV",
    };

    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Planning" title="Calendrier" description="Vue mensuelle et agenda de vos sessions et échéances." />
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <Card>
            <CardContent className="p-4">
              <CalendarUI
                mode="single"
                selected={selected}
                onSelect={setSelected}
                locale={fr}
                modifiers={{ hasEvent: events.map((e) => new Date(e.start)) }}
                modifiersClassNames={{ hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary" }}
              />
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">
                {selected ? format(selected, "EEEE d MMMM", { locale: fr }) : "-"}
              </CardTitle></CardHeader>
              <CardContent>
                {forDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun événement ce jour.</p>
                ) : (
                  <ul className="space-y-3">
                    {forDay.map((e) => {
                      const Icon = iconFor(e.kind);
                      return (
                        <li key={e.uuid} className="flex items-start gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{e.title}</p>
                            <p className="text-xs text-muted-foreground">{labelFor[e.kind]}{e.location ? ` · ${e.location}` : ""}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Agenda</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {events.map((e) => (
                    <li key={e.uuid} className="py-3 flex items-center gap-3">
                      <div className="w-16 shrink-0 text-xs text-muted-foreground">
                        {format(new Date(e.start), "d MMM", { locale: fr })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{e.location ?? "-"}</p>
                      </div>
                      <Badge variant="outline">{labelFor[e.kind]}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  },
});
