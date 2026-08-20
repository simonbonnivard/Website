/* Convertit les OTF de la marque en WOFF2 (~60 % plus légers).
   Les OTF restent les sources : relancer `npm run fonts` après un remplacement.
   ------------------------------------------------------------------------ */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { compress } from "wawoff2";

const FONTS = ["DINOT", "DINOT-Bold"];

await mkdir("public", { recursive: true });

for (const name of FONTS) {
  const otf = await readFile(`${name}.otf`);
  const woff2 = await compress(otf);
  await writeFile(`public/${name}.woff2`, woff2);

  const ratio = Math.round((1 - woff2.length / otf.length) * 100);
  const kb = (n) => `${Math.round(n / 1024)} Ko`;
  console.log(`${name} : ${kb(otf.length)} → ${kb(woff2.length)} (-${ratio} %)`);
}
