import BalanceCard from "./BalanceCard";
import IncomeExpense from "./IncomeExpense";
import PageTitle from "./PageTitle";

export default function Hero({ data }) {
  return (
    <section className="flex flex-col gap-5">
      <PageTitle title="Добрий ранок, Микола" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
        <BalanceCard data={data} />
        <IncomeExpense data={data} />
      </div>
    </section>
  );
}
