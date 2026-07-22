import { getCategoryLabel } from "./categoryDisplay";
import { formatCardMask } from "./card";
import { getCurrencyByCode } from "./format";

export const categoryGroups = [
  {
    id: "all",
    label: "Всі",
    categories: [],
  },
  {
    id: "supermarket",
    label: "Продукти",
    categories: ["supermarket", "groceries", "food", "restaurant", "fast_food", "coffee"],
  },
  {
    id: "clothing",
    label: "Одяг",
    categories: ["clothing", "shoes", "jewelry"],
  },
  {
    id: "electronics",
    label: "Техніка",
    categories: ["electronics", "digital"],
  },
  {
    id: "entertainment",
    label: "Розваги",
    categories: ["entertainment", "gaming", "streaming", "music"],
  },
  {
    id: "finance",
    label: "Фінанси",
    categories: ["finance", "bank_fee", "cash", "crypto", "investment", "insurance", "taxes"],
  },
  {
    id: "transfer",
    label: "Перекази",
    categories: ["transfer", "internal_transfer"],
  },
  {
    id: "services",
    label: "Сервіси",
    categories: ["cloud", "subscription", "telecom", "utilities", "utility"],
  },
  {
    id: "marketplaces",
    label: "Маркетплейси",
    categories: ["marketplaces", "shopping", "retail", "beauty", "home", "housing", "rent"],
  },
  {
    id: "transport",
    label: "Транспорт",
    categories: ["transport", "taxi", "fuel", "parking", "auto", "delivery", "flight", "travel", "hotel"],
  },
  {
    id: "income",
    label: "Доходи",
    categories: ["salary", "income"],
  },
  {
    id: "health",
    label: "Здоров'я",
    categories: ["health", "pharmacy"],
  },
  {
    id: "sport",
    label: "Спорт",
    categories: ["sport"],
  },
  {
    id: "pets",
    label: "Тварини",
    categories: ["pets"],
  },
];

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function parseNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getAccountCurrency(account) {
  return account?.account_currency ?? getCurrencyByCode(account?.currency_code);
}

function attachAccount(transaction, accountsById) {
  if (!transaction || typeof transaction !== "object") {
    return transaction;
  }

  if (transaction.__account) {
    return transaction;
  }

  const account = accountsById.get(String(transaction.account_id ?? ""));
  return account ? { ...transaction, __account: account } : transaction;
}

export function getRawTransactions(data) {
  const accounts = asArray(data?.by_account);
  const accountsById = new Map(
    accounts.map((account) => [String(account.account_id), account])
  );
  const directTransactions = asArray(data?.transactions);
  if (directTransactions.length > 0) {
    return directTransactions.map((transaction) =>
      attachAccount(transaction, accountsById)
    );
  }

  const globalTransactions = asArray(data?.global?.transactions);
  if (globalTransactions.length > 0) {
    return globalTransactions.map((transaction) =>
      attachAccount(transaction, accountsById)
    );
  }

  return accounts.flatMap((account) =>
    asArray(
      account?.transactions ??
        account?.recent_transactions ??
        account?.operations ??
        account?.statement ??
        account?.items
    ).map((transaction) => ({ ...transaction, __account: account }))
  );
}

export function getTransactionCategory(transaction) {
  return String(
    transaction?.category ??
      transaction?.category_name ??
      transaction?.mcc_group ??
      "other"
  ).toLowerCase();
}

export function getTransactionCategoryLabel(transaction) {
  const category = getTransactionCategory(transaction);
  return (
    getCategoryLabel(category, null) ??
    transaction?.category_name ??
    transaction?.category ??
    "Інше"
  );
}

export function getTransactionDescription(transaction) {
  return (
    transaction?.display_description ??
    transaction?.merchant ??
    transaction?.merchant_name ??
    transaction?.description ??
    transaction?.name ??
    transaction?.comment ??
    transaction?.purpose ??
    "Операція"
  );
}

export function getTransactionSubtitle(transaction) {
  const typeLabels = {
    expense: "Витрата",
    income: "Дохід",
    transfer: "Переказ",
  };
  const type = String(transaction?.type ?? "").toLowerCase();

  return (
    transaction?.details ??
    transaction?.mcc_description ??
    typeLabels[type] ??
    transaction?.currency ??
    ""
  );
}

