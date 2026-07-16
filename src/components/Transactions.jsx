import {
  ArrowLeftRight,
  Car,
  Coins,
  Dog,
  GraduationCap,
  HelpCircle,
  Home,
  Lightbulb,
  Shirt,
  ShoppingBag,
  Smile,
  Truck,
  Tv,
  Utensils,
} from "lucide-react";
import { getCategoryLabel as getCategoryDisplayLabel } from "../utils/categoryDisplay";
import { formatCardMask } from "../utils/card";
import { formatMoney, getCurrency, getCurrencyByCode } from "../utils/format";

const categoryIcons = {
  supermarket: Utensils,
  food: Utensils,
  pharmacy: HelpCircle,
  clothing: Shirt,
  electronics: Tv,
  retail: ShoppingBag,
  beauty: HelpCircle,
  travel: Car,
  government: Coins,
  charity: HelpCircle,
  shopping: ShoppingBag,
  transport: Car,
  auto: Car,
  digital: Tv,
  utility: Lightbulb,
  finance: Coins,
  salary: Coins,
  pets: Dog,
  entertainment: Smile,
  delivery: Truck,
  home: Home,
  housing: Home,
  hotel: Home,
  flight: Car,
  fuel: Car,
  taxi: Car,
  parking: Car,
  fast_food: Utensils,
  coffee: Utensils,
  restaurant: Utensils,
  streaming: Tv,
  gaming: Smile,
  subscription: Tv,
  cloud: Tv,
  telecom: Lightbulb,
  utilities: Lightbulb,
  books: GraduationCap,
  health: HelpCircle,
  shoes: Shirt,
  jewelry: ShoppingBag,
  marketplaces: ShoppingBag,
  bank_fee: Coins,
  cash: Coins,
  investment: Coins,
  crypto: Coins,
  insurance: Coins,
  taxes: Coins,
  kids: Smile,
  sport: Smile,
  education: GraduationCap,
  transfer: ArrowLeftRight,
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function withAccount(transaction, account) {
  if (transaction && typeof transaction === "object") {
    return { ...transaction, __account: account };
  }

  return { description: String(transaction ?? ""), __account: account };
}

function getAccountTransactions(account) {
  const sources = [
    account?.transactions,
    account?.recent_transactions,
    account?.operations,
    account?.statement,
    account?.items,
  ];
  const source = sources.find((item) => asArray(item).length > 0);

  return asArray(source).map((transaction) =>
    withAccount(transaction, account)
  );
}

function getAccountsById(data) {
  return new Map(
    asArray(data?.by_account).map((account) => [
      String(account.account_id),
      account,
    ])
  );
}

function attachAccount(transaction, accountsById) {
  if (!transaction || typeof transaction !== "object" || transaction.__account) {
    return transaction;
  }

  const account = accountsById.get(String(transaction.account_id ?? ""));
  return account ? { ...transaction, __account: account } : transaction;
}

function getTransactions(data) {
  const accountsById = getAccountsById(data);
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

  return asArray(data?.by_account).flatMap((account) =>
    getAccountTransactions(account)
  );
}

function getCategoryKey(transaction) {
  return String(
    transaction.category ??
      transaction.category_name ??
      transaction.mcc_group ??
      "other"
  ).toLowerCase();
}

function getCategoryLabel(categoryKey, transaction) {
  return (
    getCategoryDisplayLabel(categoryKey, null) ??
    transaction.category_name ??
    transaction.category ??
    "Інше"
  );
}

function getDescription(transaction) {
  return (
    transaction.description ??
    transaction.merchant ??
    transaction.name ??
    transaction.comment ??
    transaction.purpose ??
    "Операція"
  );
}

function getSubtitle(transaction) {
  const typeLabels = {
    expense: "Витрата",
    income: "Дохід",
    transfer: "Переказ",
  };
  const type = String(transaction.type ?? "").toLowerCase();

  return (
    transaction.details ??
    transaction.mcc_description ??
    typeLabels[type] ??
    transaction.currency ??
    ""
  );
}

function parseNumber(value) {
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

function getAmountValue(transaction, useOriginal = false) {
  if (useOriginal) {
    return (
      transaction.amount_original ??
      transaction.amount_human ??
      transaction.amount_converted ??
      transaction.amount ??
      transaction.sum ??
      transaction.value ??
      transaction.total ??
      0
    );
  }

  return (
    transaction.amount_converted ??
    transaction.amount ??
    transaction.sum ??
    transaction.value ??
    transaction.total ??
    0
  );
}

function shouldUseOriginalMoney(transaction) {
  return (
    Boolean(getCurrencyByCode(transaction.currency_code) || transaction.__account?.account_currency) &&
    (parseNumber(transaction.amount_original) !== null ||
      parseNumber(transaction.amount_human) !== null)
  );
}

function getOriginalCurrency(transaction, fallbackCurrency) {
  const transactionCurrency = getCurrencyByCode(transaction.currency_code);
  const accountCurrency =
    transaction.__account?.account_currency ??
    getCurrencyByCode(transaction.__account?.currency_code);

  if (transactionCurrency && transactionCurrency !== "UAH") {
    return transactionCurrency;
  }

  return accountCurrency ?? transactionCurrency ?? fallbackCurrency;
}

function isIncome(transaction, amount) {
  const direction = String(
    transaction.direction ?? transaction.type ?? transaction.kind ?? ""
  ).toLowerCase();

  if (transaction.is_income === true) {
    return true;
  }

  if (direction.includes("income") || direction.includes("credit")) {
    return true;
  }

  if (direction.includes("expense") || direction.includes("debit")) {
    return false;
  }

  return amount !== null && amount > 0;
}

function formatAmount(transaction, fallbackCurrency) {
  const useOriginal = shouldUseOriginalMoney(transaction);
  const rawAmount = getAmountValue(transaction, useOriginal);
  const parsedAmount = parseNumber(rawAmount);
  const income = isIncome(transaction, parsedAmount);
  const currency = useOriginal
    ? getOriginalCurrency(transaction, fallbackCurrency)
    : transaction.report_currency ?? fallbackCurrency;

  if (parsedAmount === null) {
    return `${income ? "+" : "-"}${rawAmount} ${currency}`;
  }

  return `${income ? "+" : "-"}${formatMoney(Math.abs(parsedAmount), currency)}`;
}

function getDateParts(transaction) {
  const rawDate =
    transaction.date ??
    transaction.time ??
    transaction.created_at ??
    transaction.createdAt ??
    transaction.transaction_date;

  if (!rawDate) {
    return { day: "-", year: "" };
  }

  const timestamp =
    typeof rawDate === "number" && rawDate < 1000000000000
      ? rawDate * 1000
      : rawDate;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return { day: String(rawDate), year: "" };
  }

  return {
    day: new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "short",
    })
      .format(date)
      .replace(".", ""),
    year: new Intl.DateTimeFormat("uk-UA", { year: "numeric" }).format(date),
  };
}

