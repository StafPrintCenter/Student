import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, FileText, Receipt, GraduationCap, BadgeCheck, FileBadge } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { documentApi } from "@/lib/api";
import type { StudentDocument } from "@/lib/api/types";

const KIND_LABEL: Record<StudentDocument["kind"], string> = {
  invoice: "Factures",
  receipt: "Reçus",
  enrollment: "Inscription",
  material: "Supports",
  certificate: "Certificats",
  admin: "Administratif",
};
const KIND_ICON: Record<StudentDocument["kind"], any> = {
  invoice: Receipt,
  receipt: Receipt,
  enrollment: FileText,
  material: GraduationCap,
  certificate: BadgeCheck,
  admin: FileBadge,
};

export const Route = createFileRoute("/_student/documents")({
  head: () => ({
    meta: [
      { title: "Documents - STAF Student Portal" },
      { name: "description", content: "Factures, reçus, supports de cours et certificats." },
      { property: "og:title", content: "Documents - STAF" },
      { property: "og:description", content: "Tous vos documents disponibles au téléchargement." },
    ],
  }),
  component: () => {
    const { data } = useQuery({ queryKey: ["documents"], queryFn: () => documentApi.list() });
    const [q, setQ] = useState("");
    const [kind, setKind] = useState<string>("all");
    let items = data ?? [];
    if (kind !== "all") items = items.filter((d) => d.kind === kind);
    if (q) items = items.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Bibliothèque" title="Documents" description="Retrouvez tous vos documents administratifs et pédagogiques." />
        <div className="flex flex-wrap gap-3 items-center">
          <Tabs value={kind} onValueChange={setKind}>
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              {Object.entries(KIND_LABEL).map(([k, l]) => (
                <TabsTrigger key={k} value={k}>{l}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="max-w-xs" />
        </div>
        <Card>
          <CardContent className="p-0 divide-y">
            {items.map((d) => {
              const Icon = KIND_ICON[d.kind];
              return (
                <div key={d.uuid} className="flex items-center gap-4 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{KIND_LABEL[d.kind]} · {(d.size_kb / 1024).toFixed(2)} Mo</p>
                  </div>
                  <Button size="sm" variant="ghost"><Download className="h-4 w-4 mr-1" />Télécharger</Button>
                </div>
              );
            })}
            {items.length === 0 && <p className="p-6 text-sm text-muted-foreground">Aucun document.</p>}
          </CardContent>
        </Card>
      </div>
    );
  },
});
