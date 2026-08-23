import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SoftBloomPass } from "./soft-bloom-pass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* ------------------------------------------------------------------
   Cellule 3D OneBatt.

   Ce module ne touche ni au DOM ni à `window` : il est conçu pour tourner
   dans un Web Worker (voir scene.worker.js), où Three.js n'a aucune chance
   de bloquer le thread principal. L'hôte lui fournit le canvas, les
   dimensions et le logo, puis lui pousse le pointeur et l'état de veille.
   ------------------------------------------------------------------ */

const CONFIG = {
  background: 0x050506,
  accent: new THREE.Color(0xfdc700), // ambre de la marque
  accentWarm: new THREE.Color(0xff9a1f),
  cell: { radius: 1, halfHeight: 1.34, fillet: 0.1 },
  intro: 3.2,
  logo: {
    emissiveColor: 0xfff2dc,
    emissiveIntensity: 0.26,
    additiveColor: 0xffe8b8,
    additiveOpacity: 0.09,
  },
};

/**
 * Budget de rendu. Tout ce qui se paie par pixel ou par sommet passe par
 * ici : c'est le seul endroit à toucher pour rééquilibrer coût et rendu.
 * Le palier allégé sert le mobile et les machines modestes, où la cellule
 * est de toute façon trop petite pour que ces finesses se voient.
 */
function budget(lite) {
  return {
    dpr: lite ? 1 : 1.25,
    fps: lite ? 24 : 30,
    profileSeg: lite ? 6 : 8,
    latheSeg: lite ? 32 : 48,
    capSeg: lite ? 24 : 40,
    ringSeg: lite ? 40 : 56,
    arcs: lite ? 2 : 3,
    arcPath: lite ? 72 : 104,
    arcSamples: lite ? 60 : 92,
    sparks: lite ? 70 : 130,
    print: lite ? 640 : 1024,
    envMapW: lite ? 128 : 256,
    envMapH: lite ? 64 : 128,
    msaa: lite ? 2 : 6,
    anisotropy: lite ? 4 : 8,
    arcTube: lite ? 0.011 : 0.013,
    sparkTex: lite ? 32 : 64,
    sparkSize: lite ? 0.04 : 0.036,
    // Le bloom double le coût de rendu (un composeur, plusieurs passes) :
    // on le réserve aux machines qui ont déjà le budget complet.
    bloom: lite
      ? null
      : { strength: 0.13, radius: 0.82, threshold: 0.91, smoothWidth: 0.09 },
  };
}

let Q;
let reducedMotion = false;
let logo = null;

const clock = new THREE.Clock();
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const disposables = [];

let canvas, renderer, scene, camera;
let composer;
let cell, orbit, sparks;
const pulses = [];
let bolts = [];

let elapsed = 0;

// La scène dérive lentement : quelques images par seconde de moins que
// l'écran suffisent visuellement et allègent d'autant le rendu. On accumule
// le temps des images sautées.
let frameInterval = 1 / 30;
let pending = 0;

// La boucle ne tourne que si l'onglet est affiché, la fenêtre au premier
// plan et la scène effectivement visible à l'écran. Chaque source lève son
// propre drapeau ; `view` est piloté depuis le thread principal par un
// IntersectionObserver, seul capable de voir le défilement de la page.
const awake = { tab: true, focus: true, view: true };
let loopOn = false;

/* ------------------------------------------------------------------
   Setup
   ------------------------------------------------------------------ */

function init() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !!Q.bloom,
    powerPreference: "high-performance",
    // Dernier garde-fou : si la machine n'a pas de GPU utilisable, mieux
    // vaut échouer ici que rendre chaque image en logiciel. L'hôte bascule
    // alors sur le visuel de repli.
    failIfMajorPerformanceCaveat: true,
  });
  renderer.setClearColor(CONFIG.background, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;

  scene = new THREE.Scene();
  scene.background = null;

  // Long lens : évite les distorsions de perspective, comme une photo produit
  camera = new THREE.PerspectiveCamera(21, 1, 0.1, 100);
  camera.position.set(0, 0.1, 12.5);

  buildEnvironment();
  buildLights();

  cell = buildCell();
  scene.add(cell);

  orbit = new THREE.Group();
  cell.add(orbit);

  buildEnergy(orbit);

  sparks = buildSparks(Q.sparks);
  orbit.add(sparks);

  if (Q.bloom) buildComposer();
}

