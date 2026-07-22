import { Eye, RotateCcw } from "lucide-react";

export default function TransactionEditAccess({
  count,
  onResetAll,
  onToggle,
  visible,
}) {
  if (count === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 rounded-[18px] border border-[#1B1D23] bg-[#121318] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[13px] font-semibold text-[#F4F1EA]">
          Локальні правки
          <span className="ml-2 rounded-full bg-[#211D16] px-2 py-0.5 text-[10px] text-[#E4BD67]">
            {count}
          </span>
        </p>
        <p className="mt-1 text-[11px] text-[#777B85]">
          Тут можна знайти приховані або змінені операції і скинути їх.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition ${
            visible
              ? "border-[#E4BD67] bg-[#211D16] text-[#E4BD67]"
              : "border-[#24262D] bg-[#1A1B20] text-[#D7D9DE] hover:border-[#E4BD67] hover:text-[#F4F1EA]"
          }`}
          type="button"
          onClick={onToggle}
        >
          <Eye className="h-4 w-4" strokeWidth={1.8} />
          {visible ? "Повернути фільтри" : "Показати змінені"}
        </button>

        <button
          className="flex h-9 items-center gap-2 rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 text-[12px] font-semibold text-[#8B8F98] transition hover:border-[#D8A15D] hover:text-[#D8A15D]"
          type="button"
          onClick={onResetAll}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
          Скинути всі
        </button>
      </div>
    </section>
  );
}
