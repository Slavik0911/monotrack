import { TrendingDown, TrendingUp, WalletCards, PiggyBank } from "lucide-react";
import { formatMoney, formatPercent } from "../../utils/format";

const cards = [
  {
    key: "income",
    label: "Дохід за місяць",
    Icon: TrendingUp,
    tone: "text-[#F4F1EA]",
  },
  {
    key: "planned",
    label: "Заплановано",
    Icon: WalletCards,
    tone: "text-[#F4F1EA]",
  },
  {
    key: "spent",
    label: "Фактично витрачено",
    Icon: TrendingDown,
    tone: "text-[#E4BD67]",
  },
  {
    key: "remaining",
    label: "Залишок",
    Icon: PiggyBank,
    tone: "remaining",
  },
];

export default function BudgetSummaryCards({ currency, summary }) {
  const values = {
    income: {
      amount: summary.income,
      helper:
        summary.income > 0
          ? "Надходження без переказів"
          : "Доходів за місяць не знайдено",
      percent: null,
    },
    planned: {
      amount: summary.planned,
      helper:
        summary.income > 0
          ? `${formatPercent((summary.planned / summary.income) * 100)} від доходу`
          : "План без доходу",
      percent: summary.income > 0 ? (summary.planned / summary.income) * 100 : 0,
    },
    spent: {
      amount: summary.spent,
      helper:
        summary.planned > 0
          ? `${formatPercent((summary.spent / summary.planned) * 100)} від плану`
          : "Фактичні витрати",
      percent: summary.planned > 0 ? (summary.spent / summary.planned) * 100 : 0,
    },
    remaining: {
      amount: summary.income - summary.spent,
      helper: "До кінця місяця",
      percent: summary.income > 0 ? ((summary.income - summary.spent) / summary.income) * 100 : 0,
    },
  };

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ Icon, key, label, tone }) => {
        const value = values[key];
        const barWidth = Math.max(0, Math.min(100, value.percent ?? 0));
        const toneClass =
          tone === "remaining"
            ? value.amount < 0
              ? "text-[#D8A15D]"
              : "text-[#33D17A]"
            : tone;

        return (
          <article
            className="rounded-[18px] border border-[#1B1D23] bg-[#121318] p-5"
            key={key}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#777B85]">
                  {label}
                </p>
                <p className={`mt-3 text-[25px] font-semibold ${toneClass}`}>
                  {formatMoney(value.amount, currency)}
                </p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1B20] text-[#E4BD67]">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#24262D]">
              <div
                className="h-full rounded-full bg-[#E4BD67]"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#8B8F98]">{value.helper}</p>
          </article>
        );
      })}
    </section>
  );
}
