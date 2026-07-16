import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "../utils/format";

export default function ChartCard({ chartData, currency = "UAH" }) {
  const hasData = chartData.length > 0;

  return (
    <article className="rounded-[28px] bg-[#121318] p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#F4F1EA]">
          Витрати за звіт
        </h2>
        <div className="flex items-center gap-2 text-[12px] text-[#777B85]">
          <span className="h-2 w-2 rounded-full bg-[#E4BD67]" />
          Витрати
        </div>
      </div>

      <div className="h-[190px] w-full sm:h-[218px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="spendingGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#E4BD67" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E4BD67" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#24262D"
                strokeWidth={1}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tick={{ fill: "#D6D8DD", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "#D6D8DD", fontSize: 11 }}
                width={50}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "#121318",
                  border: "1px solid #1B1D23",
                  borderRadius: 16,
                  color: "#F4F1EA",
                }}
                formatter={(value) => [formatMoney(value, currency), "Витрати"]}
                labelStyle={{ color: "#8B8F98" }}
              />
              <Area
                activeDot={{ r: 4, fill: "#E4BD67", strokeWidth: 0 }}
                dataKey="amount"
                dot={false}
                fill="url(#spendingGradient)"
                fillOpacity={1}
                stroke="#E4BD67"
                strokeWidth={1.7}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-[#1B1D23] text-sm text-[#777B85]">
            Дані для графіка відсутні в API.
          </div>
        )}
      </div>
    </article>
  );
}
