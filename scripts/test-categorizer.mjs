import fs from "node:fs";
import { createCategorizer } from "../categorizer/categorizer.js";

const read = (file) =>
  JSON.parse(fs.readFileSync(new URL(`../categorizer/${file}`, import.meta.url), "utf8"));

const categorizer = createCategorizer({
  mcc: read("mcc.json"),
  merchantsUa: read("merchants_ua.json"),
  merchantsGlobal: read("merchants_global.json"),
  keywords: read("keywords.json"),
  regex: read("regex.json"),
  categories: read("categories.json"),
});

console.log(categorizer.stats);

for (const tx of [
  { description: "ZARA KYIV", mcc: 5651 },
  { description: "MAH ChVTs Nezalezhnosti", mcc: 5732 },
  { description: "Nova Poshta payment", mcc: 4215 },
  { description: "Mc Donalds Kyiv", mcc: 5814 },
  { description: "SILPO FOOD", mcc: 5411 },
  { description: "Apple.com/bill", mcc: 5818 },
  { description: "Unknown merchant", mcc: 5411 },
]) {
  const result = categorizer.categorize(tx);
  console.log(`${tx.description} => ${result.category} (${result.source})`);
}
