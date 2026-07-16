import fs from "node:fs";

const sourceWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.4 better-mcc cached sub.json";
const outputWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.5 categorizer cached sub.json";

const readJson = (file) =>
  JSON.parse(fs.readFileSync(new URL(`../categorizer/${file}`, import.meta.url), "utf8"));

const merchantsUa = readJson("merchants_ua.json");
const merchantsGlobal = readJson("merchants_global.json");
const keywords = readJson("keywords.json");
const regex = readJson("regex.json");
const mcc = readJson("mcc.json");

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-zа-яіїєґё0-9]+/giu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function collectMerchantEntries(collections) {
  const entries = new Map();

  for (const collection of collections) {
    for (const merchant of collection.merchants || []) {
      for (const alias of [merchant.name, ...(merchant.aliases || [])]) {
        const normalized = normalizeText(alias);
        if (!normalized || entries.has(normalized)) continue;
        entries.set(normalized, merchant.category);
      }
    }
  }

  return [...entries.entries()].sort((a, b) => b[0].length - a[0].length);
}

function collectKeywordEntries(keywordMap) {
  const entries = new Map();

  for (const [category, words] of Object.entries(keywordMap)) {
    for (const word of words || []) {
      const normalized = normalizeText(word);
      if (!normalized || entries.has(normalized)) continue;
      entries.set(normalized, category);
    }
  }

  return [...entries.entries()].sort((a, b) => b[0].length - a[0].length);
}

const merchantEntries = collectMerchantEntries([merchantsUa, merchantsGlobal]);
const keywordEntries = collectKeywordEntries(keywords);
const mccMap = Object.fromEntries(
  Object.entries(mcc).map(([code, item]) => [String(code).padStart(4, "0"), item.category])
);
const regexRules = (regex.patterns || []).map((rule) => [
  rule.pattern,
  rule.flags || "iu",
  rule.replace || "",
  rule.category || "",
]);

const replacement = `/**
 * Data-driven categorization.
 * Priority: merchant dictionary -> regex -> keywords -> MCC -> unknown.
 * Keep this function's output as a plain category string to preserve the API shape.
 */
const MERCHANT_ENTRIES = ${JSON.stringify(merchantEntries)};
const KEYWORD_ENTRIES = ${JSON.stringify(keywordEntries)};
const MCC_MAP = ${JSON.stringify(mccMap)};
const REGEX_RULES = ${JSON.stringify(regexRules)}.map(([pattern, flags, replace, category]) => ({
  regex: new RegExp(pattern, flags),
  replace,
  category,
}));

function normalizeCategoryText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’\\\`]/g, "")
    .replace(/[^a-zа-яіїєґё0-9]+/giu, " ")
    .trim()
    .replace(/\\s+/g, " ");
}

function entryMatches(text, phrase) {
  return text === phrase || text.includes(" " + phrase + " ") || text.startsWith(phrase + " ") || text.endsWith(" " + phrase);
}

function findEntry(entries, text) {
  const padded = " " + text + " ";
  for (const [phrase, category] of entries) {
    if (padded.includes(" " + phrase + " ")) {
      return category;
    }
  }
  return null;
}

function getCategory(mcc, description) {
  const normalizedDescription = normalizeCategoryText(description);

  const merchantCategory = findEntry(MERCHANT_ENTRIES, normalizedDescription);
  if (merchantCategory) return merchantCategory;

  let regexText = normalizedDescription;
  for (const rule of REGEX_RULES) {
    if (!rule.regex.test(regexText)) continue;
    regexText = normalizeCategoryText(regexText.replace(rule.regex, rule.replace));
    if (rule.category) return rule.category;
  }

  const keywordCategory = findEntry(KEYWORD_ENTRIES, regexText);
  if (keywordCategory) return keywordCategory;

  const mccCode = String(mcc || "").replace(/\\D/g, "").padStart(4, "0").slice(-4);
  if (mccCode && MCC_MAP[mccCode]) return MCC_MAP[mccCode];

  return "unknown";
}

`;

const workflow = JSON.parse(fs.readFileSync(sourceWorkflow, "utf8"));
const node = workflow.nodes.find(
  (item) => item.name === "Process Transactions (Categories + Transfers)1"
);

if (!node?.parameters?.jsCode) {
  throw new Error("Categorization code node was not found.");
}

const code = node.parameters.jsCode;
const start = code.indexOf("/**\n * Функція автоматичного визначення категорій");
const end = code.indexOf("/**\n * Покращена логіка детекції трансферів");

if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not find getCategory block boundaries.");
}

node.parameters.jsCode = `${code.slice(0, start)}${replacement}${code.slice(end)}`;
workflow.name = "monotrack sub v3.5 categorizer";

fs.writeFileSync(outputWorkflow, JSON.stringify(workflow, null, 2));

console.log(
  JSON.stringify(
    {
      outputWorkflow,
      merchantEntries: merchantEntries.length,
      keywordEntries: keywordEntries.length,
      mccCodes: Object.keys(mccMap).length,
      regexRules: regexRules.length,
      codeChars: node.parameters.jsCode.length,
    },
    null,
    2
  )
);
