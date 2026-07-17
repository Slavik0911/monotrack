export default function BudgetEmptyState({
  action,
  description,
  title,
}) {
  return (
    <section className="rounded-[18px] border border-[#1B1D23] bg-[#121318] px-5 py-8 text-center">
      <p className="text-[15px] font-semibold text-[#F4F1EA]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-[12px] leading-relaxed text-[#777B85]">
        {description}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </section>
  );
}
