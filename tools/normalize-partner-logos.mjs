import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "partners");

/** Manual tight crops for logos with excessive transparent padding. */
const viewBoxOverrides = {
  "varta.svg": "0 78 192.756 38",
  "exide.svg": "0 74 192.756 46",
  "optima.svg": "0 66 192.756 52",
  "yuasa.svg": "0 0 192.756 192.756",
  "bosch.svg": "0 0 24 24",
  "victron.svg": "0 0 24 24",
  "uniteck.svg": "25 68 615 82",
  "rolls.svg": null, // keep trimmed bounds from paths
};

function normalizeSvg(file, svg) {
  let next = svg;

  next = next.replace(/\swidth=["'][^"']+["']/gi, "");
  next = next.replace(/\sheight=["'][^"']+["']/gi, "");

  const override = viewBoxOverrides[file];
  if (override) {
    if (/viewBox=["'][^"']+["']/i.test(next)) {
      next = next.replace(/viewBox=["'][^"']+["']/i, `viewBox="${override}"`);
    } else {
      next = next.replace(/<svg\b/i, `<svg viewBox="${override}"`);
    }
  }

  return next;
}

for (const file of fs.readdirSync(outDir)) {
  if (!file.endsWith(".svg")) continue;
  const full = path.join(outDir, file);
  const before = fs.readFileSync(full, "utf8");
  const after = normalizeSvg(file, before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    console.log("normalize", file, viewBoxOverrides[file] ?? "(trim kept)");
  }
}
