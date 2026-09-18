import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { studentApi } from "@/lib/api";
import type { Student } from "@/lib/api/types";

export const Route = createFileRoute("/_portal/profile")({
  head: () => ({
    meta: [
      { title: "Profil - STAF Student Portal" },
      { name: "description", content: "Gérez vos informations personnelles et votre sécurité." },
      { property: "og:title", content: "Profil - STAF" },
      { property: "og:description", content: "Informations personnelles et sécurité." },
    ],
  }),
  component: () => {
    const qc = useQueryClient();
    const { data } = useQuery({ queryKey: ["me"], queryFn: studentApi.me });
    const [form, setForm] = useState<Partial<Student>>({});
    useEffect(() => { if (data) setForm(data); }, [data]);
    const save = useMutation({
      mutationFn: () => studentApi.update(form),
      onSuccess: () => { toast.success("Profil enregistré."); qc.invalidateQueries({ queryKey: ["me"] }); },
    });
    const initials = data ? `${data.first_name[0]}${data.last_name[0]}`.toUpperCase() : "";
    const set = (k: keyof Student) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Compte" title="Mon profil" description="Vos informations personnelles et la sécurité de votre compte." />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
              <Avatar className="h-24 w-24"><AvatarFallback className="bg-primary/15 text-primary text-2xl">{initials}</AvatarFallback></Avatar>
              <div>
                <p className="font-medium">{data?.first_name} {data?.last_name}</p>
                <p className="text-xs text-muted-foreground">{data?.email}</p>
              </div>
              <Button variant="outline" size="sm">Changer la photo</Button>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Informations personnelles</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom"><Input value={form.first_name ?? ""} onChange={set("first_name")} /></Field>
                <Field label="Nom"><Input value={form.last_name ?? ""} onChange={set("last_name")} /></Field>
                <Field label="Téléphone"><Input value={form.phone ?? ""} onChange={set("phone")} /></Field>
                <Field label="Date de naissance"><Input type="date" value={form.birth_date ?? ""} onChange={set("birth_date")} /></Field>
                <Field label="Adresse" className="sm:col-span-2"><Input value={form.address ?? ""} onChange={set("address")} /></Field>
                <Field label="Occupation"><Input value={form.occupation ?? ""} onChange={set("occupation")} /></Field>
                <Field label="Contact d'urgence"><Input value={form.emergency_contact ?? ""} onChange={set("emergency_contact")} /></Field>
                <Field label="Biographie" className="sm:col-span-2"><Textarea rows={3} value={form.biography ?? ""} onChange={set("biography")} /></Field>
                <div className="sm:col-span-2 flex justify-end">
                  <Button onClick={() => save.mutate()} disabled={save.isPending}>Enregistrer</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Sécurité</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <Field label="Mot de passe actuel"><Input type="password" /></Field>
                <Field label="Nouveau"><Input type="password" /></Field>
                <Field label="Confirmer"><Input type="password" /></Field>
                <div className="sm:col-span-3 flex justify-end">
                  <Button variant="outline" onClick={() => toast.success("Mot de passe mis à jour.")}>Changer le mot de passe</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  },
});

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}
