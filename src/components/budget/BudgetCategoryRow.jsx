import { Edit3, Trash2 } from "lucide-react";
import { formatMoney, formatPercent } from "../../utils/format";

const toneClasses = {
  danger: {
    bar: "bg-[#B9824A]",
    badge: "bg-[#2A2119] text-[#D8A15D]",
  },
  gold: {
    bar: "bg-[#E4BD67]",
    badge: "bg-[#2C2518] text-[#E4BD67]",
  },
  idle: {
    bar: "bg-[#4B4F5A]",
    badge: "bg-[#1B1D23] text-[#777B85]",
  },
  ok: {
    bar: "bg-[#33D17A]",
    badge: "bg-[#12351F] text-[#33D17A]",
  },
  warn: {
    bar: "bg-[#D6AE4D]",
    badge: "bg-[#2C2518] text-[#E4BD67]",
  },
};

export default function BudgetCategoryRow({
  currency,
  onDelete,
  onEdit,
  row,
}) {
  const tone = toneClasses[row.progress.tone] ?? toneClasses.idle;
  const percent = Math.min(140, row.progress.percent);
  const hasBudget = Boolean(row.budget);

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-[#1B1D23] px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(170px,1.25fr)_110px_110px_110px_minmax(140px,1fr)_128px_96px] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1A1B20] text-[16px]">
          {row.category.icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#F4F1EA]">
            {row.category.label}
          </p>
          <p className="mt-1 text-[11px] text-[#777B85]">
            {row.category.kind === "reserve" ? "Напрямок" : "Витратна категорія"}
          </p>
        </div>
      </div>

      <BudgetMobileMetric label="Заплановано" value={formatMoney(row.planned, currency)} />
      <BudgetMobileMetric label="Витрачено" value={formatMoney(row.spent, currency)} />
      <BudgetMobileMetric
        label="Залишилось"
        value={formatMoney(row.remaining, currency)}
        danger={row.remaining < 0}
      />

      <div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#777B85]">
          <span>Прогрес</span>
          <span>{formatPercent(row.progress.percent)}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#24262D]">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:block">
        <span className="text-[11px] text-[#6F737D] lg:hidden">Статус</span>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] ${tone.badge}`}>
          {row.progress.status}
        </span>
      </div>

      <div className="flex items-center gap-2 lg:justify-end lg:pr-3">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
          type="button"
          onClick={() => onEdit(row)}
          aria-label="Редагувати бюджет"
        >
          <Edit3 className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B8F98] transition hover:bg-[#2A2119] hover:text-[#D8A15D] disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={() => hasBudget && onDelete(row)}
          disabled={!hasBudget}
          aria-label="Видалити бюджет"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function BudgetMobileMetric({ danger = false, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 lg:block">
      <span className="text-[11px] text-[#6F737D] lg:hidden">{label}</span>
      <span className={`text-[12px] font-medium ${danger ? "text-[#D8A15D]" : "text-[#D7D9DE]"}`}>
        {value}
      </span>
    </div>
  );
}
