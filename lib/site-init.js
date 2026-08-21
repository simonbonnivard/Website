/* ------------------------------------------------------------------
   Entrée légère : tout ce qui ne dépend pas de la 3D.

   Three.js ne s'exécute jamais ici. Il vit dans un Web Worker qui dessine
   sur un OffscreenCanvas (voir scene.worker.js) : le thread principal se
   contente de lui transmettre la taille de la fenêtre, le pointeur et
   l'état de veille, et reste donc disponible pour répondre à l'utilisateur.
   ------------------------------------------------------------------ */

import { scheduleHeroReveal } from "./hero-reveal.js";
import { initFaqAccordion } from "./faq-accordion.js";

const FOCUS_GROUP_SELECTORS = [
  ".problems__head, .problems__card",
  ".solution__head, .solution__card",
  ".mecanisme__head, .mecanisme__card",
  ".temoignages__head, .temoignages__card, .temoignages__proof",
  ".comparatif__head, .comparatif__table-wrap, .comparatif__proof",
  ".faq__head, .faq__item, .faq__cta",
  ".final-cta__card",
];

let siteCleanup = null;

export function initSite() {
  siteCleanup?.();
  siteCleanup = null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  scheduleHeroReveal({ reducedMotion });

  let sceneApi = null;
  let visibility = null;

  /* ---------- Barre supérieure ---------- */

  function getSiteScroll() {
    return document.querySelector(".site-scroll");
  }

  function initHeroGlowFade() {
    const siteScroll = getSiteScroll();
    const stage = document.querySelector(".stage");
    if (!siteScroll || !stage) return;

    let ticking = false;

    const update = () => {
      ticking = false;

      const scrollTop = siteScroll.scrollTop;
      const scrollRect = siteScroll.getBoundingClientRect();
      const root = document.documentElement;

      root.style.setProperty("--stage-shift", `${-scrollTop}px`);

      if (stage.classList.contains("is-dormant")) {
        root.style.setProperty("--hero-glow-opacity", "0");
        return;
      }

      const glowCenterY = scrollRect.height * 0.5 - scrollTop;
      const glowReachY = scrollRect.height * 0.39;
      const fadeStart = glowReachY * 1.15;
      const fadeEnd = -glowReachY * 0.55;

      if (glowCenterY >= fadeStart) {
        root.style.removeProperty("--hero-glow-opacity");
      } else if (glowCenterY <= fadeEnd) {
        root.style.setProperty("--hero-glow-opacity", "0");
      } else {
        const t = (glowCenterY - fadeEnd) / (fadeStart - fadeEnd);
        const eased = t * t * (3 - 2 * t);
        root.style.setProperty("--hero-glow-opacity", String(eased));
      }
    };

    update();
    siteScroll.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    window.addEventListener("resize", update, { passive: true });
  }

  function initAnchorScroll() {
    const siteScroll = getSiteScroll();
    if (!siteScroll) return;

    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash) return;

      if (hash === "#") {
        e.preventDefault();
        siteScroll.scrollTo({
          top: 0,
          behavior: reducedMotion ? "auto" : "smooth",
        });
        return;
      }

      const target = document.querySelector(hash);
      if (!target || !siteScroll.contains(target)) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top -
        siteScroll.getBoundingClientRect().top +
        siteScroll.scrollTop;
      siteScroll.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  function initReviewRotator() {
    const slides = [...document.querySelectorAll(".review__slide")];
    if (slides.length < 2 || reducedMotion) return;

    const DISPLAY_MS = 5000;
    const FADE_MS = 1000;
    let index = 0;
    let timeoutId;

    const clear = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const schedule = (fn, ms) => {
      clear();
      timeoutId = window.setTimeout(fn, ms);
    };

    const show = () =>
      slides.forEach((slide, i) =>
        slide.classList.toggle("is-active", i === index)
      );

    const fadeOut = () => {
      slides[index].classList.remove("is-active");
      schedule(fadeIn, FADE_MS);
    };

    const fadeIn = () => {
      index = (index + 1) % slides.length;
      show();
      schedule(hold, FADE_MS);
    };

    const hold = () => schedule(fadeOut, DISPLAY_MS);

    hold();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clear();
        return;
      }
      if (!timeoutId) {
        show();
        hold();
      }
    });
  }

  const canvas = document.getElementById("scene");

  function hasFastWebGL() {
    let gl;
    try {
      gl = document.createElement("canvas").getContext("webgl2", {
        failIfMajorPerformanceCaveat: true,
        powerPreference: "high-performance",
      });
    } catch {
      return false;
    }
    if (!gl) return false;

    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const driver = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    return !/swiftshader|llvmpipe|software|basic render|paravirtual/i.test(
      driver
    );
  }

  function shouldSkip3D() {
    if (!canvas) return true;
    if (navigator.connection?.saveData) return true;
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      return true;
    }
    return !hasFastWebGL();
  }

  const lite =
    window.matchMedia("(max-width: 900px)").matches ||
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4;

  function stageSize() {
    const stage = document.querySelector(".stage");
    const siteScroll = getSiteScroll();
    return {
      width: stage?.clientWidth || window.innerWidth,
      height: stage?.clientHeight || window.innerHeight,
      insetTop: siteScroll?.getBoundingClientRect().top || 0,
    };
  }

  const sceneOptions = () => ({
    ...stageSize(),
    dpr: window.devicePixelRatio || 1,
    reducedMotion,
    lite,
  });

  function fail(err) {
    if (err) console.warn("[OneBatt] Scène 3D indisponible :", err);
    document.documentElement.classList.add("no-3d");
  }

  function startWorker() {
    const worker = new Worker(new URL("./scene.worker.js", import.meta.url), {
      type: "module",
    });

    worker.onmessage = ({ data }) => {
      if (data.type === "ready") {
        canvas.classList.add("is-visible");
      } else if (data.type === "failed") {
        worker.terminate();
        fail(data.reason);
      }
    };

    worker.onerror = (e) => {
      worker.terminate();
      fail(e.message || e);
    };

    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ type: "init", canvas: offscreen, ...sceneOptions() }, [
      offscreen,
    ]);

    return {
      resize: (w, h, dpr, insetTop) =>
        worker.postMessage({
          type: "resize",
          width: w,
          height: h,
          dpr,
          insetTop,
        }),
      pointer: (x, y) => worker.postMessage({ type: "pointer", x, y }),
      awake: (source, value) =>
        worker.postMessage({ type: "awake", source, value }),
      dispose: () => {
        worker.postMessage({ type: "dispose" });
        worker.terminate();
      },
    };
  }

  async function startInline() {
    const [{ createScene }, { loadLogo }] = await Promise.all([
      import("./scene.js"),
      import("./logo.js"),
    ]);

    const scene = createScene({
      ...sceneOptions(),
      canvas,
      logo: await loadLogo(),
    });
    canvas.classList.add("is-visible");

    return {
      resize: scene.resize,
      pointer: scene.setPointer,
      awake: scene.setAwake,
      dispose: scene.dispose,
    };
  }

  function bindScene(api) {
    sceneApi = api;
    let frame = 0;
    let lastW = stageSize().width;
    let lastH = stageSize().height;

    const stage = document.querySelector(".stage");
    const heroShell = document.querySelector(".hero-shell");
    const siteScroll = getSiteScroll();

    visibility =
      heroShell && "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              const visible = entry.isIntersecting;
              api.awake("view", visible);
              stage?.classList.toggle("is-dormant", !visible);
              siteScroll?.dispatchEvent(new Event("scroll"));
            },
            { root: siteScroll ?? null, threshold: 0 }
          )
        : null;
    visibility?.observe(heroShell);

    window.addEventListener(
      "resize",
      () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const { width: w, height: h, insetTop } = stageSize();
          if (w === lastW && Math.abs(h - lastH) < 80) return;
          lastW = w;
          lastH = h;
          api.resize(w, h, window.devicePixelRatio || 1, insetTop);
        });
      },
      { passive: true }
    );

    if (!reducedMotion) {
      let sentAt = 0;
      window.addEventListener(
        "pointermove",
        (e) => {
          if (e.timeStamp - sentAt < 33) return;
          sentAt = e.timeStamp;
          const rect = siteScroll?.getBoundingClientRect();
          if (!rect?.width || !rect?.height) return;
          api.pointer(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            ((e.clientY - rect.top) / rect.height) * 2 - 1
          );
        },
        { passive: true }
      );

      window.addEventListener("pointerleave", () => api.pointer(0, 0));
    }

    document.addEventListener("visibilitychange", () =>
      api.awake("tab", !document.hidden)
    );
    window.addEventListener("blur", () => api.awake("focus", false));
    window.addEventListener("focus", () => api.awake("focus", true));

    window.addEventListener("pagehide", (e) => {
      if (!e.persisted) {
        visibility?.disconnect();
        api.dispose();
      }
    });
  }

  function loadScene() {
    if (shouldSkip3D()) {
      fail();
      return;
    }

    const canOffscreen =
      typeof Worker === "function" &&
      typeof canvas.transferControlToOffscreen === "function";

    if (canOffscreen) {
      try {
        bindScene(startWorker());
      } catch (err) {
        fail(err);
      }
      return;
    }

    startInline().then(bindScene).catch(fail);
  }

  const SCENE_DELAY_MS = 300;

  function scheduleScene() {
    setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadScene, { timeout: 800 });
      } else {
        loadScene();
      }
    }, SCENE_DELAY_MS);
  }

  function initScrollReveal() {
    const items = [...document.querySelectorAll(".reveal-on-scroll")];
    if (!items.length) return;

    if (reducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const siteScroll = getSiteScroll();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: siteScroll ?? null,
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    items.forEach((el) => observer.observe(el));
  }

  function initMecanismeTimeline() {
    const list = document.querySelector(".mecanisme__list");
    if (!list) return;

    const siteScroll = getSiteScroll();
    if (!siteScroll) return;

    const markers = [...list.querySelectorAll(".mecanisme__marker")];
    if (!markers.length) return;

    const setMarkerProgress = (value) => {
      markers.forEach((marker) => {
        marker.style.setProperty("--mecanisme-marker-progress", value);
      });
    };

    if (reducedMotion) {
      list.style.setProperty("--mecanisme-track-progress", "1");
      setMarkerProgress("1");
      return;
    }

    let ticking = false;

    const section = list.closest(".mecanisme");
    const readTriggerRatio = () => {
      if (!section) return 2 / 3;
      const value = parseFloat(
        getComputedStyle(section)
          .getPropertyValue("--mecanisme-track-trigger-ratio")
          .trim()
      );
      return Number.isFinite(value) ? value : 2 / 3;
    };

    const markerCenterY = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height * 0.5;
    };

    const update = () => {
      ticking = false;

      const scrollRect = siteScroll.getBoundingClientRect();
      const viewportTriggerY =
        scrollRect.top + scrollRect.height * readTriggerRatio();
      const firstCenter = markerCenterY(markers[0]);
      const lastCenter = markerCenterY(markers[markers.length - 1]);
      const span = lastCenter - firstCenter;

      if (span <= 0) {
        list.style.setProperty("--mecanisme-track-progress", "1");
        setMarkerProgress("1");
        return;
      }

      const progress = Math.max(
        0,
        Math.min(1, (viewportTriggerY - firstCenter) / span)
      );
      list.style.setProperty(
        "--mecanisme-track-progress",
        progress.toFixed(4)
      );

      const revealFrac = 0.12;

      markers.forEach((marker, index) => {
        const markerT = (markerCenterY(marker) - firstCenter) / span;
        const isLast = index === markers.length - 1;
        const revealStart = isLast ? Math.max(0, 1 - revealFrac) : markerT;
        const localProgress = Math.max(
          0,
          Math.min(1, (progress - revealStart) / revealFrac)
        );
        marker.style.setProperty(
          "--mecanisme-marker-progress",
          localProgress.toFixed(4)
        );
      });
    };

    update();
    siteScroll.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    window.addEventListener("resize", update, { passive: true });
  }

  function initViewportFocus() {
    if (reducedMotion) return;

    const siteScroll = getSiteScroll();
    if (!siteScroll) return;

    const groups = FOCUS_GROUP_SELECTORS.map((selector) => [
      ...document.querySelectorAll(selector),
    ]).filter((group) => group.length);
    if (!groups.length) return;

    const readFocusConfig = () => {
      const root = getComputedStyle(document.documentElement);
      return {
        centerRatio:
          parseFloat(root.getPropertyValue("--focus-center-ratio").trim()) ||
          0.38,
        lerp: parseFloat(root.getPropertyValue("--focus-lerp").trim()) || 0.12,
        dimLerp:
          parseFloat(root.getPropertyValue("--focus-dim-lerp").trim()) || 0.05,
        dimScaleSmooth:
          parseFloat(
            root.getPropertyValue("--focus-dim-scale-smooth").trim()
          ) || 0.72,
      };
    };

    const strengths = new WeakMap();
    const dims = new WeakMap();
    const dimScales = new WeakMap();
    let frameId = 0;
    let lastFocusTime = performance.now();

    const smoothstep = (t) => t * t * (3 - 2 * t);

    const targetStrength = (el, viewportCenterY, reach) => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height * 0.5;
      const t = 1 - Math.min(Math.abs(centerY - viewportCenterY) / reach, 1);
      return smoothstep(t);
    };

    const neighborDim = (targets, index) => {
      const own = targets[index];
      const prev = index > 0 ? targets[index - 1] : 0;
      const next = index < targets.length - 1 ? targets[index + 1] : 0;
      return Math.max(prev, next) * (1 - own);
    };

    const tick = (now = performance.now()) => {
      frameId = 0;

      const dt = Math.min(Math.max(now - lastFocusTime, 0) / 1000, 0.032);
      lastFocusTime = now;

      const scrollRect = siteScroll.getBoundingClientRect();
      const viewportCenterY = scrollRect.top + scrollRect.height * 0.5;
      const { centerRatio, lerp, dimLerp, dimScaleSmooth } = readFocusConfig();
      const reach = scrollRect.height * centerRatio;
      const scaleAlpha = 1 - Math.exp(-dt / dimScaleSmooth);
      let animating = false;

      groups.forEach((group) => {
        const targets = group.map((el) =>
          targetStrength(el, viewportCenterY, reach)
        );

        group.forEach((el, index) => {
          const target = targets[index];
          const dimTarget = neighborDim(targets, index);

          const current = strengths.get(el) ?? 0;
          const next = current + (target - current) * lerp;
          strengths.set(el, next);
          el.style.setProperty("--focus-strength", next.toFixed(4));

          const currentDim = dims.get(el) ?? 0;
          const nextDim = currentDim + (dimTarget - currentDim) * dimLerp;
          dims.set(el, nextDim);
          el.style.setProperty("--focus-dim", nextDim.toFixed(4));

          const currentDimScale = dimScales.get(el) ?? 0;
          const nextDimScale =
            currentDimScale + (dimTarget - currentDimScale) * scaleAlpha;
          dimScales.set(el, nextDimScale);
          el.style.setProperty(
            "--focus-dim-scale-value",
            nextDimScale.toFixed(4)
          );

          if (
            Math.abs(target - next) > 0.003 ||
            Math.abs(dimTarget - nextDim) > 0.003 ||
            Math.abs(dimTarget - nextDimScale) > 0.003
          ) {
            animating = true;
          }
        });
      });

      if (animating) frameId = requestAnimationFrame(tick);
    };

    const requestTick = () => {
      if (frameId) return;
      lastFocusTime = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    tick();
    siteScroll.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
  }

  function initSmoothScroll() {
    if (reducedMotion) return () => {};

    const siteScroll = getSiteScroll();
    if (!siteScroll) return () => {};

    const LINE_TO_PX = 16;
    const MIN_VELOCITY = 0.04;

    const readConfig = () => {
      const root = getComputedStyle(document.documentElement);
      return {
        wheelGain:
          parseFloat(root.getPropertyValue("--scroll-wheel-gain").trim()) || 1.5,
        velocityScale:
          parseFloat(root.getPropertyValue("--scroll-velocity-scale").trim()) ||
          3.8,
        decay:
          parseFloat(root.getPropertyValue("--scroll-decay").trim()) || 3.4,
      };
    };

    let position = siteScroll.scrollTop;
    let velocity = 0;
    let lastTime = performance.now();
    let smoothLock = 0;
    let alive = true;
    let rafId = 0;

    const maxScroll = () =>
      Math.max(0, siteScroll.scrollHeight - siteScroll.clientHeight);

    const clamp = (value) => Math.max(0, Math.min(maxScroll(), value));

    const wheelImpulse = (e) => {
      const { wheelGain } = readConfig();
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= LINE_TO_PX;
      else if (e.deltaMode === 2) delta *= siteScroll.clientHeight;
      return delta * wheelGain;
    };

    const applyScroll = () => {
      const top = Math.round(position);
      if (top === siteScroll.scrollTop) return;
      smoothLock += 1;
      siteScroll.scrollTop = top;
      smoothLock -= 1;
    };

    const tick = (now) => {
      if (!alive) return;
      rafId = requestAnimationFrame(tick);

      const dt = Math.min(Math.max(now - lastTime, 0) / 1000, 0.032);
      lastTime = now;

      if (Math.abs(velocity) >= MIN_VELOCITY) {
        const { decay } = readConfig();
        position = clamp(position + velocity * dt);
        velocity *= Math.exp(-decay * dt);

        if (position <= 0 || position >= maxScroll()) {
          velocity = 0;
        }
      } else {
        velocity = 0;
      }

      applyScroll();
    };

    rafId = requestAnimationFrame(tick);

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) return;

      const scrollRect = siteScroll.getBoundingClientRect();
      const overScroll =
        e.clientX >= scrollRect.left &&
        e.clientX <= scrollRect.right &&
        e.clientY >= scrollRect.top &&
        e.clientY <= scrollRect.bottom;

      if (!overScroll) return;

      e.preventDefault();

      const { velocityScale } = readConfig();
      velocity += wheelImpulse(e) * velocityScale;
    };

    const onScroll = () => {
      if (smoothLock > 0 || Math.abs(velocity) >= MIN_VELOCITY) return;
      position = siteScroll.scrollTop;
    };

    const onPointerDown = () => {
      velocity = 0;
      position = siteScroll.scrollTop;
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    siteScroll.addEventListener("scroll", onScroll, { passive: true });
    siteScroll.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel, { capture: true });
      siteScroll.removeEventListener("scroll", onScroll);
      siteScroll.removeEventListener("pointerdown", onPointerDown);
    };
  }

  initHeroGlowFade();
  initAnchorScroll();
  initReviewRotator();
  initScrollReveal();
  initMecanismeTimeline();
  initViewportFocus();
  const faqAccordionCleanup = initFaqAccordion({ reducedMotion });
  const smoothScrollCleanup = initSmoothScroll();

  if (document.readyState === "complete") scheduleScene();
  else window.addEventListener("load", scheduleScene, { once: true });

  const cleanup = () => {
    faqAccordionCleanup?.();
    smoothScrollCleanup?.();
    visibility?.disconnect();
    sceneApi?.dispose();
    siteCleanup = null;
  };

  siteCleanup = cleanup;
  return cleanup;
}
