import { useMemo, useState } from "react";
import AccountSelector from "../components/AccountSelector";
import PageTitle from "../components/PageTitle";
import AiFinanceAssistant from "../components/transactions/AiFinanceAssistant";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionList from "../components/transactions/TransactionList";
import TransactionSummaryCards from "../components/transactions/TransactionSummaryCards";
import { getCurrency } from "../utils/format";
import {
  ALL_ACCOUNTS_ID,
  createScopedAnalytics,
} from "../utils/analyticsScope";
import {
  getRawTransactions,
  getSignedAmount,
  getTransactionCategory,
  getTransactionCategoryLabel,
  getTransactionDate,
  getTransactionDescription,
  isIncomeTransaction,
  isTransferTransaction,
} from "../utils/transactions";

function normalizeSearch(value) {
  return String(value ?? "").toLowerCase().trim();
}

function matchesSearch(transaction, search) {
  const query = normalizeSearch(search);
  if (!query) return true;

  const amount = Math.abs(getSignedAmount(transaction));
  const haystack = [
    getTransactionDescription(transaction),
    transaction.merchant,
    transaction.description,
    getTransactionCategoryLabel(transaction),
    transaction.category,
    amount,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function applyTypeFilter(transaction, type) {
  if (type === "income") {
    return isIncomeTransaction(transaction) && !isTransferTransaction(transaction);
  }

  if (type === "expense") {
    return !isIncomeTransaction(transaction) && !isTransferTransaction(transaction);
  }

  return true;
}

function applyAmountFilter(transaction, minAmount, maxAmount) {
  const amount = Math.abs(getSignedAmount(transaction));
  const minText = String(minAmount).trim().replace(",", ".");
  const maxText = String(maxAmount).trim().replace(",", ".");
  const min = minText === "" ? null : Number(minText);
  const max = maxText === "" ? null : Number(maxText);

  if (min !== null && Number.isFinite(min) && amount < min) return false;
  if (max !== null && Number.isFinite(max) && amount > max) return false;
  return true;
}

function matchesSelectedCategory(transaction, selectedCategory) {
  if (selectedCategory === "all") {
    return true;
  }

  return getTransactionCategory(transaction) === selectedCategory;
}

function sortTransactions(transactions, sort) {
  return transactions.slice().sort((a, b) => {
    if (sort === "amount") {
      return Math.abs(getSignedAmount(b)) - Math.abs(getSignedAmount(a));
    }

    const dateA = getTransactionDate(a)?.getTime() ?? 0;
    const dateB = getTransactionDate(b)?.getTime() ?? 0;

    return sort === "oldest" ? dateA - dateB : dateB - dateA;
  });
}

function buildCategoryOptions(transactions) {
  const categories = new Map();

  transactions.forEach((transaction) => {
    const id = getTransactionCategory(transaction);

    if (!id) {
      return;
    }

    const current = categories.get(id);
    categories.set(id, {
      id,
      count: (current?.count ?? 0) + 1,
      label: current?.label ?? getTransactionCategoryLabel(transaction),
    });
  });

  return [
    {
      id: "all",
      label: "Всі",
      count: transactions.length,
    },
    ...Array.from(categories.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.label.localeCompare(b.label, "uk");
    }),
  ];
}

export default function TransactionsPage({
  data,
  selectedAccountId = ALL_ACCOUNTS_ID,
  onSelectAccount,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    minAmount: "",
    maxAmount: "",
    sort: "newest",
  });
  const activeData = useMemo(
    () => createScopedAnalytics(data, selectedAccountId),
    [data, selectedAccountId]
  );
  const currency = getCurrency(activeData);
  const rawTransactions = useMemo(() => getRawTransactions(activeData), [activeData]);
  const categoryOptions = useMemo(
    () => buildCategoryOptions(rawTransactions),
    [rawTransactions]
  );
  const selectedCategory = categoryOptions.some((option) => option.id === category)
    ? category
    : "all";

  const transactions = useMemo(() => {
    const filtered = rawTransactions.filter((transaction) => {
      return (
        matchesSearch(transaction, search) &&
        matchesSelectedCategory(transaction, selectedCategory) &&
        applyTypeFilter(transaction, filters.type) &&
        applyAmountFilter(transaction, filters.minAmount, filters.maxAmount)
      );
    });

    return sortTransactions(filtered, filters.sort);
  }, [rawTransactions, search, selectedCategory, filters]);

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-12 xl:px-16">
      <PageTitle title="Транзакції" />

      <TransactionSummaryCards data={activeData} />

      <AccountSelector
        data={data}
        onSelectAccount={onSelectAccount}
        selectedAccountId={selectedAccountId}
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.78fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <TransactionFilters
            category={selectedCategory}
            categoryOptions={categoryOptions}
            filters={filters}
            search={search}
            showAllCategories={showAllCategories}
            onCategoryChange={setCategory}
            onFiltersChange={setFilters}
            onSearchChange={setSearch}
            onToggleCategories={() =>
              setShowAllCategories((currentValue) => !currentValue)
            }
          />
          <TransactionList
            currency={currency}
            transactions={transactions}
          />
        </div>

        <AiFinanceAssistant data={activeData} />
      </section>
    </main>
  );
}
