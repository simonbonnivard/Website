import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "partners");
const bg = /<path fill="#fff" d="M0 0h192\.756v192\.756H0V0z"\/?>/g;

for (const file of fs.readdirSync(outDir)) {
  if (!file.endsWith(".svg")) continue;
  const full = path.join(outDir, file);
  const svg = fs.readFileSync(full, "utf8");
  const cleaned = svg.replace(bg, "");
  if (cleaned !== svg) {
    fs.writeFileSync(full, cleaned);
    console.log("clean", file);
  }
}
