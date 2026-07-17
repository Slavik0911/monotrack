import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { budgetCategories, calculatePlannedAmount } from "../../utils/budget";
import { formatMoney } from "../../utils/format";

const editableCategories = budgetCategories.filter((category) => category.id !== "other");

export default function BudgetEditorModal({
  budget,
  currency,
  income,
  month,
  onClose,
  onDelete,
  onSave,
}) {
  const [category, setCategory] = useState(() => budget?.category ?? "food");
  const [type, setType] = useState(() => budget?.type ?? "fixed");
  const [value, setValue] = useState(() => String(budget?.value ?? ""));
  const [error, setError] = useState("");

  const preview = useMemo(
    () => calculatePlannedAmount({ type, value }, income),
    [income, type, value]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const number = Number(String(value).replace(",", "."));

    if (!Number.isFinite(number) || number <= 0) {
      setError("Введи суму або відсоток більше нуля.");
      return;
    }

    if (type === "percent" && number > 100) {
      setError("Відсоток не може бути більшим за 100.");
      return;
    }

    onSave({
      category,
      month,
      type,
      value: number,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-4 sm:items-center">
      <form
        className="w-full max-w-[480px] rounded-[24px] border border-[#1B1D23] bg-[#121318] p-5"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[#F4F1EA]">
              {budget ? "Редагувати бюджет" : "Додати бюджет"}
            </h2>
            <p className="mt-1 text-[12px] text-[#777B85]">
              Плануй категорію як суму або частку від доходу.
            </p>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1B20] text-[#8B8F98] transition hover:text-white"
            type="button"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <label className="mt-5 block text-[12px] font-semibold text-[#F4F1EA]">
          Категорія
          <select
            className="mt-2 h-11 w-full rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 text-[13px] text-[#F4F1EA] outline-none"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {editableCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.icon} {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#F4F1EA]">Тип бюджету</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              className={`h-10 rounded-xl border text-[12px] transition ${
                type === "fixed"
                  ? "border-[#E4BD67] bg-[#211D16] text-[#E4BD67]"
                  : "border-[#24262D] bg-[#1A1B20] text-[#8B8F98]"
              }`}
              type="button"
              onClick={() => setType("fixed")}
            >
              Фіксована сума
            </button>
            <button
              className={`h-10 rounded-xl border text-[12px] transition ${
                type === "percent"
                  ? "border-[#E4BD67] bg-[#211D16] text-[#E4BD67]"
                  : "border-[#24262D] bg-[#1A1B20] text-[#8B8F98]"
              }`}
              type="button"
              onClick={() => setType("percent")}
            >
              % від доходу
            </button>
          </div>
        </div>

        <label className="mt-4 block text-[12px] font-semibold text-[#F4F1EA]">
          {type === "percent" ? "Відсоток" : "Сума"}
          <input
            className="mt-2 h-11 w-full rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 text-[13px] text-[#F4F1EA] outline-none placeholder:text-[#666B75]"
            inputMode="decimal"
            placeholder={type === "percent" ? "12" : "10000"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>

        <div className="mt-4 rounded-2xl border border-[#1B1D23] bg-[#101116] p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#777B85]">
            План на місяць
          </p>
          <p className="mt-2 text-[20px] font-semibold text-[#F4F1EA]">
            {formatMoney(preview, currency)}
          </p>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl bg-[#351819] px-3 py-2 text-[12px] text-[#FF8A84]">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {budget ? (
            <button
              className="h-11 rounded-xl px-4 text-[13px] text-[#FF8A84] transition hover:bg-[#351819]"
              type="button"
              onClick={() => {
                if (window.confirm("Видалити цей бюджет?")) {
                  onDelete(budget.id);
                }
              }}
            >
              Видалити
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              className="h-11 rounded-xl px-4 text-[13px] text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
              type="button"
              onClick={onClose}
            >
              Скасувати
            </button>
            <button
              className="h-11 rounded-xl bg-[#E4BD67] px-5 text-[13px] font-semibold text-[#101116] transition hover:bg-[#F0CB7C]"
              type="submit"
            >
              Зберегти
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
