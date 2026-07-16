import { Bot, ChevronDown, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { getCategoryLabel } from "../../utils/categoryDisplay";
import { formatMoney, getCurrency } from "../../utils/format";

function getMainRecommendation(data, currency) {
  const breakdown = data?.global?.breakdown ?? [];
  const topCategory = breakdown[0];
  const previousSpent = Number(data?.global?.previous_spent_converted ?? 0);
  const spentChange = data?.global?.spent_change_percent;

  if (!topCategory) {
    return "Недостатньо даних для рекомендацій за поточний період.";
  }

  if (!previousSpent) {
    return "Недостатньо даних для порівняння з попереднім місяцем.";
  }

  const categoryName = getCategoryLabel(topCategory.category);
  const changeText =
    spentChange === null || spentChange === undefined
      ? ""
      : ` Витрати змінились на ${Math.round(spentChange)}% до аналогічного періоду минулого місяця.`;

  return `Найбільша категорія витрат — ${categoryName}: ${formatMoney(
    topCategory.amount_converted,
    currency
  )}.${changeText}`;
}

function AccordionItem({ children, label, tone = "default" }) {
  const toneClass =
    tone === "green"
      ? "text-[#33D17A]"
      : tone === "gold"
        ? "text-[#E4BD67]"
        : "text-[#9EA3AF]";

  return (
    <details className="rounded-xl border border-[#1B1D23] bg-[#101116] px-3 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] text-[#F4F1EA]">
        <span className={toneClass}>{label}</span>
        <ChevronDown className="h-4 w-4 text-[#777B85]" strokeWidth={1.8} />
      </summary>
      <p className="mt-3 text-[12px] leading-relaxed text-[#777B85]">{children}</p>
    </details>
  );
}

export default function AiFinanceAssistant({ data }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const currency = getCurrency(data);
  const recommendation = useMemo(
    () => getMainRecommendation(data, currency),
    [data, currency]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;

    const topCategory = data?.global?.breakdown?.[0];
    setAnswer(
      topCategory
        ? `Я бачу найбільшу витрату в категорії ${getCategoryLabel(
            topCategory.category
          )}. Почни з перегляду операцій цієї категорії у списку зліва.`
        : "Поки недостатньо транзакцій, щоб сформувати відповідь."
    );
    setQuestion("");
  };

  return (
    <aside className="rounded-[18px] border border-[#1B1D23] bg-[#121318] p-5">
      <div className="flex items-center gap-3 border-b border-[#1B1D23] pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#211D16] text-[#E4BD67]">
          <Bot className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-[#F4F1EA]">
            AI Помічник
          </h2>
          <p className="mt-1 text-[11px] text-[#777B85]">
            Аналіз за реальними даними
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#1B1D23] bg-[#101116] p-4">
        <span className="rounded-full bg-[#211D16] px-2.5 py-1 text-[10px] font-medium text-[#E4BD67]">
          Рекомендація
        </span>
        <p className="mt-3 text-[12px] leading-relaxed text-[#B9BCC5]">
          {recommendation}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <AccordionItem label="Планування">
          Порівняй регулярні категорії з попереднім періодом і зафіксуй ліміт для найбільшої категорії витрат.
        </AccordionItem>
        <AccordionItem label="Оптимізація" tone="gold">
          Перевір підписки, комунальні платежі та повторювані перекази у списку операцій.
        </AccordionItem>
        <AccordionItem label="Інвестиції" tone="green">
          Якщо net flow за період позитивний, частину різниці можна винести в окремий резерв.
        </AccordionItem>
      </div>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#1B1D23] bg-[#1A1B20] px-3 text-[12px] text-[#F4F1EA] outline-none placeholder:text-[#666B75]"
          placeholder="Запитати AI про мої фінанси..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4BD67] text-[#101116] transition hover:bg-[#F0CB7C]"
          type="submit"
          aria-label="Надіслати запит"
        >
          <Send className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </form>

      {answer ? (
        <p className="mt-3 rounded-xl border border-[#1B1D23] bg-[#101116] p-3 text-[12px] leading-relaxed text-[#B9BCC5]">
          {answer}
        </p>
      ) : null}
    </aside>
  );
}
