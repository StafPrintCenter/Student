import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — STAF Student Portal" },
      { name: "description", content: "Réinitialisez votre mot de passe apprenant." },
      { property: "og:title", content: "Mot de passe oublié — STAF" },
      { property: "og:description", content: "Réinitialisez votre mot de passe." },
    ],
  }),
  component: () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const submit = async (e: FormEvent) => {
      e.preventDefault();
      await new Promise((r) => setTimeout(r, 400));
      setSent(true);
      toast.success("Email de réinitialisation envoyé.");
    };
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          {sent ? (
            <div className="mt-6 rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
              Un email a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Envoyer le lien</Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    );
  },
});
