import https from "https";

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

const html = await get("https://www.rombat.ro/");
const assets = [
  ...html.matchAll(/https?:\/\/[^"'\\s>]+\.(?:svg|png|webp|jpg)/gi),
].map((m) => m[0]);

console.log([...new Set(assets)].filter((u) => /logo|Logo|brand|header|sigla|sigl/i.test(u)).join("\n"));
console.log("\n--- all wp-content ---");
console.log(
  [...new Set(assets)]
    .filter((u) => u.includes("wp-content"))
    .slice(0, 20)
    .join("\n")
);
