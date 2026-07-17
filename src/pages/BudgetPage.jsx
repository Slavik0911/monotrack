import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import BudgetAiAssistant from "../components/budget/BudgetAiAssistant";
import BudgetDistribution from "../components/budget/BudgetDistribution";
import BudgetEmptyState from "../components/budget/BudgetEmptyState";
import BudgetEditorModal from "../components/budget/BudgetEditorModal";
import BudgetSummaryCards from "../components/budget/BudgetSummaryCards";
import BudgetTable from "../components/budget/BudgetTable";
import MonthlyBudgetHealth from "../components/budget/MonthlyBudgetHealth";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  replaceMonthBudgets,
  updateBudget,
} from "../services/budgetService";
import {
  buildBudgetRows,
  calculateDailyLimit,
  calculateForecast,
  calculateMonthProgress,
  calculateMonthlyExpenses,
  calculateMonthlyIncome,
  calculateUnallocatedAmount,
  createSuggestedBudgets,
  formatMonthLabel,
  getCurrentMonthKey,
  getMonthTransactions,
  getBudgetInsights,
  shiftMonth,
} from "../utils/budget";
import { getCurrency } from "../utils/format";

export default function BudgetPage({ data }) {
  const [month, setMonth] = useState(getCurrentMonthKey);
  const [budgets, setBudgets] = useState(() => getBudgets(getCurrentMonthKey()));
  const [editingRow, setEditingRow] = useState(null);
  const currency = getCurrency(data);

  const transactions = useMemo(() => getMonthTransactions(data, month), [data, month]);
  const income = useMemo(() => calculateMonthlyIncome(transactions), [transactions]);
  const spent = useMemo(() => calculateMonthlyExpenses(transactions), [transactions]);
  const rows = useMemo(
    () => buildBudgetRows(budgets, transactions, income),
    [budgets, income, transactions]
  );
  const summary = useMemo(() => {
    const planned = rows.reduce((sum, row) => sum + row.planned, 0);
    const expensePlanned = rows
      .filter((row) => row.category.kind === "expense")
      .reduce((sum, row) => sum + row.planned, 0);
    const reservePlanned = rows
      .filter((row) => row.category.id === "reserve" || row.category.id === "investments")
      .reduce((sum, row) => sum + row.planned, 0);
    const savingsPlanned = rows
      .filter((row) => row.category.id === "savings")
      .reduce((sum, row) => sum + row.planned, 0);

    return {
      expensePlanned,
      income,
      planned,
      reservePlanned,
      savingsPlanned,
      spent,
      unallocated: calculateUnallocatedAmount(income, planned),
    };
  }, [income, rows, spent]);
  const dailyLimit = useMemo(
    () => calculateDailyLimit(summary.planned, spent, month),
    [month, spent, summary.planned]
  );
  const forecast = useMemo(
    () => calculateForecast(spent, summary.planned, month),
    [month, spent, summary.planned]
  );
  const monthProgress = useMemo(() => calculateMonthProgress(month), [month]);
  const insights = useMemo(
    () => getBudgetInsights(rows, summary.planned, spent, month),
    [month, rows, spent, summary.planned]
  );
  const spentPercent = summary.planned > 0 ? (spent / summary.planned) * 100 : 0;
  const hasTransactions = transactions.length > 0;

  const reloadBudgets = () => setBudgets(getBudgets(month));
  const handleMonthChange = (offset) => {
    const nextMonth = shiftMonth(month, offset);
    setMonth(nextMonth);
    setBudgets(getBudgets(nextMonth));
    setEditingRow(null);
  };

  const handleSaveBudget = (input) => {
    if (editingRow?.budget) {
      updateBudget(editingRow.budget.id, input);
    } else {
      const existing = budgets.find((budget) => budget.category === input.category);
      if (existing) {
        updateBudget(existing.id, input);
      } else {
        createBudget(input);
      }
    }

    setEditingRow(null);
    reloadBudgets();
  };

  const handleDeleteBudget = (rowOrId) => {
    const id = typeof rowOrId === "string" ? rowOrId : rowOrId?.budget?.id;
    if (!id) return;

    deleteBudget(id);
    setEditingRow(null);
    reloadBudgets();
  };

  const handleCreateSuggested = () => {
    const suggested = createSuggestedBudgets(month, transactions, income);
    replaceMonthBudgets(month, suggested);
    reloadBudgets();
  };

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-12 xl:px-16">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#8B8F98]">
            Планування доходів і контроль витрат
          </p>
          <h1 className="mt-2 text-[34px] font-semibold text-[#F4F1EA]">
            Бюджет на місяць
          </h1>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-2xl border border-[#1B1D23] bg-[#121318] p-1">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
            type="button"
            onClick={() => handleMonthChange(-1)}
            aria-label="Попередній місяць"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <span className="min-w-[150px] text-center text-[13px] font-semibold capitalize text-[#F4F1EA]">
            {formatMonthLabel(month)}
          </span>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
            type="button"
            onClick={() => handleMonthChange(1)}
            aria-label="Наступний місяць"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </section>

      <BudgetSummaryCards currency={currency} summary={summary} />

      {!hasTransactions ? (
        <BudgetEmptyState
          title="За цей місяць немає транзакцій"
          description="Можеш створити план вручну, але фактичні витрати з'являться після операцій."
        />
      ) : null}

      {budgets.length === 0 && hasTransactions ? (
        <BudgetEmptyState
          title="Бюджет ще не заплановано"
          description="Можу створити стартовий план на основі фактичних категорій цього місяця."
          action={
            <button
              className="flex h-10 w-fit items-center gap-2 rounded-xl bg-[#E4BD67] px-4 text-[13px] font-semibold text-[#101116] transition hover:bg-[#F0CB7C]"
              type="button"
              onClick={handleCreateSuggested}
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={1.8} />
              Створити базовий план
            </button>
          }
        />
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.25fr)_minmax(320px,0.9fr)]">
        <div className="min-w-0">
          <BudgetTable
            currency={currency}
            rows={rows}
            onAdd={() => setEditingRow({ budget: null })}
            onDelete={handleDeleteBudget}
            onEdit={(row) => setEditingRow(row)}
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <BudgetDistribution currency={currency} summary={summary} />
          <MonthlyBudgetHealth
            currency={currency}
            dailyLimit={dailyLimit}
            forecast={forecast}
            progress={monthProgress}
            spentPercent={spentPercent}
          />
          <BudgetAiAssistant
            currency={currency}
            dailyLimit={dailyLimit}
            forecast={forecast}
            insights={insights}
            rows={rows}
          />
        </aside>
      </section>

      {editingRow ? (
        <BudgetEditorModal
          budget={editingRow.budget}
          currency={currency}
          income={income}
          month={month}
          onClose={() => setEditingRow(null)}
          onDelete={handleDeleteBudget}
          onSave={handleSaveBudget}
        />
      ) : null}
    </main>
  );
}
