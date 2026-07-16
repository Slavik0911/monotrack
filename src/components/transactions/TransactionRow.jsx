import {
  ArrowLeftRight,
  ArrowUpRight,
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

export default function TransactionRow({ currency, transaction }) {
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
    <li className="grid grid-cols-1 gap-3 border-b border-[#1B1D23] py-4 last:border-b-0 md:grid-cols-[minmax(0,1.7fr)_minmax(130px,0.8fr)_minmax(110px,0.7fr)_minmax(130px,0.7fr)] md:items-center">
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
          <p className="mt-1 truncate text-[11px] text-[#777B85]">{subtitle}</p>
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
    </li>
  );
}
