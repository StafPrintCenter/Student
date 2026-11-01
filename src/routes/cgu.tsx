import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ScrollText, AlertTriangle, GraduationCap, ShieldCheck, Handshake, Award, Database, Mail, ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SITE } from "@/data/site";

const PAGE_TITLE = `${SITE.tool} - Conditions Générales d'Utilisation | ${SITE.name}`
const PAGE_DESC = `CGU de la plateforme d'apprentissage ${SITE.name} : accès au service, conditions financières (acompte de 25 %), propriété intellectuelle, assiduité, certificats et données personnelles (APDP).}`

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions Générales d'Utilisation — STAF Print Center" },
      {
        name: "description",
        content:
          "CGU de la plateforme d'apprentissage STAF Print Center : accès au service, conditions financières (acompte de 25 %), propriété intellectuelle, assiduité, certificats et données personnelles (APDP).",
      },
      { property: "og:title", content: "Conditions Générales d'Utilisation — STAF Print Center" },
      {
        property: "og:description",
        content:
          "Les règles qui encadrent votre compte, vos paiements, vos formations, vos certificats et vos données sur le portail apprenant STAF Print Center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

interface Article {
  id: string;
  icon: LucideIcon;
  title: string;
  intro: string;
  blocks: { heading?: string; items?: string[]; text?: string }[];
}

const UPDATED = "31 octobre 2026";

const ARTICLES: Article[] = [
  {
    id: "objet",
    icon: ScrollText,
    title: "Article 1 — Objet et accès au service",
    intro:
      "Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») encadrent l'accès et l'utilisation de la plateforme d'apprentissage en ligne de STAF PRINT CENTER, studio créatif et centre de formation situé à Cotonou (Bénin).",
    blocks: [
      {
        heading: "Objet de la plateforme",
        text: "Le portail apprenant donne accès, dans un espace unique et sécurisé, aux formations suivies, aux contenus pédagogiques (vidéos, modules, leçons), aux exercices et quiz, aux échanges avec les formateurs, à l'espace communautaire, au suivi de progression, au règlement des frais de formation et au téléchargement des certificats.",
      },
      {
        heading: "Compte strictement personnel",
        text: "Les identifiants de connexion (adresse email et mot de passe) sont strictement personnels et confidentiels. Le compte ne peut être ni partagé, ni prêté, ni cédé à un tiers, sous peine de suspension ou de résiliation immédiate, sans préjudice des dommages éventuellement dus.",
      },
      {
        heading: "Sécurité du compte",
        items: [
          "L'apprenant s'engage à conserver son mot de passe secret et à ne pas le communiquer à quiconque, y compris au personnel de STAF PRINT CENTER.",
          "Toute connexion suspecte, perte ou vol d'identifiants doit être signalée sans délai au support de la plateforme.",
          "STAF PRINT CENTER se réserve le droit de suspendre temporairement un compte en cas d'activité anormale ou d'intrusion suspectée, afin de protéger les données de l'apprenant.",
        ],
      },
      {
        heading: "Disponibilité du service",
        text: "Des opérations de maintenance peuvent entraîner une interruption temporaire, notamment de l'accès aux vidéos, aux quiz et aux paiements en ligne. Les échéances de paiement et les quiz programmés ne sont pas décalés de fait : en cas d'interruption ayant empêché une action requise, l'apprenant est invité à contacter le support, qui rétablit la situation.",
      },
    ],
  },
  {
    id: "financieres",
    icon: Handshake,
    title: "Article 2 — Inscription et conditions financières",
    intro:
      "L'inscription à une formation et l'accès à son contenu intégral sont encadrés par des règles financières précises, rappelées à chaque étape dans le portail.",
    blocks: [
      {
        heading: "Acompte minimum d'ouverture d'accès",
        text: "L'inscription crée un dossier en attente de règlement initial. Le contenu pédagogique complet d'une formation — modules, leçons, exercices, quiz et travaux soumis au formateur — n'est débloqué qu'après paiement d'un acompte égal au minimum à 25 % (un quart) du prix total de la formation. Avant ce seuil, seul le résumé du programme (objectifs, prérequis, formateur assigné) reste consultable.",
      },
      {
        heading: "Solde et échéancier",
        text: "Le solde restant est réglé selon l'échéancier convenu avec l'administration, consultable à tout moment dans l'espace « Paiements » du portail (montant déjà payé, montant restant, prochaine échéance). Tout paiement partiel est imputé au solde du dossier concerné.",
      },
      {
        heading: "Suspension pour impayé",
        items: [
          "En cas d'échéance non honorée, un rappel est adressé à l'apprenant via ses notifications.",
          "À défaut de régularisation, l'accès aux contenus de la formation concernée peut être suspendu jusqu'au règlement : les travaux déjà soumis et les progressions sont conservés et réapparaissent dès la reprise du paiement.",
          "La suspension pour impayé ne dégage pas l'apprenant de sa dette et n'ouvre droit à aucun remboursement des sommes déjà versées au titre de la formation suspendue.",
        ],
      },
      {
        heading: "Remboursement et abandon",
        text: "Une demande d'abandon adressée au support avant le débloquage du contenu de la formation ouvre droit au remboursement des sommes versées, hors frais éventuels précisés à l'inscription. Après débloquage du contenu, aucun remboursement n'est acquis : les acomptes et échéances déjà réglées couvrent l'accès effectivement ouvert. La réinscription à une session ultérieure reste possible selon les places disponibles.",
      },
    ],
  },
  {
    id: "propriete",
    icon: ShieldCheck,
    title: "Article 3 — Propriété intellectuelle",
    intro:
      "L'ensemble des contenus diffusés sur la plateforme est la propriété exclusive de STAF PRINT CENTER et est protégé par le droit d'auteur béninois et les conventions internationales applicables.",
    blocks: [
      {
        heading: "Contenus protégés",
        text: "Sont notamment protégés : les programmes et supports de formation, les vidéos et chapitrages, les fichiers créatifs et sources, les énoncés d'exercices, les banques de questions des quiz, les grilles d'évaluation et les retours rédigés par les formateurs.",
      },
      {
        heading: "Usages interdits",
        items: [
          "Reproduction, enregistrement ou capture d'écran des vidéos, leçons et quiz, par quelque moyen que ce soit.",
          "Diffusion, partage, revente, mise en ligne ou transmission des contenus à un tiers, même gratuit, même partiellement.",
          "Utilisation des contenus pour former un public tiers, animer une session concurrente ou constituer un support de formation parallèle.",
          "Extraction, réutilisation ou contournement du portail pour accéder aux contenus hors de l'application.",
        ],
      },
      {
        heading: "Licence d'usage",
        text: "L'accès au contenu est concédé à titre personnel, non exclusif et non transférable, pour la durée de l'inscription, aux seules fins d'apprentissage individuel. Toute autre utilisation requiert l'autorisation écrite préalable de STAF PRINT CENTER.",
      },
    ],
  },
  {
    id: "engagements",
    icon: GraduationCap,
    title: "Article 4 — Engagements et assiduité de l'apprenant",
    intro:
      "La qualité de l'apprentissage repose sur l'engagement de chacun. En utilisant la plateforme, l'apprenant s'engage aux règles suivantes.",
    blocks: [
      {
        heading: "Assiduité et participation",
        text: "L'apprenant suit les modules et leçons dans l'ordre du programme, réalise les exercices et quiz dans les délais communiqués, et participe aux sessions prévues au calendrier. Une assiduité régulière conditionne la validation de la formation (article 5).",
      },
      {
        heading: "Intégrité académique",
        items: [
          "Le plagiat est interdit : tout travail soumis au formateur doit être le fruit de l'apprenant lui-même.",
          "Il est interdit de faire réaliser ses exercices, quiz ou travaux par un tiers, et de recourir à l'usurpation d'identité ou à toute aide non autorisée lors d'un quiz chronométré.",
          "Le partage de questions, réponses ou captures de quiz avec d'autres apprenants, avant ou après l'épreuve, est prohibé.",
        ],
      },
      {
        heading: "Courtoisie dans les espaces communautaires",
        text: "L'espace communautaire est un lieu d'entraide : les échanges (publications, commentaires, réponses) doivent rester respectueux et constructifs. Sont exclus : propos injurieux ou discriminatoires, harcèlement, publicité non sollicitée, diffusion de contenus illégaux ou de liens malveillants. Tout manquement expose le message à sa suppression et le compte à une suspension temporaire ou définitive des espaces communautaires.",
      },
      {
        heading: "Respect du règlement intérieur",
        text: "Les présentations présencielles et les échanges avec l'équipe se font dans le respect du règlement intérieur de STAF PRINT CENTER et des personnes. L'apprenant s'engage à fournir des informations exactes lors de son inscription et à tenir son profil à jour.",
      },
    ],
  },
  {
    id: "certificats",
    icon: Award,
    title: "Article 5 — Délivrance des certificats",
    intro:
      "Le certificat de fin de formation atteste que l'apprenant a atteint les objectifs pédagogiques du programme suivi.",
    blocks: [
      {
        heading: "Conditions de réussite pédagogique",
        items: [
          "Complétion de l'ensemble des modules et leçons de la formation.",
          "Validation des exercices et travaux par le formateur assigné.",
          "Score officiel au moins égal au seuil de réussite des quiz de la formation, la meilleure tentative étant retenue.",
        ],
      },
      {
        heading: "Condition financière",
        text: "Le certificat n'est délivré qu'après règlement intégral du solde de la formation. Un dossier dont le solde n'est pas soldé reste consultable, mais le téléchargement du certificat est bloqué jusqu'à l'apurement complet de la dette.",
      },
      {
        heading: "Remise et validité",
        text: "Le certificat est émis au nom de l'apprenant, au format électronique, téléchargeable depuis l'espace « Certificats » du portail. Il mentionne la formation suivie et les compétences validées. Toute falsification ou altération du certificat est interdite et expose son auteur aux poursuites prévues par la loi.",
      },
    ],
  },
  {
    id: "donnees",
    icon: Database,
    title: "Article 6 — Données personnelles et droit à l'image",
    intro:
      "STAF PRINT CENTER traite les données des apprenants dans le respect de la réglementation béninoise applicable en matière de protection des données à caractère personnel, sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP).",
    blocks: [
      {
        heading: "Données collectées et finalités",
        text: "Sont traitées : les données d'identification et de contact (nom, prénom, email, téléphone), les données de suivi pédagogique (progression, tentatives de quiz, travaux soumis, retours de formateur), les données administratives et financières (inscriptions, factures, paiements), ainsi que l'historique de connexion nécessaire à la sécurité du compte. Ces données servent exclusivement à la gestion de la formation, du suivi pédagogique, de la facturation et de la communication relative au service.",
      },
      {
        heading: "Droits de l'apprenant",
        text: "L'apprenant dispose d'un droit d'accès, de rectification, et peut demander l'exercice de ses autres droits auprès du responsable de traitement via le support de la plateforme ou l'adresse de contact indiquée à l'article 7. Les données de suivi pédagogique sont conservées pendant la durée de la relation d'inscription puis archivées selon les durées légales applicables.",
      },
      {
        heading: "Témoignages et publications de travaux",
        text: "Les témoignages, avis et réalisations (projets, exercices, travaux créatifs) produits par l'apprenant ne sont publiés — sur la plateforme, les réseaux sociaux de STAF PRINT CENTER ou tout support de communication — qu'avec son accord exprès, recueilli au préalable. L'apprenant peut retirer son accord à tout moment : les publications concernées sont retirées dans un délai raisonnable, sans effet rétroactif sur les supports déjà imprimés ou diffusés.",
      },
      {
        heading: "Droit à l'image",
        items: [
          "Les photographies et captations réalisées lors des sessions, ateliers et cérémonies de remise de certificats ne sont exploitées qu'avec l'autorisation des personnes concernées.",
          "L'apprenant peut refuser ou retirer cette autorisation en contactant le support, sans que cela n'affecte son accès aux formations.",
          "Les mineurs ne sont photographiés ou diffusés qu'avec l'autorisation de leur représentant légal.",
        ],
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Article 7 — Réclamations et contact",
    intro:
      "Toute question, réclamation ou demande relative aux présentes CGU peut être adressée via l'espace « Support » du portail ou aux coordonnées de STAF PRINT CENTER à Cotonou (Bénin).",
    blocks: [
      {
        heading: "Traitement des réclamations",
        text: "Les réclamations sont examinées par l'administration de STAF PRINT CENTER, qui répond à l'apprenant dans un délai raisonnable. En cas de désaccord persistant, l'apprenant peut également saisir l'Autorité de Protection des Données Personnelles (APDP) pour toute question relative à ses données.",
      },
      {
        heading: "Évolution des CGU",
        text: "STAF PRINT CENTER peut faire évoluer les présentes CGU pour tenir compte de l'évolution du service ou de la réglementation. La version applicable est celle en vigueur à la date d'utilisation de la plateforme ; les modifications importantes font l'objet d'une notification via les notifications du portail.",
      },
    ],
  },
];

function ArticleBlock({ article }: { article: Article }) {
  const Icon = article.icon;
  return (
    <section
      id={article.id}
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-xl md:text-2xl leading-snug text-foreground">
          {article.title}
        </h2>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{article.intro}</p>

      <div className="mt-5 space-y-5">
        {article.blocks.map((block, i) => (
          <div key={i}>
            {block.heading && (
              <h3 className="text-sm font-semibold text-foreground">{block.heading}</h3>
            )}
            {block.text && (
              <p className={`text-sm leading-relaxed text-muted-foreground ${block.heading ? "mt-1.5" : ""}`}>
                {block.text}
              </p>
            )}
            {block.items && (
              <ul className={`space-y-2 ${block.heading ? "mt-2" : ""}`}>
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TermsPage() {
  return (
    <div className="min-h-screen bg-background grain-bg">
      <header className="border-b border-border bg-background/85 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-chart-4 text-primary-foreground">
              <Printer className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base">STAF Print Center</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Student Portal — Cotonou
              </div>
            </div>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Portail apprenant
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl leading-tight text-foreground">
            Conditions Générales d'Utilisation
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Les présentes CGU encadrent l'utilisation du portail d'apprentissage de STAF PRINT
            CENTER par ses apprenants : accès au service, conditions financières, propriété
            intellectuelle, assiduité, certificats et protection des données personnelles.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-primary" />
            Dernière mise à jour : {UPDATED}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
          <nav aria-label="Sommaire" className="lg:sticky lg:top-24 lg:w-64 lg:shrink-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Sommaire
            </p>
            <ol className="mt-3 space-y-1">
              {ARTICLES.map((a) => (
                <li key={a.id}>
                  <a
                    href={`#${a.id}`}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {a.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 flex-1 space-y-6">
            {ARTICLES.map((a) => (
              <ArticleBlock key={a.id} article={a} />
            ))}
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} STAF PRINT CENTER — Tous droits réservés.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
