import TransactionRow from "./TransactionRow";

export default function TransactionList({
  currency,
  transactions,
}) {
  return (
    <section className="rounded-[18px] border border-[#1B1D23] bg-[#121318] px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-[14px] font-semibold text-[#F4F1EA]">Операції</h2>
        <span className="text-[11px] text-[#777B85]">
          {transactions.length} записів
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-[#1B1D23] px-4 py-12 text-center">
          <p className="text-[14px] font-medium text-[#F4F1EA]">
            Нічого не знайдено
          </p>
          <p className="mt-2 text-[12px] text-[#777B85]">
            Спробуй змінити пошук або фільтри
          </p>
        </div>
      ) : (
        <ul>
          {transactions.map((transaction, index) => (
            <TransactionRow
              currency={currency}
              key={transaction.id ?? transaction.transaction_id ?? `${transaction.tx_time}-${index}`}
              transaction={transaction}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
