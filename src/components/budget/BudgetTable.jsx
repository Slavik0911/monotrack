import { Plus } from "lucide-react";
import BudgetCategoryRow from "./BudgetCategoryRow";

export default function BudgetTable({
  currency,
  onAdd,
  onDelete,
  onEdit,
  rows,
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#1B1D23] bg-[#121318]">
      <div className="flex items-center justify-between gap-4 border-b border-[#1B1D23] px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-semibold text-[#F4F1EA]">Категорії бюджету</h2>
          <span className="rounded-full bg-[#211D16] px-2.5 py-1 text-[10px] font-medium text-[#E4BD67]">
            {rows.length} категорій
          </span>
        </div>
        <button
          className="flex h-9 items-center gap-2 rounded-xl bg-[#1A1B20] px-3 text-[12px] font-semibold text-[#D7D9DE] transition hover:bg-[#211D16] hover:text-[#E4BD67]"
          type="button"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Додати
        </button>
      </div>

      <div className="hidden grid-cols-[minmax(170px,1.25fr)_110px_110px_110px_minmax(140px,1fr)_128px_74px] border-b border-[#1B1D23] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6F737D] lg:grid">
        <span>Категорія</span>
        <span>Заплановано</span>
        <span>Витрачено</span>
        <span>Залишилось</span>
        <span>Прогрес</span>
        <span>Статус</span>
        <span className="text-right">Дії</span>
      </div>

      {rows.length > 0 ? (
        rows.map((row) => (
          <BudgetCategoryRow
            currency={currency}
            key={row.categoryId}
            row={row}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-[14px] font-semibold text-[#F4F1EA]">
            Бюджет ще не налаштований
          </p>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-[#777B85]">
            Додай категорії вручну або створи базовий план на основі поточних
            витрат.
          </p>
        </div>
      )}
    </section>
  );
}
