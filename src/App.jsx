import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ChartCard from "./components/ChartCard";
import Categories from "./components/Categories";
import Transactions from "./components/Transactions";
import AccountSelector from "./components/AccountSelector";
import BudgetPage from "./pages/BudgetPage";
import TransactionsPage from "./pages/TransactionsPage";
import { useAnalytics } from "./hooks/useAnalytics";
import { createChartData } from "./utils/chart";
import { getCurrency } from "./utils/format";
import {
  ALL_ACCOUNTS_ID,
  createScopedAnalytics,
} from "./utils/analyticsScope";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function getAppPath() {
  const pathname = window.location.pathname;
  const withoutBase =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length)
      : pathname;

  return withoutBase || "/";
}

function getBrowserPath(appPath) {
  if (!basePath) {
    return appPath;
  }

  return appPath === "/" ? `${basePath}/` : `${basePath}${appPath}`;
}

export default function App() {
  const { data, error, loading } = useAnalytics();
  const [path, setPath] = useState(getAppPath);
  const [selectedAccountId, setSelectedAccountId] = useState(ALL_ACCOUNTS_ID);
  const activeData = useMemo(
    () => createScopedAnalytics(data, selectedAccountId),
    [data, selectedAccountId]
  );
  const chartData = useMemo(() => createChartData(activeData), [activeData]);
  const currency = getCurrency(activeData);

  const navigate = (nextPath) => {
    if (nextPath === path) return;
    window.history.pushState({}, "", getBrowserPath(nextPath));
    setPath(nextPath);
  };

  useEffect(() => {
    const handlePopState = () => setPath(getAppPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0C0F] text-white">
        <div
          className="h-11 w-11 animate-spin rounded-full border border-[#1B1D23] border-t-[#E4BD67]"
          aria-label="Завантаження"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C0F] text-white antialiased">
      <Header activePath={path} onNavigate={navigate} />

      {error ? (
        <main className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-12 xl:px-16">
          <div className="rounded-[28px] border border-[#1B1D23] bg-[#121318] px-5 py-10 text-center">
            <p className="text-[16px] font-semibold text-[#F4F1EA]">
              Не вдалося завантажити дані
            </p>
            <p className="mt-2 text-[13px] text-[#777B85]">
              Перевір n8n webhook або спробуй оновити сторінку.
            </p>
          </div>
        </main>
      ) : path === "/transactions" ? (
        <TransactionsPage data={data} />
      ) : path === "/budget" ? (
        <BudgetPage data={data} />
      ) : (
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-12 xl:px-16">
        <Hero data={activeData} />

        <AccountSelector
          data={data}
          onSelectAccount={setSelectedAccountId}
          selectedAccountId={selectedAccountId}
        />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <ChartCard chartData={chartData} currency={currency} />
          <Categories data={activeData} />
        </section>

        <Transactions data={activeData} onViewAll={() => navigate("/transactions")} />
      </main>
      )}
    </div>
  );
}