/**
 * Halo lumineux en post-traitement : les arcs d'énergie, le manchon imprimé
 * et les anneaux dépassent 1 en intensité (voir leurs matériaux) pour que
 * seul ce qui doit "rayonner" franchisse le seuil — le métal brossé, lui,
 * reste net.
 */
function buildComposer() {
  // Le composeur peint la scène dans une cible hors écran avant le bloom :
  // l'antialiasing "natif" du renderer (sur le framebuffer par défaut) ne
  // s'applique plus à ce stade. `samples` recrée un multi-échantillonnage
  // sur cette cible, sans quoi les arêtes du corps redeviennent crénelées
  // dès qu'un post-traitement s'ajoute.
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: Q.msaa,
    alpha: true,
  });
  composer = new EffectComposer(renderer, target);

  const bloomPass = new SoftBloomPass(
    new THREE.Vector2(1, 1),
    Q.bloom.strength,
    Q.bloom.radius,
    Q.bloom.threshold
  );
  // Transition douce autour du seuil : évite un halo aux bords rectangulaires.
  bloomPass.highPassUniforms.smoothWidth.value = Q.bloom.smoothWidth;
  // Favorise les mips les plus flous pour un halo plus rond et moins net.
  bloomPass.compositeMaterial.uniforms.bloomFactors.value = [
    0.16, 0.24, 0.34, 0.44, 0.55,
  ];

  const passes = [
    (() => {
      const pass = new RenderPass(scene, camera);
      pass.clearAlpha = 0;
      return pass;
    })(),
    bloomPass,
    // Remet en place le tone mapping / la conversion d'espace colorimétrique
    // du renderer : les passes intermédiaires travaillent en linéaire brut.
    new OutputPass(),
  ];

  for (const pass of passes) composer.addPass(pass);
  // `EffectComposer.dispose()` ne libère que ses deux cibles : les passes,
  // elles, gardent les leurs — une dizaine rien que pour la pyramide de flou
  // du bloom. On les confie donc au ramassage habituel.
  disposables.push(...passes);
}

/* ------------------------------------------------------------------
   Environment + light
   ------------------------------------------------------------------ */

function buildEnvironment() {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = studioTexture(Q.envMapW, Q.envMapH);
  const envMap = pmrem.fromEquirectangular(studio).texture;

  scene.environment = envMap;
  scene.environmentIntensity = 0.52;
  scene.environmentRotation.y = 0.35;

  studio.dispose();
  pmrem.dispose();
  disposables.push(envMap);
}

/* Dégradé vertical du studio, en linéaire : plafond clair, sol quasi noir. */
const SKY_STOPS = [
  { v: 0.0, c: [0.92, 0.92, 1.0] },
  { v: 0.28, c: [0.09, 0.09, 0.11] },
  { v: 0.52, c: [0.016, 0.016, 0.02] },
  { v: 1.0, c: [0.001, 0.001, 0.002] },
];

/* Panneaux lumineux. Les valeurs dépassent 1 : c'est ce qui creuse les
   reflets spéculaires du métal, un simple blanc écrêté les aplatirait. */
const SKY_PANELS = [
  { u: 0.2, v: 0.3, ru: 0.17, rv: 0.32, c: [2.6, 2.6, 2.8] },
  { u: 0.66, v: 0.36, ru: 0.14, rv: 0.28, c: [2.0, 1.5, 0.95] },
  { u: 0.92, v: 0.24, ru: 0.11, rv: 0.22, c: [1.3, 1.2, 1.25] },
  { u: 0.08, v: 0.58, ru: 0.12, rv: 0.2, c: [1.6, 1.15, 0.65] },
];

/**
 * Petit studio calculé en projection équirectangulaire. Le PMREM le floute de
 * toute façon, donc une poignée de dégradés suffit aux reflets — là où
 * RoomEnvironment construisait puis rendait une pièce entière au démarrage.
 */
