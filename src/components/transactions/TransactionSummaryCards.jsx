import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { formatMoney, formatNumber, getCurrency } from "../../utils/format";

function roundMoney(value, currency) {
  const number = Number(value);
  return formatMoney(Number.isFinite(number) ? Math.round(number) : value, currency);
}

function SummaryCard({ label, value, detail, tone = "default", Icon }) {
  const toneClass =
    tone === "income"
      ? "text-[#33D17A]"
      : tone === "expense"
        ? "text-[#E4BD67]"
        : "text-[#F4F1EA]";

  return (
    <article className="rounded-[18px] border border-[#1B1D23] bg-[#121318] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#777B85]">
            {label}
          </p>
          <p className={`mt-3 text-[25px] font-semibold leading-none ${toneClass}`}>
            {value}
          </p>
          {detail ? (
            <p className="mt-2 text-[11px] text-[#777B85]">{detail}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B1D23] text-[#8B8F98]">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function TransactionSummaryCards({ data }) {
  const currency = getCurrency(data);
  const balance = data?.global?.total_balance_converted;
  const income = data?.global?.total_income_converted;
  const expenses = data?.global?.total_spent_converted;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SummaryCard
        Icon={Wallet}
        label="Загальний баланс"
        value={roundMoney(balance, currency)}
        detail={`${formatNumber(data?.global?.transactions_count)} транзакцій у звіті`}
      />
      <SummaryCard
        Icon={ArrowUpRight}
        label="Доходи за місяць"
        value={`+${roundMoney(income, currency)}`}
        detail={`${formatNumber(data?.global?.income_count)} операцій`}
        tone="income"
      />
      <SummaryCard
        Icon={ArrowDownLeft}
        label="Витрати за місяць"
        value={`−${roundMoney(expenses, currency)}`}
        detail={`${formatNumber(data?.global?.expenses_count)} операцій`}
        tone="expense"
      />
    </section>
  );
}
