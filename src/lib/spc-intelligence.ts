import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

const LABELS: [RegExp, string, string][] = [
  [
    /^\/dashboard(?:\/|$)/,
    "Tableau de bord étudiant",
    "Retrouvez vos formations et accédez à votre suivi d'apprentissage.",
  ],
  [
    /^\/trainings\/[^/]+\/session\/[^/]+(?:\/|$)/,
    "Détail d'une session de formation",
    "Consultez les informations d'une session liée à votre formation.",
  ],
  [
    /^\/trainings\/[^/]+\/catalogue(?:\/|$)/,
    "Catalogue de la formation",
    "Consultez le programme, les modules et les contenus de cette formation.",
  ],
  [
    /^\/trainings\/[^/]+\/mine(?:\/|$)/,
    "Ma formation",
    "Suivez votre inscription et votre progression dans cette formation.",
  ],
  [
    /^\/trainings(?:\/|$)/,
    "Mes formations",
    "Consultez les formations auxquelles vous êtes inscrit.",
  ],
  [
    /^\/sessions\/[^/]+(?:\/|$)/,
    "Détail d'une session",
    "Consultez les informations et la date d'une session de formation.",
  ],
  [/^\/sessions(?:\/|$)/, "Mes sessions", "Consultez les sessions prévues pour vos formations."],
  [
    /^\/community\/posts\/[^/]+(?:\/|$)/,
    "Publication de la communauté",
    "Consultez une publication et ses commentaires.",
  ],
  [
    /^\/community\/posts(?:\/|$)/,
    "Communauté",
    "Participez aux discussions, questions, ressources et annonces.",
  ],
  [/^\/progress(?:\/|$)/, "Ma progression", "Suivez votre progression dans vos formations."],
  [
    /^\/certificates(?:\/|$)/,
    "Mes certificats",
    "Consultez et téléchargez les certificats obtenus.",
  ],
  [/^\/payments(?:\/|$)/, "Mes paiements", "Consultez les paiements liés à vos formations."],
  [
    /^\/notifications\/preferences(?:\/|$)/,
    "Préférences de notifications",
    "Choisissez les notifications à recevoir au sujet de vos formations.",
  ],
  [
    /^\/notifications\/[^/]+(?:\/|$)/,
    "Détail d'une notification",
    "Consultez une notification liée à votre espace étudiant.",
  ],
  [
    /^\/notifications(?:\/|$)/,
    "Mes notifications",
    "Consultez les notifications liées à vos formations et vos sessions.",
  ],
  [
    /^\/security\/mfa(?:\/|$)/,
    "Sécurité du compte",
    "Gérez la double authentification, les méthodes de connexion et les codes de secours.",
  ],
  [
    /^\/security\/sessions(?:\/|$)/,
    "Sessions actives",
    "Consultez et fermez les sessions ouvertes sur votre compte.",
  ],
  [
    /^\/health(?:\/|$)/,
    "Santé du compte",
    "Consultez le score de sécurité et de profil ainsi que les recommandations pour l'améliorer.",
  ],
  [
    /^\/profile(?:\/|$)/,
    "Mon profil étudiant",
    "Consultez et gérez les informations de votre compte.",
  ],
  [
    /^\/cgu(?:\/|$)/,
    "Charte et conditions d'utilisation",
    "Consultez les règles applicables aux apprenants utilisant la plateforme.",
  ],
  [/^\/login(?:\/|$)/, "Connexion étudiant", "Connectez-vous à votre espace étudiant."],
  [
    /^\/invite(?:\/|$)/,
    "Activation du compte étudiant",
    "Finalisez l'activation de votre compte à partir de votre invitation.",
  ],
  [
    /^\/forgot-password(?:\/|$)/,
    "Mot de passe oublié",
    "Demandez un lien pour réinitialiser votre mot de passe.",
  ],
  [
    /^\/reset-password(?:\/|$)/,
    "Nouveau mot de passe",
    "Choisissez un nouveau mot de passe pour votre compte étudiant.",
  ],
];

/** Pushes the current screen (no personal data) to SPC Intelligence. */
export function useSpcPageContext() {
  const pathname = useLocation({ select: (l) => l.pathname });
  useEffect(() => {
    const m = LABELS.find(([re]) => re.test(pathname));
    const title = m?.[1] ?? "Espace Étudiant STAF PRINT CENTER";
    const text = m?.[2] ?? "Consultez et gérez votre espace étudiant STAF PRINT CENTER.";
    const apply = () => window.SPCIntelligence?.setContext(() => ({ title, text }));
    apply();
    const t = window.setTimeout(apply, 1500); // widget loads async
    return () => window.clearTimeout(t);
  }, [pathname]);
}

export function askSpc(prompt: string) {
  window.SPCIntelligence?.open(prompt);
}
