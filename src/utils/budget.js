import {
  getRawTransactions,
  getSignedAmount,
  getTransactionCategory,
  getTransactionDate,
  isIncomeTransaction,
  isTransferTransaction,
  parseNumber,
} from "./transactions";

export const budgetCategories = [
  {
    id: "housing",
    label: "Житло",
    icon: "🏠",
    categories: ["home", "housing", "rent"],
    kind: "expense",
  },
  {
    id: "food",
    label: "Харчування",
    icon: "🍽️",
    categories: ["food", "restaurant", "fast_food", "coffee", "supermarket", "groceries"],
    kind: "expense",
  },
  {
    id: "shopping",
    label: "Покупки",
    icon: "🛍️",
    categories: ["shopping", "retail", "marketplaces", "clothing", "shoes", "jewelry", "electronics", "beauty"],
    kind: "expense",
  },
  {
    id: "transport",
    label: "Транспорт",
    icon: "🚗",
    categories: ["transport", "taxi", "fuel", "parking", "auto", "delivery", "travel", "hotel", "flight"],
    kind: "expense",
  },
  {
    id: "entertainment",
    label: "Розваги",
    icon: "🎮",
    categories: ["entertainment", "gaming", "streaming", "music", "subscription", "sport"],
    kind: "expense",
  },
  {
    id: "health",
    label: "Здоров'я",
    icon: "💊",
    categories: ["health", "pharmacy"],
    kind: "expense",
  },
  {
    id: "utilities",
    label: "Комунальні",
    icon: "💡",
    categories: ["utility", "utilities", "telecom", "cloud", "digital"],
    kind: "expense",
  },
  {
    id: "education",
    label: "Освіта",
    icon: "🎓",
    categories: ["education", "books"],
    kind: "expense",
  },
  {
    id: "pets",
    label: "Тварини",
    icon: "🐾",
    categories: ["pets"],
    kind: "expense",
  },
  {
    id: "other",
    label: "Інше",
    icon: "•",
    categories: ["other", "unknown"],
    kind: "expense",
  },
  {
    id: "reserve",
    label: "Резервний фонд",
    icon: "🛟",
    categories: [],
    kind: "reserve",
  },
  {
    id: "savings",
    label: "Заощадження",
    icon: "💰",
    categories: [],
    kind: "reserve",
  },
  {
    id: "investments",
    label: "Інвестиції",
    icon: "📈",
    categories: ["investment", "crypto"],
    kind: "reserve",
  },
];

const categoryToBudget = budgetCategories.reduce((map, item) => {
  item.categories.forEach((category) => {
    map.set(category, item.id);
  });
  return map;
}, new Map());

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(monthKey, offset) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return getCurrentMonthKey(date);
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function getMonthBounds(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { end, start };
}

export function getBudgetCategory(categoryId) {
  return (
    budgetCategories.find((category) => category.id === categoryId) ??
    budgetCategories.find((category) => category.id === "other")
  );
}

export function getBudgetCategoryId(transaction) {
  const category = getTransactionCategory(transaction);
  if (category === "salary" || category === "income") {
    return null;
  }

  return categoryToBudget.get(category) ?? "other";
}

export function getMonthTransactions(data, monthKey) {
  const { end, start } = getMonthBounds(monthKey);
  return getRawTransactions(data).filter((transaction) => {
    const date = getTransactionDate(transaction);
    return date && date >= start && date < end;
  });
}

export function calculateMonthlyIncome(transactions) {
  return transactions.reduce((sum, transaction) => {
    if (
      transaction?.__excludeFromBudget ||
      isTransferTransaction(transaction) ||
      !isIncomeTransaction(transaction)
    ) {
      return sum;
    }

    return sum + Math.abs(getSignedAmount(transaction, "converted"));
  }, 0);
}

export function calculateMonthlyExpenses(transactions) {
  return transactions.reduce((sum, transaction) => {
    if (
      transaction?.__excludeFromBudget ||
      isTransferTransaction(transaction) ||
      isIncomeTransaction(transaction)
    ) {
      return sum;
    }

    return sum + Math.abs(getSignedAmount(transaction, "converted"));
  }, 0);
}

export function groupTransactionsByBudgetCategory(transactions) {
  return transactions.reduce((groups, transaction) => {
    if (
      transaction?.__excludeFromBudget ||
      isTransferTransaction(transaction) ||
      isIncomeTransaction(transaction)
    ) {
      return groups;
    }

    const categoryId = getBudgetCategoryId(transaction);
    if (!categoryId) {
      return groups;
    }

    groups[categoryId] = (groups[categoryId] ?? 0) + Math.abs(getSignedAmount(transaction, "converted"));
    return groups;
  }, {});
}

export function calculatePlannedAmount(budget, income) {
  const value = parseNumber(budget?.value) ?? 0;
  if (budget?.type === "percent") {
    return (income * value) / 100;
  }

  return value;
}

export function calculateBudgetProgress(planned, spent) {
  if (planned <= 0 && spent <= 0) {
    return {
      percent: 0,
      status: "Не використано",
      tone: "idle",
    };
  }

  if (planned <= 0 && spent > 0) {
    return {
      percent: 100,
      status: "Перевитрата",
      tone: "danger",
    };
  }

  const percent = (spent / planned) * 100;
  if (percent === 0) {
    return { percent, status: "Не використано", tone: "idle" };
  }
  if (percent < 70) {
    return { percent, status: "У нормі", tone: "ok" };
  }
  if (percent < 90) {
    return { percent, status: "Увага", tone: "warn" };
  }
  if (percent <= 100) {
    return { percent, status: "Майже вичерпано", tone: "gold" };
  }

  return { percent, status: "Перевитрата", tone: "danger" };
}

