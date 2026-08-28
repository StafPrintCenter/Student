import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Réinitialiser le mot de passe — STAF" },
      { name: "description", content: "Choisissez un nouveau mot de passe." },
      { property: "og:title", content: "Réinitialiser le mot de passe — STAF" },
      { property: "og:description", content: "Choisissez un nouveau mot de passe." },
    ],
  }),
  component: () => {
    const nav = useNavigate();
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const submit = async (e: FormEvent) => {
      e.preventDefault();
      if (p1.length < 8) return toast.error("Minimum 8 caractères.");
      if (p1 !== p2) return toast.error("Les mots de passe ne correspondent pas.");
      await new Promise((r) => setTimeout(r, 400));
      toast.success("Mot de passe mis à jour.");
      nav({ to: "/login" });
    };
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choisissez un mot de passe robuste (min. 8 caractères).
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p1">Nouveau mot de passe</Label>
              <Input id="p1" type="password" value={p1} onChange={(e) => setP1(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p2">Confirmer</Label>
              <Input id="p2" type="password" value={p2} onChange={(e) => setP2(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Mettre à jour</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    );
  },
});
