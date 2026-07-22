import { CalendarDays } from "lucide-react";
import { formatMoney, formatPercent } from "../../utils/format";

export default function MonthlyBudgetHealth({
  currency,
  dailyLimit,
  forecast,
  progress,
  spentPercent,
}) {
  const projectedOverspend = Math.max(0, forecast.projectedDifference);

  return (
    <section className="rounded-[18px] border border-[#1B1D23] bg-[#121318] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211D16] text-[#E4BD67]">
          <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="text-[14px] font-semibold text-[#F4F1EA]">Стан місяця</h2>
          <p className="mt-1 text-[11px] text-[#777B85]">
            Минуло {progress.daysElapsed} з {progress.daysInMonth} днів
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Metric label="До кінця місяця" value={`${progress.daysLeft} днів`} />
        <Metric label="Використано бюджету" value={formatPercent(spentPercent)} />
        <Metric
          label="Рекомендований ліміт"
          value={`${formatMoney(dailyLimit, currency)} / день`}
        />
        <Metric
          label="Середні витрати"
          value={`${formatMoney(forecast.averageDailySpend, currency)} / день`}
        />
        <Metric label="Прогноз витрат" value={formatMoney(forecast.forecast, currency)} />
      </div>

      <p
        className={`mt-5 rounded-2xl px-4 py-3 text-[12px] leading-relaxed ${
          projectedOverspend > 0
            ? "bg-[#2A2119] text-[#D8A15D]"
            : "bg-[#12351F] text-[#33D17A]"
        }`}
      >
        {projectedOverspend > 0
          ? `Можлива перевитрата ${formatMoney(projectedOverspend, currency)}.`
          : "Поточний темп вкладається у план."}
      </p>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#1B1D23] pb-3 last:border-b-0 last:pb-0">
      <span className="text-[12px] text-[#777B85]">{label}</span>
      <span className="text-right text-[13px] font-semibold text-[#F4F1EA]">
        {value}
      </span>
    </div>
  );
}
