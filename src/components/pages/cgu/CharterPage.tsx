import { LegalArticle, LegalDocShell, LegalKeyPoints } from "@/components/site/LegalDocShell";
import { SITE } from "@/data/site";
import { AcceptanceSection } from "./AcceptanceSection";
import { LEGAL_SECTIONS } from "./LegalSections";

const VERSION = "1.0";
const UPDATED_AT = "31 octobre 2026";

export function CharterPage() {
  return (
    <LegalDocShell
      eyebrow={`Document contractuel - ${SITE.tool}`}
      title="Conditions Générales d'Utilisation"
      description={`Ces CGU encadrent l'utilisation du portail d'apprentissage de ${SITE.name} par ses apprenants : accès au service, conditions financières, propriété intellectuelle, assiduité, certificats et protection des données personnelles.`}
      meta={[
        { label: "Version", value: VERSION },
        { label: "Dernière mise à jour", value: UPDATED_AT },
        { label: "Concerne", value: "Apprenants et candidats à une formation" },
        { label: "Lecture", value: "≈ 10 minutes" },
      ]}
      sections={LEGAL_SECTIONS}
    >
      <LegalKeyPoints items={LEGAL_SECTIONS.map((section) => ({ title: section.title, text: section.summary }))} />

      {LEGAL_SECTIONS.map((section, index) => (
        <LegalArticle key={section.id} section={section} index={index} />
      ))}

      <AcceptanceSection />
    </LegalDocShell>
  );
}
