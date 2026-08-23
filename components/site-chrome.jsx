import Image from "next/image";

/* Chrome partagé entre toutes les pages : fond ambiant, filet de progression
   de scroll et barre de navigation. Rendu identique partout pour garantir le
   même scroll, la même nav et la même DA sur chaque page du site. */

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__grid" />
      <div className="backdrop__hero-glow" />
      <div className="backdrop__vignette" />
      <div className="backdrop__grain" />
    </div>
  );
}

export function ScrollRail() {
  return (
    <div className="scroll-rail" aria-hidden="true">
      <span className="scroll-rail__fill" />
    </div>
  );
}

/**
 * `current` identifie la page affichée ("home" ou "contact") pour adapter le
 * lien Accueil et l'état courant du lien Contact. Les liens inter-pages
 * restent des `<a>` classiques (pas next/link) : le moteur de scroll/reveal
 * partagé (lib/site-init.js) ne se réarme qu'au montage de <SiteClient/>,
 * donc une navigation SPA laisserait le scroll fluide accroché aux anciens
 * nœuds DOM. Un rechargement complet garantit un comportement identique sur
 * chaque page.
 */
export function TopBar({ current }) {
  const isHome = current === "home";

  return (
    <header className="topbar">
      <a
        className="topbar__logo reveal"
        data-delay="1"
        href={isHome ? "#" : "/"}
        aria-label="OneBatt, accueil"
      >
        <Image
          src="/onebatt_logo_nav.png"
          alt="OneBatt"
          width={679}
          height={76}
          priority
        />
      </a>

      <nav className="nav" aria-label="Navigation principale">
        <ul>
          <li className="reveal" data-delay="1">
            <a href={isHome ? "#" : "/"}>Accueil</a>
          </li>
          <li className="reveal" data-delay="2">
            <span>Nos services</span>
          </li>
          <li className="reveal" data-delay="3">
            <span>Énergies embarquées</span>
          </li>
          <li className="reveal" data-delay="4">
            <span>À propos</span>
          </li>
          <li className="reveal" data-delay="5">
            <a
              href="/contact/"
              aria-current={current === "contact" ? "page" : undefined}
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>

      <div className="topbar__cta reveal" data-delay="6">
        <a className="pill" href="#contact">
          <span className="pill__label">Demander mon diagnostic</span>
        </a>
      </div>
    </header>
  );
}