export function calculateUnallocatedAmount(income, planned) {
  return income - planned;
}

export function calculateDailyLimit(planned, spent, monthKey) {
  const { end } = getMonthBounds(monthKey);
  const now = new Date();
  const monthEnd = new Date(end.getTime() - 1);
  const remainingDays =
    now > monthEnd ? 0 : Math.max(1, monthEnd.getDate() - now.getDate() + 1);
  return remainingDays > 0 ? Math.max(0, planned - spent) / remainingDays : 0;
}

export function calculateMonthProgress(monthKey) {
  const { end, start } = getMonthBounds(monthKey);
  const now = new Date();
  const daysInMonth = Math.round((end - start) / 86400000);

  if (now < start) {
    return { daysElapsed: 0, daysInMonth, daysLeft: daysInMonth, percentElapsed: 0 };
  }

  if (now >= end) {
    return { daysElapsed: daysInMonth, daysInMonth, daysLeft: 0, percentElapsed: 100 };
  }

  const daysElapsed = now.getDate();
  const daysLeft = Math.max(0, daysInMonth - daysElapsed);
  return {
    daysElapsed,
    daysInMonth,
    daysLeft,
    percentElapsed: (daysElapsed / daysInMonth) * 100,
  };
}

export function calculateForecast(spent, planned, monthKey) {
  const progress = calculateMonthProgress(monthKey);
  const averageDailySpend = progress.daysElapsed > 0 ? spent / progress.daysElapsed : 0;
  const forecast = averageDailySpend * progress.daysInMonth;
  return {
    averageDailySpend,
    forecast,
    projectedDifference: forecast - planned,
  };
}

export function buildBudgetRows(budgets, transactions, income) {
  const actualByCategory = groupTransactionsByBudgetCategory(transactions);
  const budgetByCategory = new Map(budgets.map((budget) => [budget.category, budget]));
  const categoryIds = new Set([
    ...budgets.map((budget) => budget.category),
    ...Object.keys(actualByCategory),
  ]);

  return Array.from(categoryIds)
    .filter((categoryId) => getBudgetCategory(categoryId))
    .map((categoryId) => {
      const budget = budgetByCategory.get(categoryId);
      const category = getBudgetCategory(categoryId);
      const planned = calculatePlannedAmount(budget, income);
      const spent = actualByCategory[categoryId] ?? 0;
      const remaining = planned - spent;
      const progress = calculateBudgetProgress(planned, spent);

      return {
        budget,
        category,
        categoryId,
        planned,
        progress,
        remaining,
        spent,
      };
    })
    .sort((left, right) => {
      if (left.category.kind !== right.category.kind) {
        return left.category.kind === "expense" ? -1 : 1;
      }

      return right.planned + right.spent - (left.planned + left.spent);
    });
}

function createBudgetIdPart(value) {
  return String(value ?? "all").replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function createSuggestedBudgets(month, transactions, income, accountId = "all") {
  const accountPart = createBudgetIdPart(accountId);
  const actualByCategory = groupTransactionsByBudgetCategory(transactions);
  const entries = Object.entries(actualByCategory)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const now = new Date().toISOString();
  const expenseBudgets = entries.map(([category, amount]) => ({
    category,
    created_at: now,
    id: `suggested_${month}_${accountPart}_${category}`,
    month,
    type: "fixed",
    updated_at: now,
    value: Math.ceil((amount * 1.1) / 100) * 100,
  }));

  const reserveBase = Math.max(0, income * 0.1);
  return [
    ...expenseBudgets,
    {
      category: "savings",
      created_at: now,
      id: `suggested_${month}_${accountPart}_savings`,
      month,
      type: "fixed",
      updated_at: now,
      value: Math.round(reserveBase),
    },
  ];
}

export function getBudgetInsights(rows, planned, spent, monthKey) {
  const progress = calculateMonthProgress(monthKey);
  const forecast = calculateForecast(spent, planned, monthKey);
  const overspent = rows.filter((row) => row.progress.tone === "danger");
  const nearLimit = rows.filter((row) => row.progress.tone === "gold" || row.progress.tone === "warn");
  const insights = [];

  if (overspent.length > 0) {
    const row = overspent[0];
    insights.push(`${row.category.label} перевищує план на ${Math.round(Math.abs(row.remaining)).toLocaleString("uk-UA")} ₴.`);
  }

  if (nearLimit.length > 0) {
    const row = nearLimit[0];
    insights.push(`На ${row.category.label.toLowerCase()} вже використано ${Math.round(row.progress.percent)}% бюджету, а минуло ${Math.round(progress.percentElapsed)}% місяця.`);
  }

  if (forecast.projectedDifference > 0) {
    insights.push(`За поточним темпом можлива перевитрата ${Math.round(forecast.projectedDifference).toLocaleString("uk-UA")} ₴.`);
  }

  if (planned > spent) {
    insights.push(`Щоб не вийти за план, варто витрачати не більше ${Math.round(calculateDailyLimit(planned, spent, monthKey)).toLocaleString("uk-UA")} ₴ на день.`);
  }

  if (insights.length === 0) {
    insights.push("Бюджет виглядає стабільно: критичних перевитрат за поточними даними немає.");
  }

  return insights;
}
