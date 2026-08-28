import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Activer votre compte — STAF" },
      { name: "description", content: "Activez votre invitation apprenant STAF Print Center." },
      { property: "og:title", content: "Activer votre compte — STAF" },
      { property: "og:description", content: "Activez votre invitation." },
    ],
  }),
  component: () => {
    const { activate } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [tempCode, setTempCode] = useState("");
    const [password, setPassword] = useState("");
    const submit = async (e: FormEvent) => {
      e.preventDefault();
      try {
        await activate(email, password);
        toast.success("Compte activé, bienvenue !");
        nav({ to: "/dashboard" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    };
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl">Activer votre compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Utilisez le lien reçu par email et le mot de passe temporaire fourni par
            l'administration.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code temporaire</Label>
              <Input id="code" value={tempCode} onChange={(e) => setTempCode(e.target.value)} placeholder="Ex. TMP-1234" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Choisir un mot de passe</Label>
              <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Activer & continuer</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    );
  },
});
