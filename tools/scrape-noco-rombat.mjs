import https from "https";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "OneBattSite/1.0" } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

for (const url of ["https://no.co/", "https://www.rombat.ro/"]) {
  const html = await get(url);
  console.log("\n===", url, "===");
  const svgInline = html.includes("<svg");
  console.log("has inline svg:", svgInline);
  const imgs = [
    ...html.matchAll(/(?:src|data-src|href)=["']([^"']+)["']/gi),
  ]
    .map((m) => m[1])
    .filter((u) => /logo|Logo|noco|rombat|brand|svg|png|webp/i.test(u));
  [...new Set(imgs)].slice(0, 15).forEach((u) => console.log(u));
}
