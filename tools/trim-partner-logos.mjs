import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "partners");

/** Extract numeric tokens from SVG geometry strings. */
function numbersFrom(value) {
  return (value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
}

/** Rough bbox from path `d` attributes (good enough for trimming padding). */
function bboxFromPath(d) {
  const nums = numbersFrom(d);
  if (nums.length < 2) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function mergeBbox(a, b) {
  if (!a) return b;
  if (!b) return a;
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function trimSvg(svg) {
  const paths = [...svg.matchAll(/\sd=["']([^"']+)["']/gi)].map((m) => m[1]);
  const polys = [
    ...svg.matchAll(/\spoints=["']([^"']+)["']/gi),
  ].map((m) => m[1]);

  let bbox = null;

  for (const d of paths) {
    bbox = mergeBbox(bbox, bboxFromPath(d));
  }

  for (const points of polys) {
    bbox = mergeBbox(bbox, bboxFromPath(points.replace(/,/g, " ")));
  }

  if (!bbox) return svg;

  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;
  const pad = Math.max(w, h) * 0.06;
  const viewBox = [
    (bbox.minX - pad).toFixed(3),
    (bbox.minY - pad).toFixed(3),
    (w + pad * 2).toFixed(3),
    (h + pad * 2).toFixed(3),
  ].join(" ");

  if (/viewBox=["'][^"']+["']/i.test(svg)) {
    return svg.replace(/viewBox=["'][^"']+["']/i, `viewBox="${viewBox}"`);
  }

  return svg.replace(/<svg\b/i, `<svg viewBox="${viewBox}"`);
}

for (const file of fs.readdirSync(outDir)) {
  if (!file.endsWith(".svg")) continue;
  const full = path.join(outDir, file);
  const before = fs.readFileSync(full, "utf8");
  const after = trimSvg(before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    const vb = after.match(/viewBox=["']([^"']+)["']/i)?.[1];
    console.log("trim", file, "->", vb);
  } else {
    console.log("skip", file);
  }
}
