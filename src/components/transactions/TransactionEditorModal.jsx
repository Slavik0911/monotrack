import { EyeOff, RotateCcw, Save, X } from "lucide-react";
import { useState } from "react";
import Dropdown from "../ui/Dropdown";
import { formatCardMask } from "../../utils/card";
import { formatMoney } from "../../utils/format";
import {
  getSignedAmount,
  getTransactionCurrency,
  getTransactionDescription,
  shouldUseOriginalTransactionMoney,
} from "../../utils/transactions";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getOriginalDescription(transaction) {
  return (
    transaction?.merchant ??
    transaction?.merchant_name ??
    transaction?.description ??
    transaction?.name ??
    transaction?.comment ??
    transaction?.purpose ??
    "Операція"
  );
}

function getAccountLabel(account, fallbackCurrency) {
  const card = formatCardMask(
    account?.masked_pan ?? account?.card_mask ?? account?.account_id
  );
  const type = account?.account_type
    ? `${account.account_type.charAt(0).toUpperCase()}${account.account_type.slice(1)}`
    : "Рахунок";
  const currency = account?.account_currency ?? fallbackCurrency;
  const balance = account?.account_currency
    ? account.balance_original ?? account.balance_converted
    : account.balance_converted ?? account.balance;

  return `${card} · ${type} · ${formatMoney(Math.round(Number(balance) || 0), currency)}`;
}

export default function TransactionEditorModal({
  accounts,
  currency,
  onClose,
  onReset,
  onSave,
  transaction,
}) {
  const edit = transaction?.__transaction_edit ?? {};
  const originalDescription = getOriginalDescription(transaction);
  const originalAccountId = String(
    transaction?.original_account_id ?? transaction?.account_id ?? ""
  );
  const [selectedAccountId, setSelectedAccountId] = useState(() =>
    String(edit.account_id || transaction?.account_id || "")
  );
  const accountOptions = asArray(accounts).map((account) => ({
    label: getAccountLabel(account, currency),
    value: account.account_id,
  }));
  const shouldUseOriginal = shouldUseOriginalTransactionMoney(transaction);
  const transactionCurrency = getTransactionCurrency(
    transaction,
    currency,
    shouldUseOriginal
  );
  const amount = getSignedAmount(
    transaction,
    shouldUseOriginal ? "original" : "converted"
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();

    onSave({
      account_id: selectedAccountId !== originalAccountId ? selectedAccountId : "",
      exclude_from_budget: form.get("exclude_from_budget") === "on",
      hide_from_transactions: form.get("hide_from_transactions") === "on",
      title: title && title !== originalDescription ? title : "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-4 sm:items-center">
      <form
        className="w-full max-w-[520px] rounded-[24px] border border-[#1B1D23] bg-[#121318] p-5"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[#F4F1EA]">
              Редагувати транзакцію
            </h2>
            <p className="mt-1 text-[12px] text-[#777B85]">
              Сума і дата лишаються банківськими. Тут змінюються тільки локальні
              правила відображення.
            </p>
          </div>
          <button
            aria-label="Закрити"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1B20] text-[#8B8F98] transition hover:text-white"
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-[#1B1D23] bg-[#101116] p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#777B85]">
            Оригінальна операція
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="min-w-0 truncate text-[14px] font-semibold text-[#F4F1EA]">
              {originalDescription}
            </p>
            <p className="shrink-0 text-[13px] font-semibold text-[#E4BD67]">
              {formatMoney(Math.abs(amount), transactionCurrency)}
            </p>
          </div>
        </div>

        <label className="mt-5 block text-[12px] font-semibold text-[#F4F1EA]">
          Назва в Monotrack
          <input
            className="mt-2 h-11 w-full rounded-xl border border-[#24262D] bg-[#1A1B20] px-3 text-[13px] text-[#F4F1EA] outline-none placeholder:text-[#666B75]"
            defaultValue={getTransactionDescription(transaction)}
            name="title"
            placeholder={originalDescription}
          />
        </label>

        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[#F4F1EA]">
            Зарахувати на картку
          </p>
          <Dropdown
            className="mt-2"
            menuClassName="max-h-[220px]"
            options={accountOptions}
            value={selectedAccountId}
            onChange={setSelectedAccountId}
          />
        </div>

        <div className="mt-5 space-y-2">
          <label className="flex items-start gap-3 rounded-2xl border border-[#24262D] bg-[#101116] px-4 py-3">
            <input
              className="mt-1 h-4 w-4 accent-[#E4BD67]"
              defaultChecked={edit.exclude_from_budget === true}
              name="exclude_from_budget"
              type="checkbox"
            />
            <span>
              <span className="block text-[13px] font-semibold text-[#F4F1EA]">
                Не враховувати в бюджеті і графіках
              </span>
              <span className="mt-1 block text-[11px] text-[#777B85]">
                Операція лишиться в таблиці, але не попадатиме в бюджет,
                графік і категорії.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-[#24262D] bg-[#101116] px-4 py-3">
            <input
              className="mt-1 h-4 w-4 accent-[#E4BD67]"
              defaultChecked={edit.hide_from_transactions === true}
              name="hide_from_transactions"
              type="checkbox"
            />
            <span>
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[#F4F1EA]">
                <EyeOff className="h-4 w-4 text-[#E4BD67]" strokeWidth={1.8} />
                Сховати з таблиці транзакцій
              </span>
              <span className="mt-1 block text-[11px] text-[#777B85]">
                Її можна буде повернути через режим показу прихованих.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[13px] text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
            type="button"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
            Скинути правки
          </button>

          <div className="flex gap-2">
            <button
              className="h-11 rounded-xl px-4 text-[13px] text-[#8B8F98] transition hover:bg-[#1A1B20] hover:text-[#F4F1EA]"
              type="button"
              onClick={onClose}
            >
              Скасувати
            </button>
            <button
              className="flex h-11 items-center gap-2 rounded-xl bg-[#E4BD67] px-5 text-[13px] font-semibold text-[#101116] transition hover:bg-[#F0CB7C]"
              type="submit"
            >
              <Save className="h-4 w-4" strokeWidth={1.8} />
              Зберегти
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
