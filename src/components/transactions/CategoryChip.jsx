export default function CategoryChip({ active = false, children, count, onClick }) {
  return (
    <button
      className={`flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[12px] transition ${
        active
          ? "border-[#E4BD67] bg-[#1A1B20] font-semibold text-[#F4F1EA]"
          : "border-[#24262D] bg-[#17181E] text-[#8B8F98] hover:border-[#3A3D45] hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
      }`}
      type="button"
      onClick={onClick}
    >
      <span>{children}</span>
      {Number.isFinite(count) ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
            active
              ? "bg-[#E4BD67] text-[#101116]"
              : "bg-[#202229] text-[#777B85]"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
