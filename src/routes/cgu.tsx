import { createFileRoute } from "@tanstack/react-router";
import { CharterPage } from "@/components/pages/cgu/CharterPage";
import { SITE } from "@/data/site";

const PAGE_TITLE = `Conditions Générales d'Utilisation ${SITE.tool} - ${SITE.name}`;
const PAGE_DESCRIPTION = `Conditions Générales d'Utilisation du portail apprenant de ${SITE.name} : accès au service, conditions financières, propriété intellectuelle, assiduité, certificats et protection des données personnelles.`;

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { property: "og:title", content: PAGE_TITLE },
      {
        property: "og:description",
        content: `Les règles d'utilisation de l'espace apprenant ${SITE.tool} de ${SITE.name}.`,
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/cgu" },
    ],
    links: [{ rel: "canonical", href: "/cgu" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Conditions Générales d'Utilisation - ${SITE.tool}`,
          description: `Règles applicables aux apprenants utilisant ${SITE.tool} de ${SITE.name}.`,
          inLanguage: "fr-BJ",
          dateModified: "2026-10-31",
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            description: `${SITE.activity}, centre de formation basé à ${SITE.city}.`,
            telephone: SITE.phone,
            email: SITE.email,
          },
        }),
      },
    ],
  }),
  component: CharterPage,
});