function studioTexture(width = 128, height = 64) {
  const W = width;
  const H = height;
  const data = new Uint16Array(W * H * 4);
  const half = THREE.DataUtils.toHalfFloat;

  for (let y = 0; y < H; y++) {
    const v = (y + 0.5) / H;

    let hi = 1;
    while (hi < SKY_STOPS.length - 1 && SKY_STOPS[hi].v < v) hi++;
    const a = SKY_STOPS[hi - 1];
    const b = SKY_STOPS[hi];
    const t = (v - a.v) / (b.v - a.v);

    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const rgb = [
        a.c[0] + (b.c[0] - a.c[0]) * t,
        a.c[1] + (b.c[1] - a.c[1]) * t,
        a.c[2] + (b.c[2] - a.c[2]) * t,
      ];

      for (const p of SKY_PANELS) {
        // u boucle sur 360° : la distance passe par le plus court chemin
        const du = Math.min(Math.abs(u - p.u), 1 - Math.abs(u - p.u));
        const d = (du / p.ru) ** 2 + ((v - p.v) / p.rv) ** 2;
        if (d >= 1) continue;

        const w = (1 - d) ** 2;
        rgb[0] += p.c[0] * w;
        rgb[1] += p.c[1] * w;
        rgb[2] += p.c[2] * w;
      }

      const i = (y * W + x) * 4;
      data[i] = half(rgb[0]);
      data[i + 1] = half(rgb[1]);
      data[i + 2] = half(rgb[2]);
      data[i + 3] = half(1);
    }
  }

  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function buildLights() {
  scene.add(new THREE.HemisphereLight(0x2a2430, 0x03030a, 0.42));

  const key = new THREE.DirectionalLight(0xfff6e6, 1.55);
  key.position.set(3.4, 4.2, 4.6);
  scene.add(key);

  const rimLeft = new THREE.DirectionalLight(0xffffff, 1.7);
  rimLeft.position.set(-5, 1.4, 1.8);
  scene.add(rimLeft);

  const rimBack = new THREE.DirectionalLight(0xffd090, 1.2);
  rimBack.position.set(2.6, -1.4, -4.4);
  scene.add(rimBack);

  const rimRight = new THREE.DirectionalLight(0xfff1d8, 1.2);
  rimRight.position.set(6, 0.6, -1.2);
  scene.add(rimRight);

  const accentFill = new THREE.DirectionalLight(0xffe0b0, 0.62);
  accentFill.position.set(4.8, 2.2, 2.4);
  scene.add(accentFill);

  const fill = new THREE.PointLight(0xffe8c8, 5.8, 9.5, 2);
  fill.position.set(1.6, 2.4, 1.2);
  scene.add(fill);
}

/* ------------------------------------------------------------------
   La cellule
   ------------------------------------------------------------------ */

