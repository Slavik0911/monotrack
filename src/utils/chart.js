import { getCategoryLabel } from "./categoryDisplay";
import {
  getRawTransactions,
  getSignedAmount,
  getTransactionDate,
  isIncomeTransaction,
  isTransferTransaction,
} from "./transactions";

function normalizePoint(point, index) {
  const amount =
    point.amount_converted ??
    point.total_spent_converted ??
    point.amount ??
    point.value ??
    point.total;

  return {
    label: String(point.day ?? point.date ?? point.label ?? index + 1),
    amount: Number(amount),
  };
}

function shouldUseOriginalAmounts(data) {
  return Boolean(data?.selected_account?.account_currency);
}

function createEditedTransactionChartData(data) {
  const mode = shouldUseOriginalAmounts(data) ? "original" : "converted";
  const days = new Map();

  getRawTransactions(data).forEach((transaction) => {
    if (
      transaction?.__excludeFromBudget ||
      isTransferTransaction(transaction) ||
      isIncomeTransaction(transaction)
    ) {
      return;
    }

    const date = getTransactionDate(transaction);
    if (!date) {
      return;
    }

    const dateKey = date.toISOString().slice(0, 10);
    const amount = Math.abs(getSignedAmount(transaction, mode));
    days.set(dateKey, (days.get(dateKey) ?? 0) + amount);
  });

  return Array.from(days.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateKey, amount]) => {
      const date = new Date(dateKey);

      return {
        amount: Number(amount.toFixed(2)),
        label: String(date.getDate()),
      };
    });
}

export function createChartData(data) {
  if (data?.__hasTransactionEdits) {
    return createEditedTransactionChartData(data);
  }

  const timeSeries =
    data?.chartData ??
    data?.global?.chartData ??
    data?.global?.daily ??
    data?.global?.daily_spending ??
    data?.global?.spending_by_day;

  if (Array.isArray(timeSeries) && timeSeries.length > 0) {
    return timeSeries
      .map(normalizePoint)
      .filter((point) => Number.isFinite(point.amount));
  }

  const breakdown = data?.global?.breakdown;

  if (Array.isArray(breakdown) && breakdown.length > 0) {
    return breakdown
      .map((item) => ({
        label: getCategoryLabel(item.category, item.category),
        amount: Number(item.amount_converted),
      }))
      .filter((point) => Number.isFinite(point.amount));
  }

  return [];
}
