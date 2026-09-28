import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthShellContent } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [
      { title: `Connexion | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, ready } = useStudentAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useAuthShellContent({
    title: "Connexion étudiant",
    subtitle: "Accédez à vos formations, vos projets et votre suivi.",
    footer: (
      <span>
        Mot de passe oublié ?{" "}
        <Link to="/" className="font-medium text-foreground underline underline-offset-4">
          Réinitialiser
        </Link>
      </span>
    ),
  });

  // Redirection automatique si l'étudiant est déjà connecté
  useEffect(() => {
    if (ready && isAuthenticated) navigate({ to: "/dashboard" });
  }, [ready, isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Connexion réussie");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="etudiant@votreadresse.com"
          autoComplete="email"
          className="mt-1 bg-card"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pw">Mot de passe</Label>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="pw"
            type={showPassword ? "text" : "password"}
            className="bg-card pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="bg-card pr-10"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
}