function buildCell() {
  const { radius: R, halfHeight: H, fillet: r } = CONFIG.cell;
  const group = new THREE.Group();

  /* --- corps : silhouette tournée, bords adoucis --- */
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0d1119,
    metalness: 0.9,
    roughness: 0.36,
    clearcoat: 0.55,
    clearcoatRoughness: 0.24,
    envMapIntensity: 0.82,
    sheen: 0.12,
    sheenRoughness: 0.58,
    sheenColor: new THREE.Color(0xfff0d8),
    iridescence: 0.04,
    iridescenceIOR: 1.28,
    iridescenceThicknessRange: [120, 380],
  });
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(cellProfile(R, H, r), Q.latheSeg),
    bodyMat
  );
  group.add(body);
  disposables.push(body.geometry, bodyMat);

  /* --- manchon imprimé --- */
  const { albedo: printTex, emissive: emissiveTex } = makePrintTextures();
  const sleeveMat = new THREE.MeshStandardMaterial({
    map: printTex,
    // Le manchon reçoit des lumières fortes (rim, key) ; on assombrit
    // l'albédo pour éviter un blanc trop cru sur le logo.
    color: 0xbcbcbc,
    emissive: new THREE.Color(CONFIG.logo.emissiveColor),
    emissiveMap: emissiveTex,
    emissiveIntensity: CONFIG.logo.emissiveIntensity,
    transparent: true,
    alphaTest: 0.02,
    metalness: 0.04,
    roughness: 0.46,
    depthWrite: false,
  });
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.006, R + 0.006, 2.02, Q.latheSeg, 1, true),
    sleeveMat
  );
  sleeve.position.y = -0.07;
  // u=0.5 de l'impression est sur la face arrière, on la tourne vers la caméra
  sleeve.rotation.y = Math.PI - 0.6;
  group.add(sleeve);
  disposables.push(sleeve.geometry, sleeveMat, printTex, emissiveTex);

  const logoGlowMat = new THREE.MeshBasicMaterial({
    map: emissiveTex,
    color: CONFIG.logo.additiveColor,
    transparent: true,
    alphaTest: 0.04,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: CONFIG.logo.additiveOpacity,
  });
  const logoGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.008, R + 0.008, 2.022, Q.latheSeg, 1, true),
    logoGlowMat
  );
  logoGlow.position.copy(sleeve.position);
  logoGlow.rotation.copy(sleeve.rotation);
  group.add(logoGlow);
  disposables.push(logoGlow.geometry, logoGlowMat);

  /* --- haut usiné : isolant, capuchon, borne ---
     Ces pièces n'utilisent aucune option "physical" (ni vernis, ni
     transmission) : le matériau standard rend pareil et évite de compiler
     un second programme de shader au démarrage. */
  const steel = new THREE.MeshStandardMaterial({
    color: 0xc8bea8,
    metalness: 0.92,
    roughness: 0.3,
    envMapIntensity: 0.88,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x060910,
    metalness: 0.5,
    roughness: 0.62,
    envMapIntensity: 0.62,
  });
  disposables.push(steel, dark);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(R - r + 0.01, 0.026, 6, Q.ringSeg),
    dark
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = H - 0.005;
  group.add(collar);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(R - r - 0.012, R - r - 0.012, 0.05, Q.capSeg),
    steel
  );
  cap.position.y = H + 0.012;
  group.add(cap);

  const terminal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.33, 0.11, Q.capSeg),
    steel
  );
  terminal.position.y = H + 0.088;
  group.add(terminal);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(R - r - 0.04, R - r - 0.04, 0.04, Q.capSeg),
    steel
  );
  base.position.y = -H - 0.008;
  group.add(base);

  [collar, cap, terminal, base].forEach((m) => disposables.push(m.geometry));

  /* --- détails émissifs : anneaux lumineux --- */
  const glowMat = new THREE.MeshBasicMaterial({
    color: CONFIG.accent,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  disposables.push(glowMat);

  // Gardés au-dessus d'~1px à l'écran, sinon les anneaux fins moirent
  const ringSpecs = [
    { y: H + 0.03, radius: 0.42, tube: 0.009 },
    { y: 0.93, radius: R + 0.012, tube: 0.009 },
    { y: -1.06, radius: R + 0.012, tube: 0.009 },
  ];
  for (const s of ringSpecs) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(s.radius, s.tube, 5, Q.ringSeg),
      glowMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = s.y;
    group.add(ring);
    disposables.push(ring.geometry);
  }

  group.userData.sleeveMat = sleeveMat;
  group.userData.logoGlowMat = logoGlowMat;
  group.rotation.set(0.05, 0.4, -0.06);
  return group;
}

/** Demi-silhouette de la cellule : paroi droite, bords hauts/bas arrondis. */
function cellProfile(R, H, r, seg = Q.profileSeg) {
  const pts = [new THREE.Vector2(0.0001, -H)];

  for (let i = 0; i <= seg; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / seg);
    pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, -H + r + Math.sin(a) * r));
  }
  for (let i = 0; i <= seg; i++) {
    const a = (Math.PI / 2) * (i / seg);
    pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, H - r + Math.sin(a) * r));
  }

  pts.push(new THREE.Vector2(0.0001, H));
  return pts;
}

/* ------------------------------------------------------------------
   Électricité
   ------------------------------------------------------------------ */

const PULSE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PULSE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uWidth;
  uniform float uOffset;
  uniform float uIntensity;
  uniform vec3  uColor;
  varying vec2 vUv;

  void main() {
    float d = fract(vUv.x - uTime * uSpeed + uOffset);
    float dist = min(d, 1.0 - d);
    float pulse = exp(-pow(dist / uWidth, 2.15));
    float head = smoothstep(0.48, 1.0, pulse);
    float tail = smoothstep(0.0, 0.38, pulse) * (1.0 - head * 0.35);

    float ends = smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x));

    float alpha = (pulse * 0.98 + tail * 0.14 + 0.022) * ends * uIntensity;
    vec3 hot = vec3(1.0, 0.97, 0.86);
    vec3 col = mix(uColor, hot, head * 0.85 + tail * 0.22);

    gl_FragColor = vec4(col * (0.72 + pulse * 1.9 + head * 1.85), alpha);
  }
