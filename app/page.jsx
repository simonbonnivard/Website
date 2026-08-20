import { partners } from "@/lib/partners";
import { MecanismeStepIcon } from "@/components/mecanisme-icons";

function PartnerTrack({ ariaHidden = false }) {
  return (
    <ul
      className="solution__partners__track"
      aria-hidden={ariaHidden || undefined}
    >
      {partners.map((name) => (
        <li key={`${ariaHidden ? "clone-" : ""}${name}`}>{name}</li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop__grid" />
        <div className="backdrop__hero-glow" />
        <div className="backdrop__vignette" />
        <div className="backdrop__grain" />
      </div>

      <div className="stage">
        <canvas id="scene" />
        <div className="stage__poster" aria-hidden="true" />
        <div className="stage__veil" aria-hidden="true" />
      </div>

      <header className="topbar">
        <a
          className="topbar__logo reveal"
          data-delay="1"
          href="#"
          aria-label="OneBatt, accueil"
        >
          <img
            src="/onebatt_logo_nav.png"
            alt="OneBatt"
            width={679}
            height={76}
            fetchPriority="high"
            decoding="async"
          />
        </a>

        <nav className="nav" aria-label="Navigation principale">
          <ul>
            <li className="reveal" data-delay="1">
              <a href="#">Accueil</a>
            </li>
            <li className="reveal" data-delay="2">
              <a href="#services">Nos services</a>
            </li>
            <li className="reveal" data-delay="3">
              <a href="#energies-embarquees">Énergies embarquées</a>
            </li>
            <li className="reveal" data-delay="4">
              <a href="#a-propos">À propos</a>
            </li>
            <li className="reveal" data-delay="5">
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>

        <div className="topbar__cta reveal" data-delay="6">
          <a className="pill" href="#contact">
            <span className="pill__label">Demander mon diagnostic</span>
          </a>
        </div>
      </header>

      <div className="site-scroll">
        <div className="hero-shell">
          <main className="hero">
            <div className="hero__col">
              <h1 className="display">
                <span className="line reveal" data-delay="2">
                  L&apos;énergie
                </span>
                <span className="line line--accent reveal" data-delay="3">
                  <em>
                    pour aller <span className="line__gold">plus loin</span>
                  </em>
                </span>
              </h1>
              <p className="hero__lead reveal" data-delay="4">
                Démarrage poussif, voyant allumé ? Le coupable n&apos;est pas
                toujours la batterie. Chez ONE BATT, à Béziers, on diagnostique
                avant de remplacer pour ne changer que ce qui doit l&apos;être.
              </p>
              <div className="hero__cta cta-row reveal" data-delay="5">
                <a className="pill pill--primary" href="tel:+33467000000">
                  <span className="pill__label">Appeler ONE BATT</span>
                </a>
                <a className="pill pill--secondary" href="#contact">
                  <span className="pill__label">nous trouver</span>
                </a>
              </div>
            </div>
          </main>

          <footer className="hero-foot">
            <div className="review reveal" data-delay="7">
              <span className="review__rail" aria-hidden="true">
                <i />
              </span>
              <div className="review__meta">
                <span
                  className="review__stars"
                  role="img"
                  aria-label="Note : 5 sur 5"
                >
                  ★★★★★
                </span>
                <span className="review__brand">Google</span>
              </div>
              <div className="review__slides">
                <figure className="review__slide is-active">
                  <blockquote className="review__quote">
                    « Diagnostic avant de vendre : enfin un atelier qui vérifie
                    avant de remplacer. »
                  </blockquote>
                  <p className="review__author">Sophie M. · Béziers</p>
                </figure>

                <figure className="review__slide">
                  <blockquote className="review__quote">
                    « Batterie lithium pour notre camping-car : conseil clair,
                    pose rapide, autonomie retrouvée. »
                  </blockquote>
                  <p className="review__author">
                    Marc D. · Villeneuve-lès-Béziers
                  </p>
                </figure>

                <figure className="review__slide">
                  <blockquote className="review__quote">
                    « Panne de démarrage un samedi matin : diagnostic en 20
                    minutes, alternateur en cause, pas la batterie. »
                  </blockquote>
                  <p className="review__author">Laurent P. · Béziers</p>
                </figure>

                <figure className="review__slide">
                  <blockquote className="review__quote">
                    « Intervention sur site pour notre utilitaire : pro,
                    efficace, on sait à qui parler à Béziers. »
                  </blockquote>
                  <p className="review__author">Élodie R. · Sérignan</p>
                </figure>
              </div>
            </div>
          </footer>
        </div>

        <div className="section-seam" aria-hidden="true" />

        <div className="page-continuity">
          <section
            className="problems"
            id="problemes"
            aria-labelledby="problems-title"
          >
            <div className="problems__inner">
              <header className="problems__head">
                <h2
                  id="problems-title"
                  className="problems__title reveal-on-scroll"
                >
                  Une <span className="line__gold">batterie</span>, c&apos;est&nbsp;simple.
                  <br />
                  Sauf quand on&nbsp;ne&nbsp;sait&nbsp;pas
                  <br />
                  <span className="line__gold">d&apos;où vient la&nbsp;panne</span>.
                </h2>
                <p className="problems__lede reveal-on-scroll">
                  Chaque démarrage hésitant alimente le doute, et plus vous
                  temporisez, plus le risque de payer la mauvaise pièce ou de
                  rester immobilisé au pire moment grandit.
                </p>
              </header>

              <ol className="problems__list">
                <li
                  className="problems__item problems__item--left reveal-on-scroll"
                  data-delay="1"
                >
                  <article className="problems__card">
                    <span className="problems__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="problems__name">
                      <span className="line__gold">Batterie</span> ou{" "}
                      <span className="line__gold">alternateur</span>&nbsp;:
                      <br />
                      impossible&nbsp;de&nbsp;savoir
                    </h3>
                    <p className="problems__text">
                      Le véhicule peine à démarrer et vous n&apos;avez aucun
                      moyen de savoir si c&apos;est la batterie en fin de vie ou
                      l&apos;alternateur qui ne charge plus. Changer au hasard,
                      c&apos;est risquer de payer une pièce pour rien et de
                      retomber en panne aussitôt.
                    </p>
                  </article>
                  <figure className="problems__media">
                    <div className="problems__media__frame">
                      <span className="problems__media__label">
                        En attente de photos
                      </span>
                    </div>
                  </figure>
                </li>

                <li
                  className="problems__item problems__item--right reveal-on-scroll"
                  data-delay="2"
                >
                  <figure className="problems__media">
                    <div className="problems__media__frame">
                      <span className="problems__media__label">
                        En attente de photos
                      </span>
                    </div>
                  </figure>
                  <article className="problems__card">
                    <span className="problems__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="problems__name">
                      La <span className="line__gold">peur</span> de&nbsp;tomber{" "}
                      <span className="line__gold">en&nbsp;rade</span>
                      <br />
                      au&nbsp;mauvais&nbsp;moment
                    </h3>
                    <p className="problems__text">
                      Un matin pressé, un départ en vacances, une tournée de
                      chantier : la batterie lâche toujours au pire moment.
                      Cette incertitude permanente pèse, surtout quand le
                      véhicule est indispensable à votre quotidien ou à votre
                      travail.
                    </p>
                  </article>
                </li>

                <li
                  className="problems__item problems__item--left reveal-on-scroll"
                  data-delay="3"
                >
                  <article className="problems__card">
                    <span className="problems__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="problems__name">
                      Le <span className="line__gold">doute</span> face&nbsp;au{" "}
                      <span className="line__gold">vendeur</span>
                      <br />
                      qui&nbsp;veut&nbsp;juste&nbsp;vendre
                    </h3>
                    <p className="problems__text">
                      En grande surface, on vous propose une batterie sans
                      vérifier quoi que ce soit. Vous repartez avec la pièce,
                      sans certitude que c&apos;était bien le problème, et sans
                      personne pour vous conseiller la bonne technologie pour
                      votre usage.
                    </p>
                  </article>
                  <figure className="problems__media">
                    <div className="problems__media__frame">
                      <span className="problems__media__label">
                        En attente de photos
                      </span>
                    </div>
                  </figure>
                </li>

                <li
                  className="problems__item problems__item--right reveal-on-scroll"
                  data-delay="4"
                >
                  <figure className="problems__media">
                    <div className="problems__media__frame">
                      <span className="problems__media__label">
                        En attente de photos
                      </span>
                    </div>
                  </figure>
                  <article className="problems__card">
                    <span className="problems__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="problems__name">
                      Le&nbsp;risque de
                      <br />
                      se&nbsp;tromper de&nbsp;<span className="line__gold">référence</span>
                    </h3>
                    <p className="problems__text">
                      Acheter en ligne ou ailleurs, c&apos;est prendre le risque
                      de la mauvaise capacité, de la mauvaise technologie (AGM,
                      EFB, lithium, gel) ou d&apos;un modèle inadapté à votre
                      véhicule. Une batterie mal choisie s&apos;use plus vite et
                      vous coûte plus cher au final.
                    </p>
                  </article>
                </li>
            </ol>
          </div>
        </section>

        <div
          className="section-seam section-seam--between"
          aria-hidden="true"
        />

        <section
          className="solution"
          id="services"
          aria-labelledby="solution-title"
        >
          <div className="solution__inner">
            <header className="solution__head">
              <h2
                id="solution-title"
                className="solution__title reveal-on-scroll"
              >
                Chez ONE&nbsp;BATT, on&nbsp;ne&nbsp;vend
                <br />
                pas&nbsp;une{" "}
                <span className="line__gold">batterie</span>.
                <br />
                On&nbsp;règle&nbsp;le&nbsp;<span className="line__gold">problème</span>.
              </h2>
              <p className="solution__lede reveal-on-scroll">
                Spécialistes de l&apos;énergie embarquée à Béziers, nous
                diagnostiquons batterie, charge, alternateur et connexions avant
                toute proposition. Vous repartez avec la bonne solution, posée
                et vérifiée.
              </p>
              <div className="solution__cta cta-row reveal-on-scroll">
                <a className="pill pill--primary" href="tel:+33467000000">
                  <span className="pill__label">
                    J&apos;appelle pour mon diagnostic
                  </span>
                </a>
              </div>
            </header>

            <div className="solution__benefits">
              <article className="solution__featured reveal-on-scroll">
                <figure className="solution__media">
                  <div className="solution__media__frame">
                    <span className="solution__media__label">
                      En attente de photos
                    </span>
                  </div>
                </figure>
                <div className="solution__card">
                  <span className="solution__rail" aria-hidden="true">
                    <i />
                  </span>
                  <h3 className="solution__name">
                    La certitude que le{" "}
                    <span className="line__gold">problème est&nbsp;réglé</span>
                  </h3>
                  <p className="solution__text">
                    Vous savez ce qui bloquait et que c&apos;est réglé. Fini le
                    doute, place à la tranquillité.
                  </p>
                </div>
              </article>

              <ul className="solution__grid">
                <li className="solution__grid__item reveal-on-scroll" data-delay="1">
                  <article className="solution__card solution__card--compact">
                    <span className="solution__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="solution__name">
                      Ne&nbsp;plus&nbsp;jamais{" "}
                      <span className="line__gold">payer pour&nbsp;rien</span>
                    </h3>
                    <p className="solution__text">
                      Diagnostic avant remplacement : vous ne payez que ce qui
                      doit l&apos;être, sans pièce inutile.
                    </p>
                  </article>
                </li>

                <li className="solution__grid__item reveal-on-scroll" data-delay="2">
                  <article className="solution__card solution__card--compact">
                    <span className="solution__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="solution__name">
                      Un&nbsp;interlocuteur de&nbsp;confiance,
                      <br />
                      <span className="line__gold">près de chez&nbsp;vous</span>
                    </h3>
                    <p className="solution__text">
                      Un atelier local, des visages, un numéro qui répond,
                      aujourd&apos;hui comme dans six mois.
                    </p>
                  </article>
                </li>

                <li className="solution__grid__item reveal-on-scroll" data-delay="3">
                  <article className="solution__card solution__card--compact">
                    <span className="solution__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="solution__name">
                      Partir l&apos;esprit&nbsp;libre,
                      <br />
                      surtout en{" "}
                      <span className="line__gold">van ou camping&nbsp;car</span>
                    </h3>
                    <p className="solution__text">
                      Lithium, décharge lente ou solaire : la bonne autonomie
                      pour votre van ou camping car, sans crainte de la panne.
                    </p>
                  </article>
                </li>
              </ul>
            </div>

            <div
              className="solution__partners reveal-on-scroll"
              aria-label="Marques partenaires"
            >
              <div className="solution__partners__shell">
                <div className="solution__partners__viewport">
                  <PartnerTrack />
                  <PartnerTrack ariaHidden />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          className="section-seam section-seam--between"
          aria-hidden="true"
        />

        <section
          className="mecanisme"
          id="methode"
          aria-labelledby="mecanisme-title"
        >
          <div className="mecanisme__inner">
            <header className="mecanisme__head">
              <h2
                id="mecanisme-title"
                className="mecanisme__title reveal-on-scroll"
              >
                De votre <span className="line__gold">doute</span> à
                la&nbsp;solution&nbsp;:
                <br />
                notre méthode en <span className="line__gold">4&nbsp;étapes</span>
              </h2>
              <p className="mecanisme__lede reveal-on-scroll">
                La plupart des points de vente vous proposent une batterie
                sans rien vérifier. Le problème, c&apos;est qu&apos;une panne
                de démarrage ne vient pas toujours de la batterie. Notre
                méthode intègre une étape que les autres sautent&nbsp;: le
                diagnostic complet du système avant toute proposition.
                C&apos;est ce qui garantit que vous repartez avec la vraie
                solution, pas une dépense au hasard.
              </p>
              <div className="mecanisme__cta cta-row reveal-on-scroll">
                <a className="pill pill--primary" href="tel:+33467000000">
                  <span className="pill__label">
                    J&apos;appelle pour mon diagnostic
                  </span>
                </a>
                <a className="pill pill--secondary" href="#contact">
                  <span className="pill__label">Je viens à l&apos;atelier</span>
                </a>
              </div>
            </header>

            <ol className="mecanisme__list">
              <li className="mecanisme__step reveal-on-scroll" data-delay="1">
                <div className="mecanisme__marker" aria-hidden="true">
                  <span className="mecanisme__marker__number">01</span>
                </div>
                <div className="mecanisme__row">
                  <article className="mecanisme__card">
                    <span className="mecanisme__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="mecanisme__name">
                      On&nbsp;<span className="line__gold">écoute</span> votre&nbsp;besoin
                    </h3>
                    <p className="mecanisme__text">
                      Vous nous décrivez votre véhicule, votre usage et les
                      symptômes (démarrage difficile, voyant, perte de
                      puissance, besoin d&apos;autonomie). On cerne tout de
                      suite la piste à explorer&nbsp;: vous vous sentez
                      compris, pas pressé.
                    </p>
                  </article>
                  <MecanismeStepIcon variant="listen" />
                </div>
              </li>

              <li
                className="mecanisme__step mecanisme__step--reverse reveal-on-scroll"
                data-delay="2"
              >
                <div className="mecanisme__marker" aria-hidden="true">
                  <span className="mecanisme__marker__number">02</span>
                </div>
                <div className="mecanisme__row">
                  <article className="mecanisme__card">
                    <span className="mecanisme__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="mecanisme__name">
                      On&nbsp;<span className="line__gold">diagnostique</span> avant&nbsp;tout
                    </h3>
                    <p className="mecanisme__text">
                      On contrôle la batterie (tension, capacité, état), le
                      système de charge, l&apos;alternateur et les
                      connexions. Vous savez enfin d&apos;où vient vraiment
                      le problème, preuve à&nbsp;l&apos;appui.
                    </p>
                  </article>
                  <MecanismeStepIcon variant="diagnose" />
                </div>
              </li>

              <li className="mecanisme__step reveal-on-scroll" data-delay="3">
                <div className="mecanisme__marker" aria-hidden="true">
                  <span className="mecanisme__marker__number">03</span>
                </div>
                <div className="mecanisme__row">
                  <article className="mecanisme__card">
                    <span className="mecanisme__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="mecanisme__name">
                      On&nbsp;choisit la solution&nbsp;<span className="line__gold">adaptée</span>
                    </h3>
                    <p className="mecanisme__text">
                      Selon le résultat, on vous oriente vers la bonne
                      technologie&nbsp;: standard, EFB, AGM, lithium,
                      décharge lente ou solaire. Le bon choix pour votre
                      véhicule, votre usage et votre budget, expliqué
                      simplement.
                    </p>
                  </article>
                  <MecanismeStepIcon variant="choose" />
                </div>
              </li>

              <li
                className="mecanisme__step mecanisme__step--reverse reveal-on-scroll"
                data-delay="4"
              >
                <div className="mecanisme__marker" aria-hidden="true">
                  <span className="mecanisme__marker__number">04</span>
                </div>
                <div className="mecanisme__row">
                  <article className="mecanisme__card">
                    <span className="mecanisme__rail" aria-hidden="true">
                      <i />
                    </span>
                    <h3 className="mecanisme__name">
                      On&nbsp;<span className="line__gold">contrôle</span> avant que vous&nbsp;repartiez
                    </h3>
                    <p className="mecanisme__text">
                      Après remplacement ou intervention, on vérifie que tout
                      fonctionne. Vous repartez avec une solution cohérente
                      et la certitude que c&apos;est&nbsp;réglé.
                    </p>
                  </article>
                  <MecanismeStepIcon variant="verify" />
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
