const STORAGE_KEY = "monotrack.budgets.v1";

function readAllBudgets() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Budget storage read failed:", error);
    return [];
  }
}

function writeAllBudgets(budgets) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `budget_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getBudgets(month) {
  return readAllBudgets().filter((budget) => budget.month === month);
}

export function createBudget(input) {
  const now = new Date().toISOString();
  const budget = {
    id: createId(),
    created_at: now,
    updated_at: now,
    ...input,
  };
  const budgets = readAllBudgets();
  writeAllBudgets([...budgets, budget]);
  return budget;
}

export function updateBudget(id, input) {
  const budgets = readAllBudgets();
  const now = new Date().toISOString();
  const nextBudgets = budgets.map((budget) =>
    budget.id === id ? { ...budget, ...input, updated_at: now } : budget
  );
  writeAllBudgets(nextBudgets);
  return nextBudgets.find((budget) => budget.id === id) ?? null;
}

export function deleteBudget(id) {
  const budgets = readAllBudgets();
  writeAllBudgets(budgets.filter((budget) => budget.id !== id));
}

export function replaceMonthBudgets(month, monthBudgets) {
  const otherBudgets = readAllBudgets().filter((budget) => budget.month !== month);
  writeAllBudgets([...otherBudgets, ...monthBudgets]);
}
