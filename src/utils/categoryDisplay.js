import categories from "../../categorizer/categories.json";

export function getCategoryMeta(category) {
  const key = String(category ?? "unknown").toLowerCase();
  return categories[key] ?? categories.unknown ?? {};
}

export function getCategoryLabel(category, fallback = "Інше") {
  const meta = getCategoryMeta(category);
  return meta.label_uk ?? String(category ?? fallback);
}
