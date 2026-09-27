import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Download, Eye, ShieldCheck, Award } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CertificateBadge } from "@/components/portal/status-badges";
import { EmptyState } from "@/components/portal/empty-state";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { certificateApi } from "@/lib/api";
import type { Certificate } from "@/lib/api/types";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/certificates")({
  head: () => ({
    meta: [
      { title: "Certificats - STAF Student Portal" },
      { name: "description", content: "Vos certificats obtenus et vérification en ligne." },
      { property: "og:title", content: "Certificats - STAF" },
      { property: "og:description", content: "Téléchargez et vérifiez vos certificats." },
    ],
  }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const { data } = useQuery({ queryKey: ["certs"], queryFn: certificateApi.list });
  const [verify, setVerify] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<Certificate | null>(null);

  const doVerify = async () => {
    const r = await certificateApi.verify(verify);
    setResult(
      r
        ? `Valide : ${r.training_title} - délivré le ${format(new Date(r.issued_at!), "d MMM yyyy", { locale: fr })}`
        : "Certificat introuvable.",
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reconnaissance" title="Certificats" description={`Vos diplômes délivrés par ${SITE.name}.`} />
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((c) => {
          const canOpen = c.status === "issued" || c.status === "downloaded";
          return (
            <Card key={c.uuid}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <CertificateBadge status={c.status} />
                </div>
                <div>
                  <p className="font-medium">{c.training_title}</p>
                  {c.number && <p className="text-xs text-muted-foreground font-mono">{c.number}</p>}
                  {c.issued_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Délivré le {format(new Date(c.issued_at), "d MMMM yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={!canOpen} onClick={() => setPreview(c)}>
                    <Eye className="h-4 w-4 mr-1.5" /> Voir
                  </Button>
                  <Button size="sm" disabled={!canOpen} onClick={() => toast.success("Téléchargement démarré.")}>
                    <Download className="h-4 w-4 mr-1.5" /> Télécharger PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!data || data.length === 0) && (
          <EmptyState icon={BadgeCheck} title="Aucun certificat pour l'instant" description="Terminez une formation pour obtenir votre certificat." />
        )}
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <p className="font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Vérifier un certificat</p>
          <div className="flex gap-2 max-w-md">
            <Input placeholder="Numéro de certificat (ex. STAF-2025-…)" value={verify} onChange={(e) => setVerify(e.target.value)} />
            <Button onClick={doVerify}>Vérifier</Button>
          </div>
          {result && <p className="text-sm text-muted-foreground">{result}</p>}
        </CardContent>
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificat</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="rounded-xl border-2 border-primary/20 bg-linear-to-br from-background via-muted/30 to-primary/5 p-8 md:p-10 text-center space-y-5">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                <Award className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {SITE.name} - Cotonou
                </p>
                <h2 className="font-display text-2xl md:text-3xl">Certificat de réussite</h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Décerné à</p>
                <p className="font-display text-xl">Amina Adjovi</p>
                <p className="text-sm text-muted-foreground">Pour avoir complété avec succès la formation</p>
                <p className="font-medium">{preview.training_title}</p>
              </div>
              <div className="flex justify-center gap-6 pt-4 text-xs text-muted-foreground">
                {preview.issued_at && (
                  <div>
                    <p className="uppercase tracking-wider">Délivré le</p>
                    <p className="text-foreground font-medium mt-0.5">
                      {format(new Date(preview.issued_at), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="uppercase tracking-wider">N° certificat</p>
                  <p className="text-foreground font-mono mt-0.5">{preview.number}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)}>Fermer</Button>
            <Button onClick={() => toast.success("Téléchargement démarré.")}>
              <Download className="h-4 w-4 mr-1.5" /> Télécharger PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
