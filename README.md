# OneBatt — section hero

Hero sombre et minimal : la cellule OneBatt rendue en direct en WebGL,
enveloppée d'arcs d'énergie ambrée, à l'arrière-plan droit — le vrai logo est
imprimé directement sur le manchon de la cellule. À gauche, l'accroche
« L'énergie pour aller plus loin », un court paragraphe et deux CTA.

## Lancement

Le projet passe par **Next.js 15** (App Router). Three.js et GSAP viennent de
`node_modules`.

```powershell
npm install
npm run dev      # http://localhost:3000
npm run build    # génère .next/ (build de production)
npm start        # sert le build en production
```

`npm run fonts` régénère les WOFF2 dans `public/` à partir des OTF, à relancer
si une police source est remplacée.

## Fichiers

| Fichier                            | Contenu                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `app/page.jsx`                     | Page d'accueil (markup React)                                  |
| `app/layout.jsx`                   | Layout racine, metadata SEO, JSON-LD                           |
| `app/globals.css`                  | Design tokens, mise en page, typo, révélation                  |
| `components/site-client.jsx`       | Client component : branche site-init au montage                |
| `lib/site-init.js`                 | Entrée légère : révélation, barre, avis, pilotage de la scène  |
| `lib/scene.worker.js`              | Hôte worker : reçoit les messages, porte Three.js              |
| `lib/scene.js`                     | Cellule WebGL et arcs d'énergie, sans aucune dépendance au DOM |
| `lib/soft-bloom-pass.js`           | Bloom adouci pour les arcs (palier complet uniquement)         |
| `lib/logo.js`                      | Décode le logo en `ImageBitmap` pour la texture du manchon     |
| `lib/hero-reveal.js`               | Animation d'entrée du hero via GSAP                            |
| `next.config.mjs`                  | Configuration Next.js (workers WebGL)                        |
| `tools/build-fonts.mjs`            | Conversion des OTF en WOFF2                                    |
| `public/onebatt_logo_nav.png`      | Logo de la barre et favicon (407×76)                           |
| `public/onebatt_logo.png`          | Logo imprimé sur la cellule, en texture 3D                     |
| `public/hero-cell.webp`            | Rendu fixe de la cellule, affiché quand la 3D est écartée      |
| `public/DINOT.woff2` / `-Bold`     | Typographie de la marque, format servi                         |
| `DINOT.otf` / `DINOT-Bold.otf`     | Sources des polices, conservées pour régénérer les WOFF2       |
| `Pre_Prod_OneBatt.txt`             | Brief de contenu fourni par le client                          |

## ⚠️ À remplacer avant mise en ligne

- **Numéro de téléphone** — actuellement `tel:+33467000000`, sur le CTA
  « Appeler ONE BATT » du hero. Cherchez `tel:` dans `app/page.jsx`.
- **Avis Google** — les quatre avis du pied de hero sont fictifs, à remplacer
  par de vrais extraits (ou un widget) avant publication.
- **Liens de navigation** — `#services`, `#energies-embarquees`, `#a-propos`
  et `#contact` ne pointent sur aucune section existante.

## Contenu

La page comprend le hero (accroche, CTA, cellule 3D dont le manchon affiche le
logo OneBatt), le header, les avis Google en rotation, puis une section
**Problèmes** (`#problemes`) qui enchaîne sous le hero avec un fondu progressif.
Le logo 3D est chargé depuis `onebatt_logo.png` et dessiné sur la texture par
`makePrintTexture()` dans `scene.js`.

## Performance

Le thread principal ne touche jamais à Three.js. Son bundle d'entrée fait 6 Ko
(2,6 Ko en gzip) ; tout le reste vit dans un Web Worker qui dessine sur un
`OffscreenCanvas` transféré par `canvas.transferControlToOffscreen()`. Analyse
du script, construction de la scène, rendu de chaque image : rien de tout cela
ne peut plus retarder une interaction. `lib/site-init.js` se contente de relayer trois
choses au worker — la taille de la fenêtre, la position du pointeur et l'état
de veille.

### Pourquoi la 3D est parfois écartée

