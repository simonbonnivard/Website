import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "partners");
const UA = "OneBattSite/1.0";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": UA } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

const pages = [
  ["rombat", "https://www.rombat.ro/"],
  ["uniteck", "https://uniteck.fr/"],
  ["energie-mobile", "https://energiemobile.com/"],
  ["noco", "https://no.co/"],
  ["rolls", "https://www.rollsbattery.com/"],
  ["enix", "https://www.enix-energies.co.uk/"],
];

for (const [name, page] of pages) {
  const html = await get(page);
  const hits = [
    ...html.matchAll(/(?:src|data-src|href)=["']([^"']+\.(?:svg|png|webp))["']/gi),
  ]
    .map((m) => m[1])
    .filter((url) => /logo|brand|header|site-logo|custom-logo/i.test(url));

  console.log(`\n${name} (${page})`);
  [...new Set(hits)].slice(0, 8).forEach((u) => console.log(" ", u));
}
