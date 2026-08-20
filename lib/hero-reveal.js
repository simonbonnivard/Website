import gsap from "gsap";

const TIME_SCALE = 1.5;
const STAGGER = 0.065 * TIME_SCALE;
const BASE_DELAY = 0.06 * TIME_SCALE;
const OFFSET_Y = 14;

function delayFrom(el) {
  const step = Number(el.dataset.delay) || 0;
  return BASE_DELAY + step * STAGGER;
}

function sortByDelay(elements) {
  return [...elements].sort(
    (a, b) => (Number(a.dataset.delay) || 0) - (Number(b.dataset.delay) || 0)
  );
}

/**
 * Entrée du hero (topbar + hero-shell) pilotée par GSAP.
 * Le scroll reveal et le reduced-motion restent en CSS / fallback classique.
 */
export function initHeroReveal({ reducedMotion, onComplete } = {}) {
  if (reducedMotion) {
    document.documentElement.classList.add("is-ready");
    onComplete?.();
    return null;
  }

  const root = document.documentElement;
  root.classList.add("has-hero-gsap");

  const scope = document.querySelectorAll(".topbar .reveal, .hero-shell .reveal");
  const lines = sortByDelay(document.querySelectorAll(".display .line.reveal"));
  const blocks = sortByDelay([...scope].filter((el) => !el.classList.contains("line")));

  gsap.set(lines, {
    opacity: 0,
    y: "0.22em",
    clipPath: "inset(-0.25em -12% 115% 0)",
  });
  gsap.set(blocks, { opacity: 0, y: OFFSET_Y });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      root.classList.add("is-ready");
      onComplete?.();
    },
  });

  for (const line of lines) {
    tl.to(
      line,
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(-0.25em -8% -0.35em 0)",
        duration: 0.42 * TIME_SCALE,
      },
      delayFrom(line)
    );
  }

  for (const block of blocks) {
    tl.to(
      block,
      {
        opacity: 1,
        y: 0,
        duration: 1.35 * TIME_SCALE,
      },
      delayFrom(block)
    );
  }

  return tl;
}

/**
 * Attend les polices puis lance la timeline (filet de sécurité inclus).
 */
export function scheduleHeroReveal(options = {}) {
  const run = () => requestAnimationFrame(() => initHeroReveal(options));

  if (document.fonts?.ready) {
    const safety = window.setTimeout(run, 600);
    document.fonts.ready.then(() => {
      clearTimeout(safety);
      run();
    });
    return;
  }

  run();
}