export function getSignedAmount(transaction, mode = "converted") {
  if (mode === "original") {
    const original = parseNumber(transaction?.amount_original);
    if (original !== null) {
      return original;
    }
  }

  const converted = parseNumber(transaction?.amount_converted);
  if (converted !== null) {
    return converted;
  }

  const human = parseNumber(transaction?.amount_human);
  if (human !== null) {
    const raw = parseNumber(transaction?.amount);
    return raw !== null && raw < 0 ? -Math.abs(human) : human;
  }

  const raw = parseNumber(
    transaction?.amount ??
      transaction?.sum ??
      transaction?.value ??
      transaction?.total
  );

  if (raw === null) {
    return 0;
  }

  return Math.abs(raw) >= 100 ? raw / 100 : raw;
}

export function isIncomeTransaction(transaction) {
  if (transaction?.is_income === true) {
    return true;
  }

  const type = String(
    transaction?.type ?? transaction?.direction ?? transaction?.kind ?? ""
  ).toLowerCase();

  if (type.includes("income") || type.includes("credit")) {
    return true;
  }

  if (type.includes("expense") || type.includes("debit")) {
    return false;
  }

  return getSignedAmount(transaction) > 0;
}

export function isTransferTransaction(transaction) {
  const category = getTransactionCategory(transaction);
  const type = String(transaction?.type ?? "").toLowerCase();
  return (
    transaction?.is_transfer === true ||
    type === "transfer" ||
    category === "transfer" ||
    category === "internal_transfer"
  );
}

export function getTransactionDate(transaction) {
  const rawDate =
    transaction?.tx_time ??
    transaction?.time ??
    transaction?.date ??
    transaction?.created_at ??
    transaction?.createdAt ??
    transaction?.transaction_date;

  if (!rawDate) {
    return null;
  }

  const timestamp =
    typeof rawDate === "number" && rawDate < 1000000000000
      ? rawDate * 1000
      : rawDate;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(String(rawDate).slice(0, 10));
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return date;
}

export function formatTransactionDate(transaction) {
  const date = getTransactionDate(transaction);

  if (!date) {
    return { primary: "Без дати", secondary: "" };
  }

  return {
    primary: new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "short",
    })
      .format(date)
      .replace(".", ""),
    secondary: new Intl.DateTimeFormat("uk-UA", { year: "numeric" }).format(date),
  };
}

export function formatTransactionDateTime(transaction) {
  const date = getTransactionDate(transaction);

  if (!date) {
    return "Без дати";
  }

  const day = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(date);
  const time = new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${day}, ${time}`;
}

export function getTransactionAccountLabel(transaction) {
  const account = transaction?.__account ?? {};
  const value =
    transaction?.account_name ??
    transaction?.account ??
    transaction?.card ??
    transaction?.card_mask ??
    account.account_name ??
    account.name ??
    account.card ??
    account.card_mask ??
    account.masked_pan ??
    "Рахунок не вказано";

  return formatCardMask(value, Array.isArray(value) ? value[0] : value);
}

export function getTransactionCurrency(transaction, fallbackCurrency = "UAH", useOriginal = false) {
  if (!useOriginal) {
    return transaction?.report_currency ?? fallbackCurrency;
  }

  const accountCurrency = getAccountCurrency(transaction?.__account);
  const transactionCurrency = getCurrencyByCode(transaction?.currency_code);

  if (transactionCurrency && transactionCurrency !== "UAH") {
    return transactionCurrency;
  }

  return accountCurrency ?? transactionCurrency ?? fallbackCurrency;
}

export function shouldUseOriginalTransactionMoney(transaction) {
  const originalCurrency =
    getTransactionCurrency(transaction, transaction?.report_currency ?? "UAH", true);
  if (!originalCurrency) {
    return false;
  }

  return (
    parseNumber(transaction?.amount_original) !== null ||
    parseNumber(transaction?.amount_human) !== null
  );
}

export function matchesCategoryGroup(transaction, groupId) {
  if (groupId === "all") {
    return true;
  }

  const group = categoryGroups.find((item) => item.id === groupId);
  if (!group) {
    return true;
  }

  const category = getTransactionCategory(transaction);
  if (group.id === "income") {
    return isIncomeTransaction(transaction) || group.categories.includes(category);
  }

  return group.categories.includes(category);
}
