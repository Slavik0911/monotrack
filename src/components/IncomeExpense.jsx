import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatMoney, getCurrency } from "../utils/format";

function getIncome(data) {
  return (
    data?.global?.total_income_converted ??
    data?.global?.income_converted ??
    data?.global?.total_income ??
    data?.global?.income
  );
}

function formatRoundedMoney(value, currency) {
  const number = Number(value);
  return formatMoney(Number.isFinite(number) ? Math.round(number) : value, currency);
}

function getComparisonLabel(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return null;
  }

  const sign = number > 0 ? "+" : "";
  return `${sign}${Math.round(number)}% до мин. періоду`;
}

function ComparisonText({ value }) {
  const label = getComparisonLabel(value);

  if (!label) {
    return null;
  }

  const number = Number(value);

  return (
    <p
      className={`mt-1 text-[11px] ${
        number >= 0 ? "text-[#D6AE4D]" : "text-[#777B85]"
      }`}
    >
      {label}
    </p>
  );
}

export default function IncomeExpense({ data }) {
  const currency = getCurrency(data);
  const income = getIncome(data);
  const expenses = data?.global?.total_spent_converted ?? 0;
  const incomeChange = data?.global?.income_change_percent;
  const expensesChange = data?.global?.spent_change_percent;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <article className="flex min-h-[86px] items-center justify-between rounded-[24px] border border-[#1B1D23] bg-[#121318] px-5 py-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#777B85]">
            Доходи · звіт
          </p>
          <p className="mt-1.5 text-[25px] font-semibold tracking-[-0.02em] text-[#F4F1EA]">
            {formatRoundedMoney(income, currency)}
          </p>
          <ComparisonText value={incomeChange} />
          {income == null ? (
            <p className="mt-1 text-[11px] text-[#6F737D]">Немає в API</p>
          ) : null}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B1D23] text-[#8B8F98]">
          <ArrowUpRight className="h-5 w-5" strokeWidth={1.7} />
        </div>
      </article>

      <article className="flex min-h-[86px] items-center justify-between rounded-[24px] border border-[#1B1D23] bg-[#121318] px-5 py-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#777B85]">
            Трати · звіт
          </p>
          <p className="mt-1.5 text-[25px] font-semibold tracking-[-0.02em] text-[#F4F1EA]">
            {formatRoundedMoney(expenses, currency)}
          </p>
          <ComparisonText value={expensesChange} />
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#211D16] text-[#E4BD67]">
          <ArrowDownLeft className="h-5 w-5" strokeWidth={1.7} />
        </div>
      </article>
    </div>
  );
}
