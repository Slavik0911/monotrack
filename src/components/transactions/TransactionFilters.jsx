import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import CategoryChip from "./CategoryChip";

const COMPACT_CATEGORY_LIMIT = 6;

function getPrimaryCategoryOptions(options, activeCategory) {
  if (options.length <= COMPACT_CATEGORY_LIMIT) {
    return options;
  }

  const compactOptions = options.slice(0, COMPACT_CATEGORY_LIMIT);
  const activeOption = options.find((option) => option.id === activeCategory);

  if (
    !activeOption ||
    compactOptions.some((option) => option.id === activeOption.id)
  ) {
    return compactOptions;
  }

  return [...compactOptions.slice(0, -1), activeOption];
}

export default function TransactionFilters({
  category,
  categoryOptions,
  filters,
  showAllCategories,
  onCategoryChange,
  onFiltersChange,
  onSearchChange,
  onToggleCategories,
  search,
}) {
  const primaryCategoryOptions = getPrimaryCategoryOptions(
    categoryOptions,
    category
  );
  const primaryCategoryIds = new Set(
    primaryCategoryOptions.map((option) => option.id)
  );
  const additionalCategoryOptions = categoryOptions.filter(
    (option) => !primaryCategoryIds.has(option.id)
  );
  const hiddenCategoriesCount = additionalCategoryOptions.length;
  const toggleType = (type) => {
    onFiltersChange({
      ...filters,
      type: filters.type === type ? "all" : type,
    });
  };

  return (
    <section className="rounded-[18px] border border-[#1B1D23] bg-[#121318] p-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-[#1B1D23] bg-[#1A1B20] px-3 text-[#777B85]">
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          <input
            className="h-10 w-full bg-transparent text-[13px] text-[#F4F1EA] outline-none placeholder:text-[#666B75]"
            placeholder="Пошук транзакцій..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <details className="group relative">
          <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-[#1B1D23] bg-[#1A1B20] px-4 text-[12px] text-[#8B8F98] transition hover:text-[#F4F1EA]">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
            Фільтр
          </summary>

          <div className="absolute right-0 z-30 mt-2 w-[280px] rounded-2xl border border-[#1B1D23] bg-[#121318] p-4">
            <p className="text-[12px] font-semibold text-[#F4F1EA]">Тип операції</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className={`rounded-xl border px-3 py-2 text-[12px] ${
                  filters.type === "income"
                    ? "border-[#33D17A] text-[#33D17A]"
                    : "border-[#24262D] text-[#8B8F98]"
                }`}
                type="button"
                onClick={() => toggleType("income")}
              >
                Доходи
              </button>
              <button
                className={`rounded-xl border px-3 py-2 text-[12px] ${
                  filters.type === "expense"
                    ? "border-[#E4BD67] text-[#E4BD67]"
                    : "border-[#24262D] text-[#8B8F98]"
                }`}
                type="button"
                onClick={() => toggleType("expense")}
              >
                Витрати
              </button>
            </div>

            <p className="mt-4 text-[12px] font-semibold text-[#F4F1EA]">
              Діапазон суми
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                className="min-w-0 rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 py-2 text-[12px] text-[#F4F1EA] outline-none"
                inputMode="decimal"
                placeholder="Від"
                value={filters.minAmount}
                onChange={(event) =>
                  onFiltersChange({ ...filters, minAmount: event.target.value })
                }
              />
              <input
                className="min-w-0 rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 py-2 text-[12px] text-[#F4F1EA] outline-none"
                inputMode="decimal"
                placeholder="До"
                value={filters.maxAmount}
                onChange={(event) =>
                  onFiltersChange({ ...filters, maxAmount: event.target.value })
                }
              />
            </div>

            <p className="mt-4 text-[12px] font-semibold text-[#F4F1EA]">
              Сортування
            </p>
            <select
              className="mt-3 w-full rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 py-2 text-[12px] text-[#F4F1EA] outline-none"
              value={filters.sort}
              onChange={(event) =>
                onFiltersChange({ ...filters, sort: event.target.value })
              }
            >
              <option value="newest">Нові спочатку</option>
              <option value="oldest">Старі спочатку</option>
              <option value="amount">За сумою</option>
            </select>
          </div>
        </details>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="no-scrollbar flex flex-nowrap gap-2 overflow-hidden">
          {primaryCategoryOptions.map((group) => (
            <CategoryChip
              active={category === group.id}
              key={group.id}
              onClick={() => onCategoryChange(group.id)}
              count={group.count}
            >
              {group.label}
            </CategoryChip>
          ))}
        </div>

        {hiddenCategoriesCount > 0 ? (
          <button
            className="flex h-9 w-fit items-center gap-2 rounded-full border border-[#24262D] bg-[#17181E] px-3 text-[12px] font-semibold text-[#E4BD67] transition hover:border-[#E4BD67] hover:bg-[#1A1B20]"
            type="button"
            onClick={onToggleCategories}
          >
            {showAllCategories ? "Сховати" : `Усі категорії · ${hiddenCategoriesCount}`}
            {showAllCategories ? (
              <ChevronUp className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>
        ) : null}

        {showAllCategories && hiddenCategoriesCount > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {additionalCategoryOptions.map((group) => (
              <CategoryChip
                active={category === group.id}
                key={group.id}
                onClick={() => onCategoryChange(group.id)}
                count={group.count}
              >
                {group.label}
              </CategoryChip>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
