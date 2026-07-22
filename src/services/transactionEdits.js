const STORAGE_KEY = "monotrack.transactionEdits.v1";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readAllEdits() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Transaction edits read failed:", error);
    return {};
  }
}

function writeAllEdits(edits) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
}

export function getTransactionKey(transaction) {
  const directId =
    transaction?.id ??
    transaction?.transaction_id ??
    transaction?.statement_id ??
    transaction?.operation_id;

  if (directId !== null && directId !== undefined && directId !== "") {
    return String(directId);
  }

  return [
    transaction?.account_id,
    transaction?.tx_time ?? transaction?.time ?? transaction?.date,
    transaction?.amount ?? transaction?.amount_converted ?? transaction?.amount_human,
    transaction?.description ?? transaction?.merchant ?? transaction?.name,
  ]
    .map((part) => String(part ?? ""))
    .join("|");
}

export function getTransactionEdits() {
  return readAllEdits();
}

export function getTransactionEdit(transactionOrKey) {
  const key =
    typeof transactionOrKey === "string"
      ? transactionOrKey
      : getTransactionKey(transactionOrKey);

  return readAllEdits()[key] ?? null;
}

function normalizeEdit(edit) {
  return {
    account_id: edit.account_id || "",
    exclude_from_budget: edit.exclude_from_budget === true,
    title: String(edit.title ?? "").trim(),
    updated_at: new Date().toISOString(),
  };
}

function hasMeaningfulEdit(edit) {
  return (
    edit.title ||
    edit.account_id ||
    edit.exclude_from_budget
  );
}

export function saveTransactionEdit(transactionKey, edit) {
  const edits = readAllEdits();
  const normalizedEdit = normalizeEdit(edit);

  if (!hasMeaningfulEdit(normalizedEdit)) {
    delete edits[transactionKey];
    writeAllEdits(edits);
    return null;
  }

  edits[transactionKey] = normalizedEdit;
  writeAllEdits(edits);
  return normalizedEdit;
}

export function deleteTransactionEdit(transactionKey) {
  const edits = readAllEdits();
  delete edits[transactionKey];
  writeAllEdits(edits);
}

export function clearTransactionEdits() {
  writeAllEdits({});
}

function getAccountsById(data) {
  return new Map(
    asArray(data?.by_account).map((account) => [
      String(account.account_id),
      account,
    ])
  );
}

function applyEditToTransaction(transaction, accountsById, edits) {
  if (!transaction || typeof transaction !== "object") {
    return transaction;
  }

  const key = getTransactionKey(transaction);
  const edit = edits[key];
  const nextTransaction = {
    ...transaction,
    __excludeFromBudget: false,
    __hasLocalEdit: Boolean(edit),
    __hideFromTransactions: false,
    __transaction_edit: edit ?? null,
    __transaction_key: key,
  };

  if (!edit) {
    return nextTransaction;
  }

  if (edit.title) {
    nextTransaction.display_description = edit.title;
  }

  if (edit.account_id) {
    nextTransaction.original_account_id =
      transaction.original_account_id ?? transaction.account_id;
    nextTransaction.account_id = edit.account_id;
    nextTransaction.__account =
      accountsById.get(String(edit.account_id)) ?? transaction.__account;
  }

  nextTransaction.__excludeFromBudget = edit.exclude_from_budget === true;

  return nextTransaction;
}

export function applyTransactionEdits(data) {
  if (!data) {
    return data;
  }

  const edits = readAllEdits();
  const hasEdits = Object.keys(edits).length > 0;
  const accountsById = getAccountsById(data);
  const applyList = (transactions) =>
    asArray(transactions).map((transaction) =>
      applyEditToTransaction(transaction, accountsById, edits)
    );

  const transactions =
    data.transactions !== undefined ? applyList(data.transactions) : data.transactions;
  const globalTransactions =
    data.global?.transactions !== undefined
      ? applyList(data.global.transactions)
      : data.global?.transactions;

  return {
    ...data,
    __hasTransactionEdits: hasEdits,
    by_account: asArray(data.by_account).map((account) => ({
      ...account,
      items: account.items !== undefined ? applyList(account.items) : account.items,
      operations:
        account.operations !== undefined
          ? applyList(account.operations)
          : account.operations,
      recent_transactions:
        account.recent_transactions !== undefined
          ? applyList(account.recent_transactions)
          : account.recent_transactions,
      statement:
        account.statement !== undefined
          ? applyList(account.statement)
          : account.statement,
      transactions:
        account.transactions !== undefined
          ? applyList(account.transactions)
          : account.transactions,
    })),
    global:
      data.global !== undefined
        ? {
            ...data.global,
            transactions: globalTransactions,
          }
        : data.global,
    transactions,
  };
}
