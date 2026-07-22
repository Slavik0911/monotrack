import {
  ArrowLeftRight,
  ArrowUpRight,
  EyeOff,
  PencilLine,
} from "lucide-react";
import { formatMoney } from "../../utils/format";
import {
  formatTransactionDateTime,
  getSignedAmount,
  getTransactionAccountLabel,
  getTransactionCategoryLabel,
  getTransactionCurrency,
  getTransactionDescription,
  getTransactionSubtitle,
  isIncomeTransaction,
  isTransferTransaction,
  shouldUseOriginalTransactionMoney,
} from "../../utils/transactions";

function getInitial(text) {
  return String(text || "О").trim().charAt(0).toUpperCase();
}

export default function TransactionRow({ currency, onEdit, transaction }) {
  const description = getTransactionDescription(transaction);
  const category = getTransactionCategoryLabel(transaction);
  const subtitle = getTransactionSubtitle(transaction) || category;
  const shouldUseOriginal = shouldUseOriginalTransactionMoney(transaction);
  const transactionCurrency = getTransactionCurrency(
    transaction,
    currency,
    shouldUseOriginal
  );
  const amount = getSignedAmount(
    transaction,
    shouldUseOriginal ? "original" : "converted"
  );
  const isIncome = isIncomeTransaction(transaction);
  const isTransfer = isTransferTransaction(transaction);
  const sign = isIncome ? "+" : "−";
  const amountClass = isIncome ? "text-[#33D17A]" : "text-[#F4F1EA]";
  const Icon = isTransfer ? ArrowLeftRight : isIncome ? ArrowUpRight : null;

  return (
    <li
      className={`grid grid-cols-1 gap-3 border-b border-[#1B1D23] py-4 last:border-b-0 md:grid-cols-[minmax(0,1.7fr)_minmax(130px,0.8fr)_minmax(110px,0.7fr)_minmax(130px,0.7fr)_40px] md:items-center ${
        transaction.__hideFromTransactions ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isIncome
              ? "bg-[#12351F] text-[#33D17A]"
              : isTransfer
                ? "bg-[#1B1D23] text-[#E4BD67]"
                : "bg-[#202229] text-[#9EA3AF]"
          }`}
        >
          {Icon ? (
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <span className="text-[12px] font-semibold">{getInitial(description)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#F4F1EA]">
            {description}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-[11px] text-[#777B85]">{subtitle}</p>
            {transaction.__excludeFromBudget ? (
              <span className="rounded-full bg-[#211D16] px-2 py-0.5 text-[10px] font-semibold text-[#E4BD67]">
                поза бюджетом
              </span>
            ) : null}
            {transaction.__hideFromTransactions ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1B1D23] px-2 py-0.5 text-[10px] font-semibold text-[#8B8F98]">
                <EyeOff className="h-3 w-3" strokeWidth={1.8} />
                приховано
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:block">
        <span className="text-[11px] text-[#6F737D] md:hidden">Категорія</span>
        <span className="inline-flex w-fit rounded-lg bg-[#1B1D23] px-3 py-1.5 text-[12px] text-[#9EA3AF]">
          {category}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 md:block">
        <span className="text-[11px] text-[#6F737D] md:hidden">Рахунок</span>
        <span className="text-[12px] text-[#8B8F98]">
          {getTransactionAccountLabel(transaction)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 md:block md:text-right">
        <span className="text-[11px] text-[#6F737D] md:hidden">Сума</span>
        <p className={`text-[13px] font-semibold ${amountClass}`}>
          {sign}
          {formatMoney(Math.abs(amount), transactionCurrency)}
        </p>
        <p className="mt-1 text-[11px] text-[#6F737D]">
          {formatTransactionDateTime(transaction)}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          aria-label="Редагувати транзакцію"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#E4BD67]"
          type="button"
          onClick={() => onEdit?.(transaction)}
        >
          <PencilLine className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </li>
  );
}
