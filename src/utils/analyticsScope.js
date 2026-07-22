export const ALL_ACCOUNTS_ID = "all";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getDateKey(transaction) {
  const rawDate =
    transaction.date ??
    transaction.tx_time ??
    transaction.time ??
    transaction.created_at ??
    transaction.createdAt;

  if (!rawDate) {
    return null;
  }

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return String(rawDate).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getTransactionAbsAmount(transaction, mode = "converted") {
  if (mode === "original") {
    return (
      transaction.amount_abs_original ??
      Math.abs(toNumber(transaction.amount_original))
    );
  }

  return (
    transaction.amount_abs_converted ??
    Math.abs(toNumber(transaction.amount_converted))
  );
}

function getDailyExpenseChart(transactions, mode = "converted") {
  const days = {};

  for (const transaction of transactions) {
    if (transaction.is_transfer || transaction.type !== "expense") {
      continue;
    }

    const date = getDateKey(transaction);
    if (!date) {
      continue;
    }

    const amount = getTransactionAbsAmount(transaction, mode);

    days[date] = (days[date] || 0) + amount;
  }

  return Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => {
      const parsedDate = new Date(date);

      return {
        date,
        day: String(parsedDate.getDate()),
        label: new Intl.DateTimeFormat("uk-UA", {
          day: "numeric",
          month: "short",
        }).format(parsedDate),
        amount: Number(amount.toFixed(2)),
      };
    });
}

function getTopCategory(account) {
  const breakdown = asArray(account?.breakdown);
  return breakdown[0] ?? null;
}

function getCategoryBreakdown(transactions, totalSpent, mode = "original") {
  const categories = {};

  for (const transaction of transactions) {
    if (transaction.is_transfer || transaction.type !== "expense") {
      continue;
    }

    const category = transaction.category ?? "other";
    const amount = getTransactionAbsAmount(transaction, mode);
    categories[category] = (categories[category] || 0) + amount;
  }

  return Object.entries(categories)
    .map(([category, amount]) => ({
      category,
      amount_converted: Number(amount.toFixed(2)),
      amount_original: Number(amount.toFixed(2)),
      percent:
        totalSpent > 0 ? Number(((amount / totalSpent) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.amount_original - a.amount_original);
}

function sumTransactions(transactions, type, mode = "original") {
  return transactions.reduce((sum, transaction) => {
    if (transaction.is_transfer || transaction.type !== type) {
      return sum;
    }

    return sum + getTransactionAbsAmount(transaction, mode);
  }, 0);
}

export function createScopedAnalytics(data, selectedAccountId) {
  if (!data || selectedAccountId === ALL_ACCOUNTS_ID) {
    return data;
  }

  const account = asArray(data.by_account).find(
    (item) => item.account_id === selectedAccountId
  );

  if (!account) {
    return data;
  }

  const sourceTransactions = asArray(data.transactions).length > 0
    ? asArray(data.transactions)
    : asArray(data.global?.transactions);
  const transactions = sourceTransactions.filter(
    (transaction) => transaction.account_id === account.account_id
  );
  const usesOriginalCurrency = Boolean(account.account_currency);
  const amountMode = usesOriginalCurrency ? "original" : "converted";
  const shouldRecalculateFromTransactions = data.__hasTransactionEdits === true;
  const chartData = getDailyExpenseChart(
    transactions,
    amountMode
  );
  const currency = account.account_currency ?? data.report_base_currency;
  const income = shouldRecalculateFromTransactions
    ? sumTransactions(transactions, "income", amountMode)
    : usesOriginalCurrency
      ? toNumber(account.total_income_original, sumTransactions(transactions, "income"))
      : toNumber(account.total_income_converted);
  const spent = shouldRecalculateFromTransactions
    ? sumTransactions(transactions, "expense", amountMode)
    : usesOriginalCurrency
      ? toNumber(account.total_spent_original, sumTransactions(transactions, "expense"))
      : toNumber(account.total_spent_converted);
  const breakdown = shouldRecalculateFromTransactions
    ? getCategoryBreakdown(transactions, spent, amountMode)
    : usesOriginalCurrency
      ? account.breakdown_original ?? getCategoryBreakdown(transactions, spent)
      : asArray(account.breakdown);
  const topCategory = breakdown[0] ?? getTopCategory(account);

  return {
    ...data,
    report_base_currency: currency,
    selected_account: account,
    chartData,
    transactions,
    by_account: [account],
    global: {
      ...data.global,
      total_balance_converted: usesOriginalCurrency
        ? account.balance_original ?? account.balance_converted ?? null
        : account.balance_converted ?? null,
      total_income_converted: income,
      total_spent_converted: spent,
      previous_income_converted: usesOriginalCurrency
        ? account.previous_income_original ?? account.previous_income_converted ?? 0
        : account.previous_income_converted ?? 0,
      previous_spent_converted: usesOriginalCurrency
        ? account.previous_spent_original ?? account.previous_spent_converted ?? 0
        : account.previous_spent_converted ?? 0,
      income_change_percent: account.income_change_percent ?? null,
      spent_change_percent: account.spent_change_percent ?? null,
      net_flow_converted: usesOriginalCurrency
        ? account.net_flow_original ?? account.net_flow_converted ?? income - spent
        : account.net_flow_converted ?? income - spent,
      transactions_count: account.transactions_count ?? transactions.length,
      expenses_count:
        account.expenses_count ??
        transactions.filter((transaction) => transaction.type === "expense")
          .length,
      income_count:
        account.income_count ??
        transactions.filter((transaction) => transaction.type === "income")
          .length,
      transfer_count:
        account.transfer_count ??
        transactions.filter(
          (transaction) =>
            transaction.type === "transfer" || transaction.is_transfer
        ).length,
      accounts_count: 1,
      top_category: account.top_category ?? topCategory?.category ?? null,
      top_percent: topCategory?.percent ?? 0,
      breakdown,
      chartData,
    },
  };
}
