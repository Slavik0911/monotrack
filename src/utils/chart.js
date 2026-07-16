import { getCategoryLabel } from "./categoryDisplay";

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

export function createChartData(data) {
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
