import { useState } from "react";
import { formatMoney, getCurrency } from "../utils/format";
import { getCategoryLabel } from "../utils/categoryDisplay";
import {
  getRawTransactions,
  getSignedAmount,
  getTransactionCategory,
  isIncomeTransaction,
  isTransferTransaction,
} from "../utils/transactions";

function clampPercent(value) {
  const percent = Number(value ?? 0);
  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.min(Math.max(percent, 0), 100);
}

function getPercentRange(categories) {
  const percents = categories.map((category) => clampPercent(category.percent));

  return {
    min: Math.min(...percents),
    max: Math.max(...percents),
  };
}

function getAccentOpacity(percent, range) {
  if (!Number.isFinite(range.min) || !Number.isFinite(range.max)) {
    return 0.72;
  }

  if (range.max === range.min) {
    return 0.86;
  }

  const relative = (percent - range.min) / (range.max - range.min);
  return 0.28 + relative * 0.72;
}

function shouldUseOriginalAmounts(data) {
  return Boolean(data?.selected_account?.account_currency);
}

function createEditedBreakdown(data) {
  const mode = shouldUseOriginalAmounts(data) ? "original" : "converted";
  const categories = new Map();

  getRawTransactions(data).forEach((transaction) => {
    if (
      transaction?.__excludeFromBudget ||
      isTransferTransaction(transaction) ||
      isIncomeTransaction(transaction)
    ) {
      return;
    }

    const category = getTransactionCategory(transaction);
    const amount = Math.abs(getSignedAmount(transaction, mode));
    categories.set(category, (categories.get(category) ?? 0) + amount);
  });

  const total = Array.from(categories.values()).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return Array.from(categories.entries())
    .map(([category, amount]) => ({
      amount_converted: Number(amount.toFixed(2)),
      category,
      percent: total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0,
    }))
    .sort((left, right) => right.amount_converted - left.amount_converted);
}

export default function Categories({ data }) {
  const [showAll, setShowAll] = useState(false);
  const categories = data?.__hasTransactionEdits
    ? createEditedBreakdown(data)
    : data?.global?.breakdown || [];
  const currency = getCurrency(data);
  const visibleCategories = showAll ? categories : categories.slice(0, 3);
  const canToggle = categories.length > 3;
  const percentRange = getPercentRange(visibleCategories);

  return (
    <article className="rounded-[28px] border border-[#1B1D23] bg-[#121318] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-[#F4F1EA]">Категорії</h2>

        {canToggle ? (
          <button
            className="rounded-xl bg-[#1B1D23] px-3 py-1.5 text-[12px] text-[#8B8F98] transition hover:text-[#F4F1EA]"
            type="button"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? "Згорнути" : "Всі категорії"}
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {categories.length === 0 ? (
          <p className="text-sm text-[#777B85]">Дані категорій відсутні.</p>
        ) : (
          visibleCategories.map((category) => {
            const percent = clampPercent(category.percent);
            const accentOpacity = getAccentOpacity(percent, percentRange);

            return (
              <div className="space-y-1.5" key={category.category}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-[#B9BCC5]">
                      {getCategoryLabel(category.category)}
                    </p>
                    <p className="mt-1 text-[13px] text-[#616570]">
                      {formatMoney(category.amount_converted, currency)}
                    </p>
                  </div>
                  <span
                    className="text-[12px]"
                    style={{ color: `rgba(228, 189, 103, ${accentOpacity})` }}
                  >
                    {Math.round(percent)}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#23252B]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: `rgba(228, 189, 103, ${accentOpacity})`,
                      width: `${percent}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
