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
    <div className="-mt-2 flex justify-end">
      <div className="flex items-center gap-2 rounded-full border border-[#1B1D23] bg-[#101116] p-1">
        <button
          aria-label={visible ? "Повернути звичайні фільтри" : "Показати змінені транзакції"}
          className={`flex h-8 items-center gap-2 rounded-full px-3 text-[11px] font-semibold transition ${
            visible
              ? "bg-[#211D16] text-[#E4BD67]"
              : "text-[#777B85] hover:bg-[#1A1B20] hover:text-[#D7D9DE]"
          }`}
          title={visible ? "Повернути звичайні фільтри" : "Показати змінені транзакції"}
          type="button"
          onClick={onToggle}
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>Правки</span>
          <span className="rounded-full bg-[#1B1D23] px-1.5 py-0.5 text-[10px] text-[#E4BD67]">
            {count}
          </span>
        </button>

        {visible ? (
          <button
            aria-label="Скинути всі локальні правки"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#777B85] transition hover:bg-[#1A1B20] hover:text-[#D8A15D]"
            title="Скинути всі локальні правки"
            type="button"
            onClick={onResetAll}
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
