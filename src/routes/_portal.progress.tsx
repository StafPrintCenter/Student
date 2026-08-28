import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LineChart, GraduationCap, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { StatCard } from "@/components/portal/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { progressApi } from "@/lib/api";

export const Route = createFileRoute("/_portal/progress")({
  head: () => ({
    meta: [
      { title: "Progression — STAF Student Portal" },
      { name: "description", content: "Suivez votre progression et vos résultats." },
      { property: "og:title", content: "Progression — STAF" },
      { property: "og:description", content: "Progression, quiz, assiduité." },
    ],
  }),
  component: () => {
    const { data, isLoading } = useQuery({ queryKey: ["progress"], queryFn: progressApi.overview });
    if (isLoading || !data) return <Skeleton className="h-96" />;
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Suivi"
          title="Ma progression"
          description="Une vue transversale sur vos leçons, quiz et assiduité."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Progression moyenne" value={`${data.overall}%`} icon={LineChart} tone="primary" />
          <StatCard label="Assiduité moyenne" value={`${data.attendance}%`} icon={GraduationCap} tone="success" />
          <StatCard label="Formations suivies" value={data.rows.length} icon={CheckCircle2} tone="info" />
        </div>
        <div className="grid gap-4">
          {data.rows.map((r) => {
            const totalLessons = r.training.modules.reduce((s, m) => s + m.lessons.length, 0);
            const done = r.training.modules.reduce((s, m) => s + m.lessons.filter(l => l.completed).length, 0);
            const scores = r.training.modules.flatMap(m => m.lessons.map(l => l.score)).filter((s): s is number => typeof s === "number");
            const avg = scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : null;
            return (
              <Card key={r.enrollment.uuid}>
                <CardHeader><CardTitle className="text-base">{r.training.title}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Avancement</span><span className="tabular-nums font-medium">{r.enrollment.progress}%</span></div>
                    <Progress value={r.enrollment.progress} className="h-2"/>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Assiduité</span><span className="tabular-nums font-medium">{r.enrollment.attendance}%</span></div>
                    <Progress value={r.enrollment.attendance} className="h-2"/>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm pt-2 border-t">
                    <div><p className="text-xs text-muted-foreground">Leçons</p><p className="font-medium">{done}/{totalLessons}</p></div>
                    <div><p className="text-xs text-muted-foreground">Restantes</p><p className="font-medium">{totalLessons - done}</p></div>
                    <div><p className="text-xs text-muted-foreground">Score moyen</p><p className="font-medium">{avg !== null ? `${avg}/100` : "—"}</p></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  },
});
