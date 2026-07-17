import { Bot, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMoney } from "../../utils/format";

const quickQuestions = [
  "Де я перевитрачаю?",
  "Скільки можу витрачати на день?",
  "Який прогноз до кінця місяця?",
  "Як перерозподілити бюджет?",
];

export default function BudgetAiAssistant({
  currency,
  dailyLimit,
  forecast,
  insights,
  rows,
}) {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const mainInsight = insights[0];

  const contextAnswer = useMemo(
    () => (text) => {
      const normalized = text.toLowerCase();
      const overspent = rows.filter((row) => row.remaining < 0);

      if (normalized.includes("перевитра")) {
        return overspent.length
          ? overspent
              .slice(0, 3)
              .map(
                (row) =>
                  `${row.category.label}: перевищення ${formatMoney(Math.abs(row.remaining), currency)}.`
              )
              .join(" ")
          : "Перевитрат за поточними бюджетами немає.";
      }

      if (normalized.includes("день")) {
        return `Щоб не вийти за бюджет, витрачай не більше ${formatMoney(dailyLimit, currency)} на день.`;
      }

      if (normalized.includes("прогноз")) {
        return forecast.projectedDifference > 0
          ? `Поточний темп веде до перевитрати ${formatMoney(forecast.projectedDifference, currency)}.`
          : `Прогноз вкладається в план із запасом ${formatMoney(Math.abs(forecast.projectedDifference), currency)}.`;
      }

      if (normalized.includes("перерозпод")) {
        const lowUsage = rows.find((row) => row.planned > 0 && row.progress.percent < 35);
        const highUsage = rows.find((row) => row.progress.percent > 90);
        if (lowUsage && highUsage) {
          return `Можна перенести частину з "${lowUsage.category.label}" у "${highUsage.category.label}".`;
        }
        return "Поки немає очевидної категорії для перерозподілу.";
      }

      return mainInsight;
    },
    [currency, dailyLimit, forecast.projectedDifference, mainInsight, rows]
  );

  const ask = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAnswer(contextAnswer(trimmed));
    setQuestion("");
  };

  return (
    <section className="rounded-[18px] border border-[#1B1D23] bg-[#121318] p-5">
      <div className="flex items-center gap-3 border-b border-[#1B1D23] pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211D16] text-[#E4BD67]">
          <Bot className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="text-[14px] font-semibold text-[#F4F1EA]">AI помічник</h2>
          <p className="mt-1 text-[11px] text-[#777B85]">Локальний аналіз бюджету</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#1B1D23] bg-[#101116] p-4">
        <span className="rounded-full bg-[#211D16] px-2.5 py-1 text-[10px] font-semibold text-[#E4BD67]">
          Рекомендація
        </span>
        <p className="mt-3 text-[12px] leading-relaxed text-[#B9BCC5]">
          {mainInsight}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickQuestions.map((item) => (
          <button
            className="rounded-full border border-[#24262D] px-3 py-1.5 text-[11px] text-[#8B8F98] transition hover:border-[#E4BD67] hover:text-[#E4BD67]"
            type="button"
            key={item}
            onClick={() => ask(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <input
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#1B1D23] bg-[#1A1B20] px-3 text-[12px] text-[#F4F1EA] outline-none placeholder:text-[#666B75]"
          placeholder="Запитай про бюджет..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4BD67] text-[#101116] transition hover:bg-[#F0CB7C]"
          type="submit"
          aria-label="Надіслати"
        >
          <Send className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </form>

      {answer ? (
        <p className="mt-3 rounded-xl border border-[#1B1D23] bg-[#101116] p-3 text-[12px] leading-relaxed text-[#B9BCC5]">
          {answer}
        </p>
      ) : null}
    </section>
  );
}
