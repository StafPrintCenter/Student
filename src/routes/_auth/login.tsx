import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthShellContent } from "@/components/site/AuthShell";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { LoginCredentialsForm } from "@/components/pages/login/LoginCredentialsForm";
import { MfaChallengeForm } from "@/components/pages/login/MfaChallengeForm";
import type { APIStudentMfaChallenge } from "@/data/auth";
import { SITE, SITE_LINK } from "@/data/site";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({ redirectTo: z.string().optional() }),
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Connexion | ${SITE.name}` },
      {
        name: "description",
        content: `Connectez-vous à votre ${SITE.tool} ${SITE.name} pour suivre vos formations, et soumettre vos travaux.`,
      },
      { property: "og:title", content: `${SITE.tool} - Connexion | ${SITE.name}` },
      { property: "og:description", content: `Connectez-vous à votre ${SITE.tool} ${SITE.name} pour suivre vos formations.` },
    ],
  }),
  component: LoginPage,
});

function getInternalRedirect(redirectTo?: string) {
  if (!redirectTo || !redirectTo.startsWith("/")) return null;

  try {
    const url = new URL(redirectTo, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function LoginPage() {
  const { login, isAuthenticated, ready } = useStudentAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const { redirectTo } = Route.useSearch();
  const destination = getInternalRedirect(redirectTo);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<APIStudentMfaChallenge | null>(null);

  useAuthShellContent(
    challenge
      ? {
          title: "Vérification en deux étapes",
          subtitle: "Confirmez votre identité pour terminer la connexion.",
        }
      : {
          title: "Connexion étudiant",
          subtitle: "Accédez à vos formations, vos projets et votre suivi.",
          footer: (
            <span>
              Pas encore inscrit ?{" "}
              <a
                href={`${SITE_LINK.landingUrl}/trainings`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Souscrire à une formation
              </a>
            </span>
          ),
        },
  );

  // Redirection automatique si l'étudiant est déjà connecté
  useEffect(() => {
    if (ready && isAuthenticated) {
      if (destination) router.history.push(destination);
      else navigate({ to: "/dashboard" });
    }
  }, [ready, isAuthenticated, destination, navigate, router]);

  const handleLogin = async (nextEmail: string, password: string) => {
    setEmail(nextEmail);
    setLoading(true);

    try {
      const outcome = await login(nextEmail, password);
      if (outcome.status === "mfa") {
        setChallenge(outcome.challenge);
        return;
      }
      toast.success("Connexion réussie");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (challenge) {
    return (
      <MfaChallengeForm
        challenge={challenge}
        onBack={() => setChallenge(null)}
        onVerified={() => toast.success("Connexion réussie")}
      />
    );
  }

  return <LoginCredentialsForm defaultEmail={email} loading={loading} onSubmit={handleLogin} />;
}