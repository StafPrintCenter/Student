import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SITE, SITE_LINK } from "@/data/site";

export function AcceptanceSection() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8 print:hidden">
      <h2 className="font-display text-xl">Votre accès implique le respect des présentes CGU</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        La création d'un compte apprenant sur {SITE.tool} vaut reconnaissance d'en avoir pris connaissance et
        acceptation. Les versions mises à jour sont publiées sur cette page ; les modifications importantes sont
        notifiées via le portail.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button asChild variant="default">
          <a href={`${SITE_LINK.landingUrl}/trainings`}>Découvrir les formations</a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Retour</Link>
        </Button>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Toute question ou réclamation relative aux CGU peut être adressée via l'espace « Support » du portail ou
        aux coordonnées de STAF PRINT CENTER.
      </p>
    </section>
  );
}
