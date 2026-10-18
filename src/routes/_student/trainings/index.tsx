import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap, Users, MapPin, Clock, ArrowRight, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/portal/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStudentTrainingsList, useTrainingsCatalog, useSubscribeToTraining } from "@/stores/useTrainingsStore";
import { trainingEnrollmentStatusMap, trainingPaymentStatusMap, type APIPublicTrainingCatalogItem } from "@/data/trainings";

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} FCFA`;
}

function StatusBadge({ status, map }: {
  status: string;
  map: Record<string, { label: string; className: string }>;
}) {
  const config = map[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

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