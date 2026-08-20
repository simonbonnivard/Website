/* ------------------------------------------------------------------
   Hôte worker de la scène 3D.

   Tout Three.js vit ici : analyse du script, construction de la scène et
   rendu de chaque image. Le thread principal ne fait que transmettre la
   taille de la fenêtre, la position du pointeur et l'état de veille.
   ------------------------------------------------------------------ */

import { createScene } from "./scene.js";
import { loadLogo } from "./logo.js";

let scene = null;

// Les messages qui suivent `init` arrivent avant que la scène existe (le
// logo se télécharge). On les enchaîne derrière la même promesse plutôt que
// de les perdre.
let booting = null;

async function boot(options) {
  const logo = await loadLogo();

  try {
    scene = createScene({ ...options, logo });
  } catch (err) {
    // Contexte WebGL refusé : sur cette machine, le rendu se ferait au
    // processeur. L'hôte affichera le visuel de repli.
    self.postMessage({ type: "failed", reason: String(err) });
    return;
  }

  self.postMessage({ type: "ready" });
}

function handle(msg) {
  if (!scene) return;

  switch (msg.type) {
    case "resize":
      scene.resize(msg.width, msg.height, msg.dpr, msg.insetTop);
      break;
    case "pointer":
      scene.setPointer(msg.x, msg.y);
      break;
    case "awake":
      scene.setAwake(msg.source, msg.value);
      break;
    case "dispose":
      scene.dispose();
      scene = null;
      break;
  }
}

self.onmessage = ({ data }) => {
  if (data.type === "init") {
    booting = boot(data);
    return;
  }
  booting?.then(() => handle(data));
};
