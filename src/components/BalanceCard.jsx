import premiumCardImage from "../assets/premium-card.png";
import { formatCardMask } from "../utils/card";
import { formatMoney, formatNumber, getCurrency } from "../utils/format";

function getBalance(data) {
  return (
    data?.global?.total_balance_converted ??
    data?.global?.total_balance ??
    data?.global?.balance_converted ??
    data?.global?.balance
  );
}

function formatRoundedMoney(value, currency) {
  const number = Number(value);
  return formatMoney(Number.isFinite(number) ? Math.round(number) : value, currency);
}

export default function BalanceCard({ data }) {
  const currency = getCurrency(data);
  const balance = getBalance(data);
  const selectedAccount = data?.selected_account;
  const accountsCount = Array.isArray(data?.by_account)
    ? data.by_account.length
    : 0;
  const accountBadge =
    (selectedAccount?.masked_pan || selectedAccount?.card_mask
      ? formatCardMask(selectedAccount.masked_pan ?? selectedAccount.card_mask)
      : null) ??
    selectedAccount?.account_id ??
    (accountsCount > 0 ? `${accountsCount} рахунки` : "—");
  const reportLabel = selectedAccount?.account_type
    ? `${selectedAccount.account_type} картка`
    : `${currency} звіт`;

  return (
    <article
      className="relative min-h-[214px] overflow-hidden rounded-[30px] border border-[#2A241B] p-5 sm:p-7"
      style={{
        background:
          "radial-gradient(circle at 86% 88%, rgba(228, 189, 103, 0.13), transparent 31%), radial-gradient(circle at 76% 16%, rgba(228, 189, 103, 0.06), transparent 26%), radial-gradient(circle at 18% 8%, rgba(139, 143, 152, 0.1), transparent 34%), linear-gradient(145deg, #1A1B22 0%, #14151B 44%, #0B0C10 100%)",
      }}
    >
      <div className="relative z-10 flex h-full min-h-[174px] flex-col justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.19em] text-[#858894]">
            Основний баланс
          </p>
          <h2 className="mt-3 text-[42px] font-semibold leading-none text-[#F4F1EA] sm:text-[54px]">
            {formatRoundedMoney(balance, currency)}
          </h2>
          <p className="mt-3 text-[12px] text-[#797D87]">
            {balance == null
              ? "Баланс відсутній у відповіді API"
              : `${formatNumber(data?.global?.transactions_count)} транзакцій у звіті`}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-full bg-[#1A1B20] px-4 py-2 text-[12px] text-[#D6AE4D]">
              {accountBadge}
            </div>
            <span className="text-[12px] text-[#777B85]">
              {reportLabel}
            </span>
          </div>

        </div>
      </div>

      <img
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-8 hidden w-[160px] select-none md:block lg:right-0"
        draggable="false"
        src={premiumCardImage}
      />
    </article>
  );
}