Sans GPU utilisable, Chrome rastérise au processeur (SwiftShader) et chaque
image bloque le thread principal des dizaines de millisecondes. C'est le cas
des serveurs qui mesurent les performances, et de quelques machines dont les
pilotes sont sur liste noire. `hasFastWebGL()` dans `lib/site-init.js` détecte la
situation avec `failIfMajorPerformanceCaveat` et le nom du pilote, avant même
de télécharger le worker : la page ajoute alors `no-3d` sur `<html>` et affiche
`hero-cell.webp`, un rendu fixe de la cellule cadré au même endroit. Même
chemin en mode économie de données, sur les appareils très limités, et sur les
navigateurs sans `OffscreenCanvas` — pour ces derniers, la scène retombe
d'abord sur le thread principal (`startInline()`).

### Côté rendu

Boucle plafonnée à 30 images/s (24 sur le palier allégé), `devicePixelRatio`
plafonné à 1,25, redimensionnement throttlé à une image. La boucle s'arrête
complètement quand l'onglet est masqué, quand la fenêtre passe en
arrière-plan, et quand la cellule sort du viewport : `.stage` reste fixe
plein écran pendant le hero ; un `IntersectionObserver` sur `.hero-shell`
(dans `bindScene()`, `lib/site-init.js`) prévient le worker dès que la zone hero n'est
plus visible. L'objet `budget()` en tête de `scene.js` rassemble tout ce qui se
paie par pixel ou par sommet, avec un palier allégé pour le mobile et les
machines à quatre cœurs ou moins.

Ce qui a été retiré ou simplifié en chemin : `RoomEnvironment` (remplacée par
une petite carte HDR `studioTexture()`), grain animé au-dessus du canvas
(refonte fixe), et bloom désactivé sur le palier allégé. Sur les machines
capables, un `SoftBloomPass` adoucit les halos des arcs d'énergie.

`dist/` contient deux fois Three.js : une fois dans le bundle du worker, une
fois dans le chunk du repli sur thread principal. Un seul des deux est
téléchargé par un visiteur donné.

_(Note : avec Next.js, le build vit dans `.next/` ; les chunks 3D sont
générés dynamiquement par le bundler.)_

### Régénérer `hero-cell.webp`

Capture d'écran de la scène en masquant `.backdrop`, `.stage__veil`, `.topbar`,
`.hero` et `.hero-foot`, puis recadrage autour de la cellule et encodage en
WebP (qualité 88). Le cadrage CSS se règle sur `.stage__poster` dans
`app/globals.css`.

## Réglages 3D

Tout ce qui vaut la peine d'être ajusté vit dans `CONFIG`, en tête de
`scene.js` :

- `accent` / `accentWarm` — couleurs des arcs, calées sur l'ambre du logo
- `cell` — proportions de la cellule (rayon, hauteur, congé)
- `intro` — durée de la mise sous tension au chargement

La durée du fondu d'entrée du canvas se règle de son côté, sur la transition
`#scene` dans `app/globals.css`.

La position et la taille de la cellule par breakpoint sont dans `layout()`,
et les trajectoires des arcs dans `buildEnergy()`.

## Comportement

- Le mouvement du curseur parallaxe la cellule et la caméra ; la cellule
  oscille plutôt que de tourner, pour garder la face imprimée vers le
  spectateur.
- Les avis Google s'enchaînent seuls : 5 s d'affichage, 1 s de fondu.
- `prefers-reduced-motion` désactive les arcs, la dérive, l'animation d'entrée
  et la rotation des avis, et affiche une image fixe.
- La cellule se fige dès qu'elle sort du viewport (page défilée, onglet
  masqué ou fenêtre en arrière-plan) et repart dès son retour à l'écran.
- Si WebGL est absent ou rendu en logiciel, la page ajoute `no-3d` sur `<html>`
  et remplace le canvas par `hero-cell.webp`, au même cadrage.

## Historique

Une version « centrée, fond photo, moins de noir » avait été tentée pour suivre
le brief à la lettre, puis une version complète (accroche, CTA, repères
chiffrés) reprenant le rendu 3D d'origine ; le client a finalement demandé une
version très épurée : logo sur la cellule, une seule phrase à gauche, rien
d'autre dans le hero.
