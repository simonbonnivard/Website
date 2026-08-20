import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "partners");
const UA = "OneBattSite/1.0";

const candidates = [
  ["varta", "https://cdn.worldvectorlogo.com/logos/varta-2.svg"],
  ["duracell", "https://cdn.worldvectorlogo.com/logos/duracell.svg"],
  ["duracell", "https://cdn.worldvectorlogo.com/logos/duracell-6.svg"],
  ["yuasa", "https://cdn.worldvectorlogo.com/logos/gs-yuasa.svg"],
  ["yuasa", "https://cdn.worldvectorlogo.com/logos/yuasa.svg"],
  ["noco", "https://cdn.worldvectorlogo.com/logos/noco.svg"],
  ["optima", "https://cdn.worldvectorlogo.com/logos/optima-batteries.svg"],
  ["optima", "https://cdn.worldvectorlogo.com/logos/optima.svg"],
  ["rolls", "https://cdn.worldvectorlogo.com/logos/rolls-royce.svg"],
  ["bosch", "https://cdn.worldvectorlogo.com/logos/bosch.svg"],
  ["exide", "https://cdn.worldvectorlogo.com/logos/exide.svg"],
  ["victron", "https://cdn.worldvectorlogo.com/logos/victron-energy.svg"],
];

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": UA } }, (res) => {
        if ([301, 302].includes(res.statusCode) && res.headers.location) {
          res.resume();
          get(new URL(res.headers.location, url).href).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
      })
      .on("error", reject);
  });
}

for (const [slug, url] of candidates) {
  try {
    const { status, buf } = await get(url);
    const ok = status === 200 && buf.length > 120 && !buf.slice(0, 15).toString().includes("<!");
    console.log(ok ? "OK " : "NO ", slug, status, buf.length, url);
    if (ok) fs.writeFileSync(path.join(outDir, `${slug}.svg`), buf);
  } catch (e) {
    console.log("ERR", slug, e.message);
  }
}
