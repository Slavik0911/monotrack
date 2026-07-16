# Monotrack Categorizer

Data-driven transaction categorizer for Monotrack. The frontend can read the same category dictionary for labels, and the backend/n8n workflow can use the same matching rules instead of a large `if/else` block.

## Files

- `categorizer.js` - engine, indexes and matching priority.
- `categories.json` - category metadata and Ukrainian/English labels.
- `mcc.json` - MCC mapping with name, category and subcategory.
- `merchants_ua.json` - Ukrainian merchants and spelling aliases.
- `merchants_global.json` - international merchants and spelling aliases.
- `keywords.json` - multilingual keyword fallback.
- `regex.json` - normalization and high-confidence regex rules.

## Priority

The engine intentionally matches in this order:

1. Merchant dictionary.
2. Regex normalization / regex category rule.
3. Keywords.
4. MCC mapping.
5. `unknown`.

Merchant matches override MCC because payment processors often assign broad MCC codes. Example: `ZARA` with MCC `5651` must become `clothing` from the merchant dictionary, not a generic shopping bucket.

## Performance

`createCategorizer()` builds indexes once:

- merchant aliases are normalized into a `Map`;
- keywords are normalized into a `Map`;
- regex patterns are precompiled;
- phrase lookup scans transaction tokens as n-grams instead of looping over every merchant.

Use one categorizer instance for a batch:

```js
import { createCategorizer } from "./categorizer.js";
import mcc from "./mcc.json";
import merchantsUa from "./merchants_ua.json";
import merchantsGlobal from "./merchants_global.json";
import keywords from "./keywords.json";
import regex from "./regex.json";
import categories from "./categories.json";

const categorizer = createCategorizer({
  mcc,
  merchantsUa,
  merchantsGlobal,
  keywords,
  regex,
  categories,
});

const result = categorizer.categorize({
  description: "ZARA KYIV",
  mcc: 5651,
});
```

## Adding Merchants

Edit `merchants_ua.json` or `merchants_global.json` only:

```json
{
  "name": "Merchant Name",
  "category": "electronics",
  "subcategory": "electronics",
  "country": "UA",
  "aliases": ["merchant name", "merchantname", "merchant name online"]
}
```

Add every spelling you have seen in bank statements to `aliases`. No JS change is needed.

## Adding MCC Codes

Edit `mcc.json`:

```json
{
  "5411": {
    "name": "Grocery Stores, Supermarkets",
    "category": "supermarket",
    "subcategory": "groceries"
  }
}
```

MCC is only a fallback after merchant, regex and keywords.

## Adding Keywords

Edit `keywords.json`:

```json
{
  "coffee": ["coffee", "кава", "кав'ярня", "кофе"]
}
```

Keywords should describe a category, not one merchant. Merchant names belong in merchant dictionaries.

## Adding Regex Rules

Edit `regex.json`:

```json
{
  "pattern": "\\bm\\s*c\\s*donald'?s?\\b",
  "replace": "mcdonalds",
  "category": "fast_food",
  "subcategory": "fast_food"
}
```

If `category` is present, the regex rule returns immediately with high confidence. If you want regex to only normalize text, omit `category` and keep `replace`.

## n8n Integration

n8n Code nodes cannot import local project files directly unless you bundle or paste them into the workflow. The safe migration path is:

1. Keep the existing fetch, transaction loading, transfer detection and response shape unchanged.
2. Replace only the old hardcoded `getCategory(mcc, description)` body.
3. Create one categorizer instance before the transaction loop.
4. In the final result, keep returning `category: is_transfer ? "transfer" : categorizer.categorize(tx).category`.

This preserves the current API response shape while improving category quality.
