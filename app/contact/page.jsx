import { headers } from "next/headers";
import { Backdrop, ScrollRail, TopBar } from "@/components/site-chrome";
import ContactForm from "@/components/contact-form";
import { contactFaqItems } from "@/lib/contact-content";

export const metadata = {
  title: "Contact et accès | ONE BATT Béziers",
  description:
    "Contactez ONE BATT, magasin et atelier de batteries à Béziers (Villeneuve-lès-Béziers) : téléphone, formulaire, horaires et itinéraire. On vous recontacte rapidement.",
  keywords: [
    "batterie Béziers",
    "magasin batterie Béziers",
    "horaires",
    "itinéraire",
    "OneBatt",
    "contact",
  ],
  alternates: { canonical: "/contact/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ONE BATT",
    title: "Contact et accès | ONE BATT Béziers",
    description:
      "Téléphone, formulaire, horaires et itinéraire pour joindre l'atelier ONE BATT à Béziers.",
    images: [{ url: "/onebatt_logo_nav.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact et accès | ONE BATT Béziers",
    description:
      "Téléphone, formulaire, horaires et itinéraire pour joindre l'atelier ONE BATT à Béziers.",
    images: ["/onebatt_logo_nav.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "ONE BATT",
  description: "Diagnostic et vente de batteries pour tous véhicules à Béziers.",
  url: "https://www.onebatt.fr/contact/",
  telephone: "+33467000000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "10 avenue du Romain",
    addressLocality: "Villeneuve-lès-Béziers",
    postalCode: "34420",
    addressRegion: "Occitanie",
    addressCountry: "FR",
  },
  areaServed: "Béziers et région",
  priceRange: "€€",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "08:00",
      closes: "12:30",
    },
  ],
};

const MAPS_QUERY = "10+avenue+du+Romain%2C+34420+Villeneuve-l%C3%A8s-B%C3%A9ziers";

export default async function ContactPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Backdrop />

      <TopBar current="contact" />

      <ScrollRail />

      <div className="site-scroll">
        <div className="site-content">
          <div className="hero-shell">
            <main className="hero hero--contact">
              <div className="hero__col hero__col--lead">
                <p className="section-kicker reveal" data-delay="1">
                  Contact &amp; accès
                </p>
                <h1 className="display">
                  <span className="line reveal" data-delay="2">
                    Parlons de
                  </span>
                  <span className="line line--accent reveal" data-delay="3">
                    <em>
                      votre <span className="line__gold">véhicule</span>
                    </em>
                  </span>
                </h1>
                <p className="hero__lead reveal" data-delay="4">
                  Décrivez votre véhicule et votre besoin&nbsp;: on vous recontacte
                  rapidement pour vous conseiller la bonne solution.
                </p>
                <div className="hero__cta cta-row reveal" data-delay="5">
                  <a className="pill pill--primary" href="tel:+33467000000">
                    <span className="pill__label">Appeler ONE BATT</span>
                  </a>
                  <a className="pill pill--secondary" href="#contact">
                    <span className="pill__label">Remplir le formulaire</span>
                  </a>
                </div>
              </div>

              <aside
                className="hero__col hero__col--coords coordonnees coordonnees--hero"
                aria-labelledby="coordonnees-title"
              >
                <h2 id="coordonnees-title" className="sr-only">
                  Nos coordonnées
                </h2>

                <ul className="coordonnees__grid coordonnees__grid--hero">
                  <li className="coordonnees__item reveal" data-delay="3">
                    <article className="coordonnees__card">
                      <span className="coordonnees__rail" aria-hidden="true">
                        <i />
                      </span>
                      <h3 className="coordonnees__name">Téléphone</h3>
                      <a
                        className="coordonnees__value line__gold"
                        href="tel:+33467000000"
                      >
                        04 67 00 00 00
                      </a>
                      <p className="coordonnees__text">
                        Réponse directe pendant nos horaires d&apos;ouverture.
                      </p>
                    </article>
                  </li>

                  <li className="coordonnees__item reveal" data-delay="4">
                    <article className="coordonnees__card">
                      <span className="coordonnees__rail" aria-hidden="true">
                        <i />
                      </span>
                      <h3 className="coordonnees__name">Email</h3>
                      <a
                        className="coordonnees__value line__gold"
                        href="mailto:contact@onebatt.fr"
                      >
                        contact@onebatt.fr
                      </a>
                      <p className="coordonnees__text">
                        Pour une demande écrite, réponse sous 24h ouvrées.
                      </p>
                    </article>
                  </li>

                  <li className="coordonnees__item reveal" data-delay="5">
                    <article className="coordonnees__card">
                      <span className="coordonnees__rail" aria-hidden="true">
                        <i />
                      </span>
                      <h3 className="coordonnees__name">Adresse</h3>
                      <p className="coordonnees__value">
                        10 avenue du Romain
                        <br />
                        34420 Villeneuve-lès-Béziers
                      </p>
                      <p className="coordonnees__text">
                        Atelier et magasin ONE BATT, au cœur de la région de Béziers.
                      </p>
                    </article>
                  </li>
                </ul>
              </aside>
            </main>
          </div>

          <div className="section-seam" aria-hidden="true" />

          <div className="page-continuity page-contact">
            <section
              className="contact-form"
              id="contact"
              aria-labelledby="contact-form-title"
            >
              <div className="contact-form__inner">
                <header className="contact-form__head reveal-on-scroll">
                  <p className="section-kicker">Demande de contact</p>
                  <h2 id="contact-form-title" className="contact-form__title">
                    Décrivez votre besoin, on s&apos;occupe du reste
                  </h2>
                  <p className="contact-form__lede">
                    Prénom, email et téléphone suffisent pour être recontacté. Plus vous
                    nous en dites sur votre véhicule, plus vite on cible la bonne
                    solution.
                  </p>
                </header>

                <div className="contact-form__panel">
                  <ContactForm />
                </div>
              </div>
            </section>

            <section className="acces" aria-labelledby="acces-title">
              <div className="acces__inner">
                <header className="acces__head reveal-on-scroll">
                  <p className="section-kicker">Nous trouver</p>
                  <h2 id="acces-title" className="acces__title">
                    L&apos;atelier ONE BATT à{" "}
                    <span className="line__gold">Béziers</span>
                  </h2>
                  <p className="acces__lede">
                    10 avenue du Romain, 34420 Villeneuve-lès-Béziers. Accès facile
                    depuis Béziers et toute la région.
                  </p>

                  <div
                    className="acces__actions cta-row reveal-on-scroll"
                    data-delay="1"
                  >
                    <a
                      className="pill pill--secondary"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="pill__label">Itinéraire</span>
                    </a>
                  </div>
                </header>

                <div className="acces__body">
                  <aside className="acces__aside reveal-on-scroll">
                    <div
                      className="acces__horaires"
                      aria-labelledby="acces-horaires-title"
                    >
                      <h3 id="acces-horaires-title" className="acces__horaires-title">
                        Horaires d&apos;ouverture
                      </h3>

                      <ul className="horaires__list">
                        <li className="horaires__row">
                          <span className="horaires__days">Lundi au vendredi</span>
                          <span className="horaires__hours">8h à 19h</span>
                        </li>
                        <li className="horaires__row">
                          <span className="horaires__days">Samedi</span>
                          <span className="horaires__hours">8h à 12h30</span>
                        </li>
                      </ul>
                    </div>
                  </aside>

                  <figure className="acces__map reveal-on-scroll" data-delay="2">
                    <iframe
                      className="acces__embed"
                      src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`}
                      title="Localisation de l'atelier ONE BATT à Villeneuve-lès-Béziers"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </figure>
                </div>
              </div>
            </section>

            <section className="faq" aria-labelledby="faq-title">
              <div className="faq__inner">
                <header className="faq__head">
                  <p className="section-kicker faq__kicker reveal-on-scroll">
                    Avant d&apos;appeler ou de passer nous voir
                  </p>
                  <h2 id="faq-title" className="faq__title reveal-on-scroll">
                    Vos questions,
                    <br />
                    <span className="line__gold">nos réponses</span>
                  </h2>
                </header>

                <ul className="faq__list">
                  {contactFaqItems.map((item, index) => (
                    <li
                      className="faq__item reveal-on-scroll"
                      data-delay={Math.min(index + 1, 6)}
                      key={item.q}
                    >
                      <details className="faq__details">
                        <summary className="faq__summary">
                          <span className="faq__rail" aria-hidden="true">
                            <i />
                          </span>
                          <span className="faq__question">{item.q}</span>
                          <span className="faq__toggle" aria-hidden="true" />
                        </summary>
                        <div className="faq__answer">
                          <p>{item.a}</p>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="final-cta" aria-labelledby="final-cta-title">
              <div className="final-cta__inner">
                <div className="final-cta__card reveal-on-scroll">
                  <div className="final-cta__content">
                    <div className="trust-badge">
                      <span
                        className="trust-badge__stars"
                        role="img"
                        aria-label="Note : 5 sur 5"
                      >
                        ★★★★★
                      </span>
                      <p className="trust-badge__text">
                        Avis Google ·{" "}
                        <span className="line__gold">Revendeur officiel</span> des
                        grandes marques
                      </p>
                    </div>
                    <h2 id="final-cta-title" className="final-cta__title">
                      Une question avant de passer à l&apos;action&nbsp;?
                    </h2>
                    <p className="final-cta__text">
                      Un simple appel suffit pour obtenir un avis fiable sur votre panne
                      ou votre besoin d&apos;autonomie, et repartir avec la bonne
                      solution.
                    </p>
                    <div className="final-cta__cta cta-row">
                      <a className="pill pill--primary" href="tel:+33467000000">
                        <span className="pill__label">
                          J&apos;appelle un expert ONE BATT
                        </span>
                      </a>
                    </div>
                  </div>
                  <figure className="final-cta__media" aria-hidden="true">
                    <div className="final-cta__media__frame">
                      <span className="final-cta__media__label">
                        En attente de photos
                      </span>
                    </div>
                  </figure>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