`;

function buildEnergy(parent) {
  const R = CONFIG.cell.radius;

  const paths = [
    {
      turns: 2.15,
      from: -1.5,
      to: 1.55,
      rad: R + 0.1,
      wob: 0.075,
      sp: 0.13,
      w: 0.022,
      off: 0.0,
      col: CONFIG.accent,
    },
    {
      turns: -1.65,
      from: 1.42,
      to: -1.38,
      rad: R + 0.22,
      wob: 0.11,
      sp: 0.1,
      w: 0.03,
      off: 0.42,
      col: CONFIG.accentWarm,
    },
    {
      turns: 2.85,
      from: -1.25,
      to: 1.7,
      rad: R + 0.36,
      wob: 0.14,
      sp: 0.08,
      w: 0.018,
      off: 0.72,
      col: CONFIG.accent,
    },
    {
      turns: -1.15,
      from: -1.6,
      to: 1.2,
      rad: R + 0.52,
      wob: 0.2,
      sp: 0.055,
      w: 0.035,
      off: 0.18,
      col: CONFIG.accentWarm,
    },
  ];

  // Chaque spirale est un tube transparent additif : elle coûte autant en
  // remplissage qu'en sommets. On n'en garde que les premières, les plus
  // proches de la cellule.
  for (const p of paths.slice(0, Q.arcs)) {
    const geo = new THREE.TubeGeometry(
      spiralCurve(p.turns, p.from, p.to, p.rad, p.wob, p.off * 6.28),
      Q.arcPath,
      Q.arcTube,
      5,
      false
    );
    const mat = new THREE.ShaderMaterial({
      vertexShader: PULSE_VERT,
      fragmentShader: PULSE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: p.sp },
        uWidth: { value: p.w },
        uOffset: { value: p.off },
        uIntensity: { value: 0 },
        uColor: { value: p.col.clone() },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    parent.add(mesh);
    pulses.push(mat);
    disposables.push(geo, mat);
  }

  if (!reducedMotion) {
    // Un seul éclair : il se redéclenche assez vite pour donner l'impression
    // d'une décharge continue, là où un second doublait le coût sans que la
    // différence se voie sur un objet de cette taille.
    bolts = [new Bolt(R + 0.05, 1.45)];
    bolts.forEach((b) => parent.add(b.mesh));
  }
}

function spiralCurve(turns, yFrom, yTo, radius, wobble, phase, samples = Q.arcSamples) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const a = phase + t * Math.PI * 2 * turns;
    const rad = radius + Math.sin(t * Math.PI * 3 + phase) * wobble;
    pts.push(
      new THREE.Vector3(
        Math.cos(a) * rad,
        THREE.MathUtils.lerp(yFrom, yTo, t),
        Math.sin(a) * rad
      )
    );
  }
  return new THREE.CatmullRomCurve3(pts);
}

/**
 * Un arc court et irrégulier qui se redéclenche à son propre rythme.
 *
 * Les formes sont tirées d'un petit jeu construit une fois pour toutes :
 * régénérer un tube à chaque flash (plusieurs fois par seconde) allouait de
 * la géométrie et renvoyait un buffer au GPU en plein milieu de l'image.
 * On y ajoute une rotation aléatoire, qui suffit à masquer la répétition.
 */
class Bolt {
  constructor(radius, span, variants = 5) {
    this.radius = radius;
    this.span = span;
    this.next = 0;
    this.flash = 0;
    this.frame = 0;

    this.material = new THREE.MeshBasicMaterial({
      // Volontairement au-delà de 1 : l'alpha additif sature déjà à 1, donc
      // c'est la seule façon de rendre l'éclair plus intense sous l'ACES.
      color: new THREE.Color().setRGB(1.25, 1.15, 0.9),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.shapes = Array.from({ length: variants }, () => this.geometry());
    this.mesh = new THREE.Mesh(this.shapes[0], this.material);
    disposables.push(this.material, ...this.shapes);
  }

  geometry() {
    const start = Math.random() * Math.PI * 2;
    const arc = (0.3 + Math.random() * 0.5) * Math.PI;
    const yA = (Math.random() - 0.5) * this.span * 2;
    const yB = THREE.MathUtils.clamp(
      yA + (Math.random() - 0.5) * 1.1,
      -this.span,
      this.span
    );

    const pts = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const taper = Math.sin(t * Math.PI); // pas de jitter aux extrémités
      const a = start + arc * t;
      const rad = this.radius + (Math.random() - 0.5) * 0.07 * taper;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * rad,
          THREE.MathUtils.lerp(yA, yB, t) + (Math.random() - 0.5) * 0.07 * taper,
          Math.sin(a) * rad
        )
      );
    }

    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 0.006, 4, false);
  }

  update(time, intensity) {
    if (time > this.next) {
      this.frame = (this.frame + 1) % this.shapes.length;
      this.mesh.geometry = this.shapes[this.frame];
      this.mesh.rotation.y = Math.random() * Math.PI * 2;
      this.next = time + 0.12 + Math.random() * 0.7;
      this.flash = 1.45;
    }
    // L'alpha additif sature à 1 : on culmine là puis on décroît sur quelques images
    this.flash *= 0.7;
    this.material.opacity = Math.min(this.flash, 1) * intensity;
  }
}

function buildSparks(count) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const rad = 1.15 + Math.pow(Math.random(), 1.6) * 1.5;
    positions[i * 3] = Math.cos(a) * rad;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3.6;
    positions[i * 3 + 2] = Math.sin(a) * rad;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const tex = radialTexture(Q.sparkTex, "rgba(255,248,228,1)");
  const mat = new THREE.PointsMaterial({
    // Un peu plus grosses : la densité a baissé, la poussière doit rester
    // aussi présente à l'œil.
    size: Q.sparkSize,
    map: tex,
    color: new THREE.Color().setRGB(1.02, 1.0, 0.82),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  disposables.push(geo, mat, tex);
  return new THREE.Points(geo, mat);
}

/* ------------------------------------------------------------------
   Textures dessinées à la volée

   OffscreenCanvas plutôt que <canvas> : c'est la seule surface 2D
   disponible dans un worker.
   ------------------------------------------------------------------ */

function radialTexture(size, inner) {
  const c = new OffscreenCanvas(size, size);
  const ctx = c.getContext("2d");
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half * 0.98);
  g.addColorStop(0, inner);
  g.addColorStop(0.14, inner);
  g.addColorStop(0.32, "rgba(255,220,120,0.35)");
  g.addColorStop(0.55, "rgba(253,170,0,0.12)");
  g.addColorStop(0.78, "rgba(253,150,0,0.04)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function featherCanvasEdges(ctx, width, height, band) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const edgeX = Math.min(x, width - 1 - x) / band;
      const edgeY = Math.min(y, height - 1 - y) / (band * 0.75);
      const fade = Math.min(1, Math.min(edgeX, edgeY));
      const i = (y * width + x) * 4;

      data[i] *= fade;
      data[i + 1] *= fade;
      data[i + 2] *= fade;
      data[i + 3] *= fade;
    }
  }

  ctx.putImageData(image, 0, 0);
}

function drawLogoEmissiveMask(ctx, image, x, y, w, h) {
  ctx.save();
  ctx.drawImage(image, x, y, w, h);
  // Masque plein blanc : l'émission ne dépend plus des couleurs atténuées du PNG.
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function makePrintTextures() {
  // Le manchon ne dépasse jamais quelques centaines de pixels à l'écran :
  // au-delà de cette taille, la texture ne coûte que de la mémoire et de la
  // bande passante GPU.
  const W = Q.print;
  const H = Math.round(W * (648 / 2048)); // ≈ circonférence / hauteur du manchon
  const albedoCanvas = new OffscreenCanvas(W, H);
  const emissiveCanvas = new OffscreenCanvas(W, H);
  const albedoCtx = albedoCanvas.getContext("2d");
  const emissiveCtx = emissiveCanvas.getContext("2d");

  albedoCtx.clearRect(0, 0, W, H);
  emissiveCtx.clearRect(0, 0, W, H);

  const mid = W * 0.5;
  const midY = H * 0.5;

  if (logo) {
    const drawW = W * 0.34;
    const drawH = (drawW * logo.height) / logo.width;
    const logoX = mid - drawW / 2;
    const logoY = midY - drawH / 2;

    albedoCtx.drawImage(logo, logoX, logoY, drawW, drawH);
    drawLogoEmissiveMask(emissiveCtx, logo, logoX, logoY, drawW, drawH);

    // filets fins de chaque côté du logo, à l'échelle de la texture
    const unit = W / 2048;
    const lineStyle = "rgba(255,255,255,0.22)";
    const emissiveLineStyle = "rgba(255,255,255,0.18)";
    albedoCtx.strokeStyle = lineStyle;
    emissiveCtx.strokeStyle = emissiveLineStyle;
    albedoCtx.lineWidth = 2 * unit;
    emissiveCtx.lineWidth = 2 * unit;
    const gap = drawW / 2 + 26 * unit;
    const len = 130 * unit;
    [
      [mid - gap - len, mid - gap],
      [mid + gap, mid + gap + len],
    ].forEach(([x1, x2]) => {
      for (const ctx of [albedoCtx, emissiveCtx]) {
        ctx.beginPath();
        ctx.moveTo(x1, midY);
        ctx.lineTo(x2, midY);
        ctx.stroke();
      }
    });
  }

  // Évite un halo bloom rectangulaire autour du logo et du manchon.
  featherCanvasEdges(emissiveCtx, W, H, Math.max(12, Math.round(W * 0.06)));

  const anisotropy = Math.min(Q.anisotropy, renderer.capabilities.getMaxAnisotropy());
  const albedo = new THREE.CanvasTexture(albedoCanvas);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.anisotropy = anisotropy;
  albedo.premultiplyAlpha = true;

  const emissive = new THREE.CanvasTexture(emissiveCanvas);
  emissive.colorSpace = THREE.SRGBColorSpace;
  emissive.anisotropy = anisotropy;

  return { albedo, emissive };
}

/* ------------------------------------------------------------------
   Mise en page
   ------------------------------------------------------------------ */

function layout(w, h, dpr, insetTop = 0) {
  // Le canvas occupe tout le viewport : chaque dixième de pixel-ratio se paie
  // au carré. On plafonne bas, quitte à perdre un peu de finesse sur les
  // arêtes — l'antialiasing matériel rattrape l'essentiel.
  renderer.setPixelRatio(Math.min(dpr || 1, Q.dpr));
  renderer.setSize(w, h, false);

  // Le cadre de référence reste la zone sous la nav ; le canvas, lui, monte
  // jusqu'en haut du viewport pour qu'aucun pixel de la scène (ni son bloom)
  // ne soit tranché à hauteur de barre. Le décalage de vue prolonge donc le
  // frustum de `insetTop` pixels vers le haut, à échelle inchangée : sans lui,
  // le même champ vertical s'étalerait sur un canvas plus haut et la cellule
  // remonterait en grossissant.
  // setViewOffset règle lui-même `aspect` (fullWidth / fullHeight) et
  // rafraîchit la matrice de projection.
  const frameH = Math.max(h - insetTop, 1);
  camera.setViewOffset(w, frameH, 0, -insetTop, w, h);

  if (composer) {
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
  }

  // Cellule à l'arrière-plan droit sur grand écran, en haut à droite en pile
  if (w < 900) {
    cell.position.set(w < 620 ? 0.25 : 0.6, 1.32, -1.4);
    cell.scale.setScalar(w < 620 ? 0.55 : 0.7);
  } else {
    const t = THREE.MathUtils.clamp((w - 900) / 800, 0, 1);
    cell.position.set(THREE.MathUtils.lerp(1.9, 2.7, t), 0.08, -0.7);
    cell.scale.setScalar(THREE.MathUtils.lerp(0.74, 0.86, t));
  }

  cell.userData.baseScale = cell.scale.x;
  cell.userData.baseY = cell.position.y;
}

/* ------------------------------------------------------------------
   Boucle
   ------------------------------------------------------------------ */

/**
 * Allume ou éteint la boucle de rendu. L'extinction est différée d'un tour
 * de pile : Three.js replanifie une image juste après le retour de `tick`,
 * et l'annuler avant qu'elle existe laisserait le rAF tourner à vide.
 */
function setLoop(on) {
  if (!renderer || on === loopOn) return;
  loopOn = on;

  if (on) {
    clock.getDelta(); // absorbe le temps passé à l'arrêt
    renderer.setAnimationLoop(tick);
  } else {
    queueMicrotask(() => {
      if (!loopOn) renderer?.setAnimationLoop(null);
    });
  }
}

function sync() {
  setLoop(!reducedMotion && awake.tab && awake.focus && awake.view);
}

function setAwake(source, value) {
  awake[source] = value;
  sync();
}

function setPointer(x, y) {
  pointer.tx = x;
  pointer.ty = y;
}

function tick() {
  // getDelta() est appelé à chaque image, même sautée : sinon le temps
  // accumulé pendant une pause partirait d'un coup dans l'animation.
  const raw = Math.min(clock.getDelta(), 0.05);

  pending += raw;
  if (pending < frameInterval) return;

  const dt = pending;
  pending = 0;

  elapsed += dt;
  const intro = currentIntro();

  pointer.x += (pointer.tx - pointer.x) * 0.045;
  pointer.y += (pointer.ty - pointer.y) * 0.045;

  orbit.rotation.y += dt * 0.16;
  sparks.rotation.y -= dt * 0.055;

  // Oscille plutôt que de tourner, pour garder la face imprimée face caméra
  cell.rotation.y = 0.4 + Math.sin(elapsed * 0.17) * 0.2 + pointer.x * 0.3;
  cell.rotation.x = 0.05 + pointer.y * 0.09;
  cell.rotation.z = -0.06 + pointer.x * 0.035;
  cell.position.y = cell.userData.baseY + Math.sin(elapsed * 0.62) * 0.07;

  camera.position.x = -pointer.x * 0.22;
  camera.position.y = 0.1 - pointer.y * 0.14;
  camera.lookAt(0, 0, 0);

  bolts.forEach((b) => b.update(elapsed, intro));

  render(intro);
}

function render(intro) {
  const breathe = reducedMotion ? 1 : 0.85 + Math.sin(elapsed * 1.1) * 0.15;

  for (const mat of pulses) {
    mat.uniforms.uTime.value = elapsed;
    mat.uniforms.uIntensity.value = intro * breathe * 0.45;
  }

  sparks.material.opacity = intro * 0.16 * breathe;

  const sleeveMat = cell.userData.sleeveMat;
  const logoGlowMat = cell.userData.logoGlowMat;
  if (sleeveMat) sleeveMat.emissiveIntensity = intro * CONFIG.logo.emissiveIntensity;
  if (logoGlowMat) logoGlowMat.opacity = intro * CONFIG.logo.additiveOpacity;

  cell.scale.setScalar(cell.userData.baseScale * (0.945 + 0.055 * intro));

  if (composer) composer.render();
  else renderer.render(scene, camera);
}

// Départ et arrivée en douceur, sans le "coup de pouce" initial d'un
// easeOut classique : la batterie se pose plutôt que de surgir.
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Fraction d'intro courante, gelée à 1 quand les animations sont coupées. */
function currentIntro() {
  return reducedMotion ? 1 : easeInOutCubic(Math.min(elapsed / CONFIG.intro, 1));
}

/* ------------------------------------------------------------------
   API
   ------------------------------------------------------------------ */

/**
 * Monte la scène sur le canvas fourni et rend une première image avant de
 * rendre la main : l'hôte peut lancer son fondu d'entrée en sachant qu'il y
 * a quelque chose à montrer.
 *
 * Les erreurs (WebGL absent, GPU inutilisable) remontent à l'appelant, qui
 * bascule la page sur le visuel de repli.
 */
export function createScene(options) {
  canvas = options.canvas;
  reducedMotion = !!options.reducedMotion;
  logo = options.logo || null;
  Q = budget(!!options.lite);
  frameInterval = 1 / Q.fps;

  init();
  // L'impression du manchon est dessinée une fois pour toutes pendant
  // init() : le bitmap décodé n'a plus de raison d'occuper la mémoire.
  logo?.close?.();
  logo = null;

  layout(options.width, options.height, options.dpr, options.insetTop);

  render(currentIntro());
  sync();

  return {
    resize(w, h, dpr, insetTop) {
      layout(w, h, dpr, insetTop);
      render(currentIntro());
    },
    setPointer,
    setAwake,
    dispose,
  };
}

function dispose() {
  loopOn = false;
  renderer?.setAnimationLoop(null);
  disposables.forEach((d) => d?.dispose?.());
  composer?.dispose();
  composer = null;
  renderer?.dispose();
  renderer = null;
}
