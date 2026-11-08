import { SITE } from "@/data/site";
import type { LegalSection } from "@/components/site";

const list = (...items: string[]) => items.join(" • ");

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: "objet",
    title: "Article 1 - Objet et accès au service",
    summary: "Le compte apprenant donne un accès personnel et sécurisé aux services du portail.",
    intro: `Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») encadrent l'accès et l'utilisation de la plateforme d'apprentissage en ligne de ${SITE.name}, studio créatif et centre de formation situé à Cotonou (Bénin).`,
    clauses: [
      {
        label: "Objet de la plateforme",
        text: "Le portail apprenant donne accès, dans un espace unique et sécurisé, aux formations suivies, aux contenus pédagogiques (vidéos, modules, leçons), aux exercices et quiz, aux échanges avec les formateurs, à l'espace communautaire, au suivi de progression, au règlement des frais de formation et au téléchargement des certificats.",
      },
      {
        label: "Compte strictement personnel",
        text: "Les identifiants de connexion (adresse email et mot de passe) sont strictement personnels et confidentiels. Le compte ne peut être ni partagé, ni prêté, ni cédé à un tiers, sous peine de suspension ou de résiliation immédiate, sans préjudice des dommages éventuellement dus.",
      },
      {
        label: "Sécurité du compte",
        text: list(
          "L'apprenant s'engage à conserver son mot de passe secret et à ne pas le communiquer à quiconque, y compris au personnel de STAF PRINT CENTER.",
          "Toute connexion suspecte, perte ou vol d'identifiants doit être signalé sans délai au support de la plateforme.",
          "STAF PRINT CENTER se réserve le droit de suspendre temporairement un compte en cas d'activité anormale ou d'intrusion suspectée, afin de protéger les données de l'apprenant.",
        ),
      },
      {
        label: "Disponibilité du service",
        text: "Des opérations de maintenance peuvent entraîner une interruption temporaire, notamment de l'accès aux vidéos, aux quiz et aux paiements en ligne. Les échéances de paiement et les quiz programmés ne sont pas décalés de fait : en cas d'interruption ayant empêché une action requise, l'apprenant est invité à contacter le support, qui rétablit la situation.",
      },
    ],
  },
  {
    id: "financieres",
    title: "Article 2 - Inscription et conditions financières",
    summary: "L'accès complet à une formation s'ouvre après le paiement de l'acompte requis.",
    intro:
      "L'inscription à une formation et l'accès à son contenu intégral sont encadrés par des règles financières précises, rappelées à chaque étape dans le portail.",
    clauses: [
      {
        label: "Acompte minimum d'ouverture d'accès",
        text: "L'inscription crée un dossier en attente de règlement initial. Le contenu pédagogique complet d'une formation - modules, leçons, exercices, quiz et travaux soumis au formateur - n'est débloqué qu'après paiement d'un acompte égal au minimum à 25 % (un quart) du prix total de la formation. Avant ce seuil, seul le résumé du programme (objectifs, prérequis, formateur assigné) reste consultable.",
      },
      {
        label: "Solde et échéancier",
        text: "Le solde restant est réglé selon l'échéancier convenu avec l'administration, consultable à tout moment dans l'espace « Paiements » du portail (montant déjà payé, montant restant, prochaine échéance). Tout paiement partiel est imputé au solde du dossier concerné.",
      },
      {
        label: "Suspension pour impayé",
        text: list(
          "En cas d'échéance non honorée, un rappel est adressé à l'apprenant via ses notifications.",
          "À défaut de régularisation, l'accès aux contenus de la formation concernée peut être suspendu jusqu'au règlement : les travaux déjà soumis et les progressions sont conservés et réapparaissent dès la reprise du paiement.",
          "La suspension pour impayé ne dégage pas l'apprenant de sa dette et n'ouvre droit à aucun remboursement des sommes déjà versées au titre de la formation suspendue.",
        ),
      },
      {
        label: "Remboursement et abandon",
        text: "Une demande d'abandon adressée au support avant le débloquage du contenu de la formation ouvre droit au remboursement des sommes versées, hors frais éventuels précisés à l'inscription. Après débloquage du contenu, aucun remboursement n'est acquis : les acomptes et échéances déjà réglées couvrent l'accès effectivement ouvert. La réinscription à une session ultérieure reste possible selon les places disponibles.",
      },
    ],
  },
  {
    id: "propriete",
    title: "Article 3 - Propriété intellectuelle",
    summary: "Les contenus de formation sont protégés et réservés à l'apprentissage individuel.",
    intro:
      "L'ensemble des contenus diffusés sur la plateforme est la propriété exclusive de STAF PRINT CENTER et est protégé par le droit d'auteur béninois et les conventions internationales applicables.",
    clauses: [
      {
        label: "Contenus protégés",
        text: "Sont notamment protégés : les programmes et supports de formation, les vidéos et chapitrages, les fichiers créatifs et sources, les énoncés d'exercices, les banques de questions des quiz, les grilles d'évaluation et les retours rédigés par les formateurs.",
      },
      {
        label: "Usages interdits",
        text: list(
          "Reproduction, enregistrement ou capture d'écran des vidéos, leçons et quiz, par quelque moyen que ce soit.",
          "Diffusion, partage, revente, mise en ligne ou transmission des contenus à un tiers, même gratuit, même partiellement.",
          "Utilisation des contenus pour former un public tiers, animer une session concurrente ou constituer un support de formation parallèle.",
          "Extraction, réutilisation ou contournement du portail pour accéder aux contenus hors de l'application.",
        ),
      },
      {
        label: "Licence d'usage",
        text: "L'accès au contenu est concédé à titre personnel, non exclusif et non transférable, pour la durée de l'inscription, aux seules fins d'apprentissage individuel. Toute autre utilisation requiert l'autorisation écrite préalable de STAF PRINT CENTER.",
      },
    ],
  },
  {
    id: "engagements",
    title: "Article 4 - Engagements et assiduité de l'apprenant",
    summary: "Assiduité, intégrité académique et respect des autres apprenants sont attendus.",
    intro:
      "La qualité de l'apprentissage repose sur l'engagement de chacun. En utilisant la plateforme, l'apprenant s'engage aux règles suivantes.",
    clauses: [
      {
        label: "Assiduité et participation",
        text: "L'apprenant suit les modules et leçons dans l'ordre du programme, réalise les exercices et quiz dans les délais communiqués, et participe aux sessions prévues au calendrier. Une assiduité régulière conditionne la validation de la formation (article 5).",
      },
      {
        label: "Intégrité académique",
        text: list(
          "Le plagiat est interdit : tout travail soumis au formateur doit être le fruit de l'apprenant lui-même.",
          "Il est interdit de faire réaliser ses exercices, quiz ou travaux par un tiers, et de recourir à l'usurpation d'identité ou à toute aide non autorisée lors d'un quiz chronométré.",
          "Le partage de questions, réponses ou captures de quiz avec d'autres apprenants, avant ou après l'épreuve, est prohibé.",
        ),
      },
      {
        label: "Courtoisie dans les espaces communautaires",
        text: "L'espace communautaire est un lieu d'entraide : les échanges (publications, commentaires, réponses) doivent rester respectueux et constructifs. Sont exclus : propos injurieux ou discriminatoires, harcèlement, publicité non sollicitée, diffusion de contenus illégaux ou de liens malveillants. Tout manquement expose le message à sa suppression et le compte à une suspension temporaire ou définitive des espaces communautaires.",
      },
      {
        label: "Respect du règlement intérieur",
        text: "Les présentations présencielles et les échanges avec l'équipe se font dans le respect du règlement intérieur de STAF PRINT CENTER et des personnes. L'apprenant s'engage à fournir des informations exactes lors de son inscription et à tenir son profil à jour.",
      },
    ],
  },
  {
    id: "certificats",
    title: "Article 5 - Délivrance des certificats",
    summary: "Le certificat dépend de la réussite pédagogique et du règlement intégral.",
    intro:
      "Le certificat de fin de formation atteste que l'apprenant a atteint les objectifs pédagogiques du programme suivi.",
    clauses: [
      {
        label: "Conditions de réussite pédagogique",
        text: list(
          "Complétion de l'ensemble des modules et leçons de la formation.",
          "Validation des exercices et travaux par le formateur assigné.",
          "Score officiel au moins égal au seuil de réussite des quiz de la formation, la meilleure tentative étant retenue.",
        ),
      },
      {
        label: "Condition financière",
        text: "Le certificat n'est délivré qu'après règlement intégral du solde de la formation. Un dossier dont le solde n'est pas soldé reste consultable, mais le téléchargement du certificat est bloqué jusqu'à l'apurement complet de la dette.",
      },
      {
        label: "Remise et validité",
        text: "Le certificat est émis au nom de l'apprenant, au format électronique, téléchargeable depuis l'espace « Certificats » du portail. Il mentionne la formation suivie et les compétences validées. Toute falsification ou altération du certificat est interdite et expose son auteur aux poursuites prévues par la loi.",
      },
    ],
  },
  {
    id: "donnees",
    title: "Article 6 - Données personnelles et droit à l'image",
    summary: "Les données sont utilisées pour la formation et protégées selon la réglementation applicable.",
    intro:
      "STAF PRINT CENTER traite les données des apprenants dans le respect de la réglementation béninoise applicable en matière de protection des données à caractère personnel, sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP).",
    clauses: [
      {
        label: "Données collectées et finalités",
        text: "Sont traitées : les données d'identification et de contact (nom, prénom, email, téléphone), les données de suivi pédagogique (progression, tentatives de quiz, travaux soumis, retours de formateur), les données administratives et financières (inscriptions, factures, paiements), ainsi que l'historique de connexion nécessaire à la sécurité du compte. Ces données servent exclusivement à la gestion de la formation, du suivi pédagogique, de la facturation et de la communication relative au service.",
      },
      {
        label: "Droits de l'apprenant",
        text: "L'apprenant dispose d'un droit d'accès, de rectification, et peut demander l'exercice de ses autres droits auprès du responsable de traitement via le support de la plateforme ou l'adresse de contact indiquée à l'article 7. Les données de suivi pédagogique sont conservées pendant la durée de la relation d'inscription puis archivées selon les durées légales applicables.",
      },
      {
        label: "Témoignages et publications de travaux",
        text: "Les témoignages, avis et réalisations (projets, exercices, travaux créatifs) produits par l'apprenant ne sont publiés - sur la plateforme, les réseaux sociaux de STAF PRINT CENTER ou tout support de communication - qu'avec son accord exprès, recueilli au préalable. L'apprenant peut retirer son accord à tout moment : les publications concernées sont retirées dans un délai raisonnable, sans effet rétroactif sur les supports déjà imprimés ou diffusés.",
      },
      {
        label: "Droit à l'image",
        text: list(
          "Les photographies et captations réalisées lors des sessions, ateliers et cérémonies de remise de certificats ne sont exploitées qu'avec l'autorisation des personnes concernées.",
          "L'apprenant peut refuser ou retirer cette autorisation en contactant le support, sans que cela n'affecte son accès aux formations.",
          "Les mineurs ne sont photographiés ou diffusés qu'avec l'autorisation de leur représentant légal.",
        ),
      },
    ],
  },
  {
    id: "contact",
    title: "Article 7 - Réclamations et contact",
    summary: "Le support traite les demandes et les modifications importantes sont notifiées.",
    intro:
      "Toute question, réclamation ou demande relative aux présentes CGU peut être adressée via l'espace « Support » du portail ou aux coordonnées de STAF PRINT CENTER à Cotonou (Bénin).",
    clauses: [
      {
        label: "Traitement des réclamations",
        text: "Les réclamations sont examinées par l'administration de STAF PRINT CENTER, qui répond à l'apprenant dans un délai raisonnable. En cas de désaccord persistant, l'apprenant peut également saisir l'Autorité de Protection des Données Personnelles (APDP) pour toute question relative à ses données.",
      },
      {
        label: "Évolution des CGU",
        text: "STAF PRINT CENTER peut faire évoluer les présentes CGU pour tenir compte de l'évolution du service ou de la réglementation. La version applicable est celle en vigueur à la date d'utilisation de la plateforme ; les modifications importantes font l'objet d'une notification via les notifications du portail.",
      },
    ],
  },
];
