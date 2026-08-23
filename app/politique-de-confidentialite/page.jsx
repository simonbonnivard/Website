import { Backdrop, ScrollRail, TopBar } from "@/components/site-chrome";

export const metadata = {
  title: "Politique de confidentialité | ONE BATT",
  description:
    "Politique de confidentialité d'ONE BATT : données collectées via le formulaire de contact, finalités, durée de conservation et vos droits RGPD.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/politique-de-confidentialite/" },
};

export default function PolitiqueDeConfidentialitePage() {
  return (
    <>
      <Backdrop />
      <TopBar current="contact" />
      <ScrollRail />

      <div className="site-scroll">
        <div className="site-content">
          <section className="legal" aria-labelledby="legal-title">
            <div className="legal__inner">
              <header className="legal__head">
                <h1 id="legal-title" className="legal__title">
                  Politique de confidentialité
                </h1>
                <p className="legal__lede">
                  Cette page explique quelles données ONE BATT collecte via le site
                  onebatt.fr, pourquoi, combien de temps elles sont conservées et
                  comment exercer vos droits.
                </p>
              </header>

              <div className="legal__body">
                <h2>Responsable du traitement</h2>
                <p>
                  ONE BATT, atelier et magasin de batteries situé 10 avenue du Romain,
                  34420 Villeneuve-lès-Béziers, est responsable du traitement des
                  données collectées sur ce site.
                </p>

                <h2>Données collectées</h2>
                <p>
                  Le formulaire de contact collecte votre prénom, nom, email, téléphone,
                  le type de véhicule concerné, la nature de votre besoin et le message
                  que vous rédigez librement. Aucune donnée bancaire n&apos;est
                  collectée sur ce site.
                </p>

                <h2>Finalité</h2>
                <p>
                  Ces informations sont utilisées uniquement pour répondre à votre
                  demande&nbsp;: vous recontacter, évaluer votre besoin et vous proposer
                  la solution adaptée à votre véhicule.
                </p>

                <h2>Durée de conservation</h2>
                <p>
                  Les données transmises via le formulaire sont conservées le temps
                  nécessaire au traitement de votre demande, puis supprimées ou
                  archivées de manière sécurisée si une relation commerciale est
                  engagée.
                </p>

                <h2>Destinataires</h2>
                <p>
                  Les données sont reçues uniquement par l&apos;équipe ONE BATT. Elles
                  transitent par le prestataire d&apos;envoi d&apos;emails Resend, qui
                  agit en tant que sous-traitant technique et ne les utilise à aucune
                  autre fin.
                </p>

                <h2>Vos droits</h2>
                <p>
                  Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
                  rectification, d&apos;effacement et d&apos;opposition sur vos données.
                  Pour exercer ces droits, contactez-nous&nbsp;:
                </p>
                <ul>
                  <li>
                    par email à{" "}
                    <a href="mailto:contact@onebatt.fr">contact@onebatt.fr</a>
                  </li>
                  <li>
                    par téléphone au <a href="tel:+33467000000">04 67 00 00 00</a>
                  </li>
                </ul>

                <h2>Cookies</h2>
                <p>
                  Ce site n&apos;utilise pas de cookies de suivi publicitaire. Seuls des
                  cookies techniques strictement nécessaires au bon fonctionnement du
                  site peuvent être déposés.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