function getAccountLabel(transaction) {
  const account = transaction.__account ?? {};
  const value =
    transaction.account_name ??
    transaction.account ??
    transaction.card ??
    transaction.card_mask ??
    account.account_name ??
    account.name ??
    account.card ??
    account.card_mask ??
    account.masked_pan ??
    "Рахунок не вказано";

  return formatCardMask(value, Array.isArray(value) ? value[0] : value);
}

export default function Transactions({ data, onViewAll }) {
  const allTransactions = getTransactions(data);
  const transactions = allTransactions.slice(0, 8);
  const currency = getCurrency(data);
  const recordsCount =
    data?.global?.transactions_count || allTransactions.length || 0;

  return (
    <article className="rounded-[28px] border border-[#1B1D23] bg-[#121318] p-5 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-[#F4F1EA]">
            Останні транзакції
          </h2>
          <span className="rounded-full bg-[#211D16] px-3 py-1 text-[11px] font-medium text-[#E4BD67]">
            {recordsCount} записів
          </span>
        </div>

        <button
          className="w-fit rounded-xl bg-[#1B1D23] px-4 py-2 text-[12px] text-[#8B8F98] transition hover:text-white"
          type="button"
          onClick={onViewAll}
        >
          Переглянути всі →
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-[#1B1D23] px-4 py-10 text-center text-sm text-[#777B85]">
          API повертає кількість транзакцій, але не повертає реальний список
          операцій.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr className="border-b border-[#1B1D23] text-left text-[11px] text-[#6F737D]">
                <th className="pb-4 font-medium">Дата</th>
                <th className="pb-4 font-medium">Опис</th>
                <th className="pb-4 font-medium">Категорія</th>
                <th className="pb-4 font-medium">Рахунок</th>
                <th className="pb-4 text-right font-medium">Сума</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B1D23]">
              {transactions.map((transaction, index) => {
                  const categoryKey = getCategoryKey(transaction);
                  const Icon = categoryIcons[categoryKey] ?? HelpCircle;
                  const date = getDateParts(transaction);
                  const income = isIncome(
                    transaction,
                    parseNumber(
                      getAmountValue(transaction, shouldUseOriginalMoney(transaction))
                    )
                  );

                  return (
                    <tr
                      className="transition hover:bg-white/[0.02]"
                      key={transaction.id ?? transaction.transaction_id ?? index}
                    >
                      <td className="py-4 pr-4 text-[12px] text-[#D7D9DE]">
                        {date.day}
                        <span className="mt-1 block text-[11px] text-[#70747D]">
                          {date.year}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1B1D23] text-[#E4BD67]">
                            <Icon className="h-4 w-4" strokeWidth={1.8} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#F4F1EA]">
                              {getDescription(transaction)}
                            </p>
                            {getSubtitle(transaction) ? (
                              <p className="mt-1 text-[11px] text-[#727680]">
                                {getSubtitle(transaction)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="rounded-md bg-[#1B1D23] px-3 py-1 text-[11px] text-[#8B8F98]">
                          {getCategoryLabel(categoryKey, transaction)}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-[12px] text-[#777B85]">
                        {getAccountLabel(transaction)}
                      </td>
                      <td
                        className={`py-4 text-right text-[13px] font-medium ${
                          income ? "text-[#E4BD67]" : "text-[#F4F1EA]"
                        }`}
                      >
                        {formatAmount(transaction, currency)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
