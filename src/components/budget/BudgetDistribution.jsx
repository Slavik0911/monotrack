import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatMoney, formatPercent } from "../../utils/format";

const colors = {
  planned: "#E4BD67",
  reserve: "#33D17A",
  savings: "#8EA7FF",
  unallocated: "#2A2D35",
};

export default function BudgetDistribution({ currency, summary }) {
  const items = [
    {
      color: colors.planned,
      label: "Витратні бюджети",
      value: summary.expensePlanned,
    },
    {
      color: colors.reserve,
      label: "Резерв",
      value: summary.reservePlanned,
    },
    {
      color: colors.savings,
      label: "Заощадження",
      value: summary.savingsPlanned,
    },
    {
      color: colors.unallocated,
      label: "Нерозподілено",
      value: Math.max(0, summary.unallocated),
    },
  ].filter((item) => item.value > 0);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-[18px] border border-[#1B1D23] bg-[#121318] p-5">
      <h2 className="text-[14px] font-semibold text-[#F4F1EA]">
        Розподіл бюджету
      </h2>
      <div className="mt-4 h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={4}
              stroke="none"
            >
              {items.map((item) => (
                <Cell fill={item.color} key={item.label} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div className="flex items-center justify-between gap-3" key={item.label}>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[12px] text-[#9EA3AF]">{item.label}</span>
            </div>
            <span className="text-[12px] text-[#F4F1EA]">
              {formatMoney(item.value, currency)} · {formatPercent(total > 0 ? (item.value / total) * 100 : 0)}
            </span>
          </div>
        ))}
      </div>
      {summary.unallocated < 0 ? (
        <p className="mt-4 rounded-xl bg-[#351819] px-3 py-2 text-[12px] text-[#FF8A84]">
          Заплановано більше, ніж очікуваний дохід.
        </p>
      ) : null}
    </section>
  );
}
