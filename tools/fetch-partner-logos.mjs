import fs from "fs";
import path from "path";
import https from "https";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "partners");
const UA = "OneBattSite/1.0 (partner logos)";

/** @type {{ slug: string; url: string; ext?: string }[]} */
const downloads = [
  {
    slug: "bosch",
    url: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/bosch.svg",
  },
  {
    slug: "victron",
    url: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/victronenergy.svg",
  },
  { slug: "exide", url: "https://cdn.worldvectorlogo.com/logos/exide.svg" },
  { slug: "varta", url: "https://cdn.worldvectorlogo.com/logos/varta-2.svg" },
  { slug: "yuasa", url: "https://cdn.worldvectorlogo.com/logos/yuasa.svg" },
  {
    slug: "optima",
    url: "https://cdn.worldvectorlogo.com/logos/optima-batteries.svg",
  },
  {
    slug: "uniteck",
    url: "https://uniteck.fr/wp-content/uploads/Logo_Uniteck_Blanc.svg",
  },
  {
    slug: "energie-mobile",
    url: "https://energiemobile.com/img/cms/Icon/EM-logo-paysage.png",
    ext: "png",
  },
  {
    slug: "rolls",
    url: "https://www.rollsbattery.com/wp-content/themes/rolls-battery/assets/images/logo-reverse.svg",
  },
  {
    slug: "enix",
    url: "https://www.enix-energies.fr/wp-content/uploads/2021/04/logo_enix.png",
    ext: "png",
  },
  {
    slug: "duracell",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Duracell_logo.svg",
  },
  {
    slug: "noco",
    url: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/NOCO-Logo-Black.svg",
  },
  {
    slug: "rombat",
    url: "https://www.rombat.ro/wp-content/themes/rombat/assets/images/logo.svg",
  },
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": UA } }, (res) => {
        if (
          [301, 302, 307, 308].includes(res.statusCode) &&
          res.headers.location
        ) {
          res.resume();
          fetchBuffer(new URL(res.headers.location, url).href)
            .then(resolve)
            .catch(reject);
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            buf: Buffer.concat(chunks),
            type: res.headers["content-type"] ?? "",
          })
        );
      })
      .on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValid(buf) {
  if (buf.length < 100) return false;
  const head = buf.slice(0, 120).toString("utf8").toLowerCase();
  return !head.includes("<!doctype html") && !head.includes("<html");
}

function extFor(url, type, buf, forced) {
  if (forced) return forced;
  if (url.endsWith(".png") || type.includes("png")) return "png";
  return "svg";
}

function wordmark(slug, label, width = 280) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 56" role="img" aria-label="${label}">
  <text x="0" y="38" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="0.12em">${label}</text>
</svg>`;
}

const fallbacks = {
  duracell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 56" role="img" aria-label="Duracell">
  <text x="0" y="38" fill="#ffffff" font-family="Arial Black, Arial, sans-serif" font-size="28" font-weight="900" letter-spacing="0.04em">DURACELL</text>
  <rect x="0" y="42" width="168" height="4" fill="#d4af37" rx="1"/>
</svg>`,
  noco: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 56" role="img" aria-label="NOCO">
  <text x="0" y="40" fill="#ffffff" font-family="Arial Black, Arial, sans-serif" font-size="34" font-weight="900" letter-spacing="0.08em">NOCO</text>
</svg>`,
  rombat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 56" role="img" aria-label="Rombat">
  <text x="0" y="38" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="0.1em">ROMBAT</text>
</svg>`,
};

fs.mkdirSync(outDir, { recursive: true });

for (const item of downloads) {
  try {
    const { status, buf, type } = await fetchBuffer(item.url);
    if (status >= 200 && status < 400 && isValid(buf)) {
      const ext = extFor(item.url, type, buf, item.ext);
      fs.writeFileSync(path.join(outDir, `${item.slug}.${ext}`), buf);
      console.log(`OK   ${item.slug}.${ext} (${buf.length} B)`);
    } else {
      throw new Error(`HTTP ${status}`);
    }
  } catch (err) {
    if (fallbacks[item.slug]) {
      fs.writeFileSync(path.join(outDir, `${item.slug}.svg`), fallbacks[item.slug]);
      console.log(`FALL ${item.slug}.svg (${err.message})`);
    } else {
      console.log(`FAIL ${item.slug} (${err.message})`);
    }
  }

  await sleep(900);
}

// Remove stale probe files
for (const stale of [
  "bosch-wm.svg",
  "bosch.bin",
  "duracell.bin",
  "victron.bin",
  "varta.png",
  "varta2.svg",
]) {
  const file = path.join(outDir, stale);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

console.log("\nFiles:", fs.readdirSync(outDir).sort().join(", "));

function stripSvgBackgrounds() {
  const bg =
    /<path fill="#fff" d="M0 0h192\.756v192\.756H0V0z"\/?>/g;

  for (const file of fs.readdirSync(outDir)) {
    if (!file.endsWith(".svg")) continue;
    const full = path.join(outDir, file);
    const svg = fs.readFileSync(full, "utf8");
    const cleaned = svg.replace(bg, "");
    if (cleaned !== svg) {
      fs.writeFileSync(full, cleaned);
      console.log("CLEAN", file);
    }
  }
}

stripSvgBackgrounds();

spawnSync(process.execPath, ["tools/normalize-partner-logos.mjs"], {
  cwd: path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
  stdio: "inherit",
});
