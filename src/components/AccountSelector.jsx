import { CreditCard, Layers } from "lucide-react";
import { ALL_ACCOUNTS_ID } from "../utils/analyticsScope";
import { formatCardMask } from "../utils/card";
import { formatMoney, getCurrency } from "../utils/format";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getCardLabel(account) {
  const masked = account.masked_pan ?? account.card_mask ?? account.account_id;
  return formatCardMask(masked);
}

function getAccountType(account) {
  const type = account.account_type;
  if (!type) {
    return "Рахунок";
  }

  return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function formatRoundedMoney(value, currency) {
  const number = Number(value);
  return formatMoney(Number.isFinite(number) ? Math.round(number) : value, currency);
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function isVisibleAccount(account) {
  const transactionsCount = numberValue(account.transactions_count);
  const balance = Math.abs(numberValue(account.balance_converted ?? account.balance));
  const spent = Math.abs(
    numberValue(account.total_spent_original ?? account.total_spent_converted)
  );
  const income = Math.abs(
    numberValue(account.total_income_original ?? account.total_income_converted)
  );

  if (transactionsCount === 0 && balance === 0 && spent === 0 && income === 0) {
    return false;
  }

  if (account.masked_pan || account.card_mask) {
    return true;
  }

  if (balance > 0) {
    return true;
  }

  return transactionsCount > 0;
}

export default function AccountSelector({
  data,
  selectedAccountId,
  onSelectAccount,
}) {
  const accounts = asArray(data?.by_account).filter(isVisibleAccount);
  const currency = getCurrency(data);

  if (accounts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-[#1B1D23] bg-[#121318] p-3">
      <div className="no-scrollbar flex justify-center overflow-x-auto">
        <div className="flex w-max items-center justify-center gap-3 lg:w-full lg:justify-evenly">
        <button
          aria-pressed={selectedAccountId === ALL_ACCOUNTS_ID}
          className={`flex min-w-[168px] items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition ${
            selectedAccountId === ALL_ACCOUNTS_ID
              ? "border-[#E4BD67] bg-[#1A1B20]"
              : "border-transparent hover:bg-[#1A1B20]"
          }`}
          onClick={() => onSelectAccount(ALL_ACCOUNTS_ID)}
          type="button"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#211D16] text-[#E4BD67]">
            <Layers className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-[#F4F1EA]">
              Усі картки
            </span>
            <span className="mt-1 block text-[11px] text-[#777B85]">
              {accounts.length} рахунки
            </span>
          </span>
        </button>

        {accounts.map((account) => {
            const accountCurrency = account.account_currency ?? currency;
            const accountSpent = account.account_currency
              ? account.total_spent_original ?? account.total_spent_converted
              : account.total_spent_converted;

            return (
          <button
            aria-pressed={selectedAccountId === account.account_id}
            className={`flex min-w-[190px] items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition ${
              selectedAccountId === account.account_id
                ? "border-[#E4BD67] bg-[#1A1B20]"
                : "border-transparent hover:bg-[#1A1B20]"
            }`}
            key={account.account_id}
            onClick={() => onSelectAccount(account.account_id)}
            type="button"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B1D23] text-[#E4BD67]">
              <CreditCard className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-[#F4F1EA]">
                {getCardLabel(account)}
              </span>
              <span className="mt-1 block truncate text-[11px] text-[#777B85]">
                {getAccountType(account)} ·{" "}
                {formatRoundedMoney(accountSpent, accountCurrency)}
              </span>
            </span>
          </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
