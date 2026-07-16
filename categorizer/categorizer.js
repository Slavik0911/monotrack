const DEFAULT_UNKNOWN = {
  category: "unknown",
  subcategory: "unknown",
  source: "unknown",
  confidence: 0,
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeText(value) {
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

function tokenize(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(" ") : [];
}

function compileRegex(patterns) {
  return asArray(patterns?.patterns ?? patterns).map((rule) => ({
    ...rule,
    regex: new RegExp(rule.pattern, rule.flags || "iu"),
  }));
}

function addPhrase(index, phrase, payload) {
  const normalized = normalizeText(phrase);
  if (!normalized) return 0;

  const tokens = normalized.split(" ");
  const size = tokens.length;
  const existing = index.phrases.get(normalized);

  if (!existing || size > existing.size) {
    index.phrases.set(normalized, { ...payload, phrase: normalized, size });
  }

  index.maxPhraseSize = Math.max(index.maxPhraseSize, size);
  return 1;
}

function buildMerchantIndex(collections) {
  const index = { phrases: new Map(), maxPhraseSize: 1 };

  for (const collection of collections) {
    for (const merchant of asArray(collection?.merchants)) {
      const aliases = [merchant.name, ...asArray(merchant.aliases)];

      for (const alias of aliases) {
        addPhrase(index, alias, {
          type: "merchant",
          merchant: merchant.name,
          category: merchant.category,
          subcategory: merchant.subcategory,
          country: merchant.country ?? collection.locale,
          confidence: 0.99,
        });
      }
    }
  }

  return index;
}

function buildKeywordIndex(keywords) {
  const index = { phrases: new Map(), maxPhraseSize: 1 };

  for (const [category, words] of Object.entries(keywords ?? {})) {
    for (const word of asArray(words)) {
      addPhrase(index, word, {
        type: "keyword",
        category,
        subcategory: category,
        confidence: 0.78,
      });
    }
  }

  return index;
}

function findPhrase(index, text) {
  const tokens = tokenize(text);
  if (!tokens.length) return null;

  const maxSize = Math.min(index.maxPhraseSize, tokens.length);

  for (let size = maxSize; size >= 1; size -= 1) {
    for (let start = 0; start <= tokens.length - size; start += 1) {
      const phrase = tokens.slice(start, start + size).join(" ");
      const match = index.phrases.get(phrase);
      if (match) return match;
    }
  }

  return null;
}

function getDescription(transaction) {
  return [
    transaction?.description,
    transaction?.merchant,
    transaction?.merchant_name,
    transaction?.name,
    transaction?.comment,
    transaction?.purpose,
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizeMcc(value) {
  const raw = String(value ?? "").replace(/\D/g, "");
  return raw ? raw.padStart(4, "0").slice(-4) : "";
}

export function createCategorizer({
  mcc = {},
  merchantsUa = {},
  merchantsGlobal = {},
  keywords = {},
  regex = {},
  categories = {},
} = {}) {
  const merchantIndex = buildMerchantIndex([merchantsUa, merchantsGlobal]);
  const keywordIndex = buildKeywordIndex(keywords);
  const regexRules = compileRegex(regex);

  function makeResult(base, extra = {}) {
    const category = base.category ?? "unknown";
    const categoryMeta = categories[category] ?? {};

    return {
      category,
      subcategory: base.subcategory ?? category,
      label_uk: categoryMeta.label_uk ?? category,
      label_en: categoryMeta.label_en ?? category,
      group: categoryMeta.group ?? "unknown",
      source: base.source,
      confidence: base.confidence,
      ...extra,
    };
  }

  function categorize(input) {
    const transaction =
      input && typeof input === "object" ? input : { description: input };
    const description = getDescription(transaction);
    const normalizedDescription = normalizeText(description);

    const merchantMatch = findPhrase(merchantIndex, normalizedDescription);
    if (merchantMatch) {
      return makeResult(
        { ...merchantMatch, source: "merchant_dictionary" },
        { merchant: merchantMatch.merchant }
      );
    }

    let regexText = normalizedDescription;
    for (const rule of regexRules) {
      if (!rule.regex.test(regexText)) continue;

      regexText = normalizeText(regexText.replace(rule.regex, rule.replace));
      if (rule.category) {
        return makeResult({
          category: rule.category,
          subcategory: rule.subcategory ?? rule.category,
          source: "regex",
          confidence: rule.confidence ?? 0.9,
        });
      }
    }

    const keywordMatch = findPhrase(keywordIndex, regexText);
    if (keywordMatch) {
      return makeResult({
        ...keywordMatch,
        source: "keyword",
      });
    }

    const mccCode = normalizeMcc(transaction.mcc ?? transaction.mcc_code);
    const mccMatch = mccCode ? mcc[mccCode] : null;
    if (mccMatch) {
      return makeResult(
        {
          category: mccMatch.category,
          subcategory: mccMatch.subcategory,
          source: "mcc",
          confidence: 0.62,
        },
        {
          mcc: mccCode,
          mcc_name: mccMatch.name,
        }
      );
    }

    return makeResult(DEFAULT_UNKNOWN);
  }

  function categorizeTransactions(transactions) {
    return asArray(transactions).map((transaction) => ({
      ...transaction,
      categorization: categorize(transaction),
    }));
  }

  return {
    categorize,
    categorizeTransactions,
    normalizeText,
    stats: {
      merchants: merchantIndex.phrases.size,
      keywords: keywordIndex.phrases.size,
      regex: regexRules.length,
      mcc: Object.keys(mcc).length,
      categories: Object.keys(categories).length,
    },
  };
}
