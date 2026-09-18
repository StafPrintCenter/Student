import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Printer, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — STAF Student Portal" },
      { name: "description", content: "Accédez à votre espace apprenant STAF Print Center." },
      { property: "og:title", content: "Connexion — STAF Student Portal" },
      { property: "og:description", content: "Votre espace apprenant sécurisé." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("amina.adjovi@staf.bj");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bienvenue !");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left — brand */}
      <div className="relative hidden md:flex flex-col justify-between p-10 bg-linear-to-br from-primary/15 via-background to-chart-5/10 border-r border-border">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-primary to-chart-4 text-primary-foreground">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-lg leading-none">STAF Print Center</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Student Portal — Cotonou
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Studio créatif & centre de formation
          </p>
          <h1 className="font-display text-4xl leading-tight">
            L'atelier où votre carrière créative prend forme.
          </h1>
          <p className="text-sm text-muted-foreground">
            Inscrivez-vous à nos formations, suivez votre progression, gérez vos paiements et
            téléchargez vos certificats — depuis un espace unique, pensé pour vous.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} STAF Print Center — Tous droits réservés</div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display text-3xl">Connexion</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ravi de vous revoir. Reprenez là où vous vous étiez arrêté(e).
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Se connecter <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nouveau compte ?{" "}
            <Link to="/activate" className="text-primary hover:underline">
              Activer une invitation
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Démo : n'importe quels identifiants fonctionnent.
          </p>
        </div>
      </div>
    </div>
  );
}
