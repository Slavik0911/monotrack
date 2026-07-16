const currencySymbols = {
  EUR: "€",
  UAH: "₴",
  USD: "$",
};

const currencyByCode = {
  840: "USD",
  978: "EUR",
  980: "UAH",
};

export function getCurrencyByCode(code) {
  return currencyByCode[Number(code)];
}

export function getCurrency(data) {
  return (
    data?.selected_account?.account_currency ??
    data?.report_base_currency ??
    "UAH"
  );
}

export function getCurrencySymbol(currency = "UAH") {
  return currencySymbols[currency] ?? currency;
}

export function hasNumber(value) {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  return Number.isFinite(Number(value));
}

export function formatMoney(value, currency = "UAH") {
  if (!hasNumber(value)) {
    return "—";
  }

  const number = Number(value);

  return `${number.toLocaleString("uk-UA", {
    maximumFractionDigits: 2,
    minimumFractionDigits: number % 1 === 0 ? 0 : 2,
  })} ${getCurrencySymbol(currency)}`;
}

export function formatNumber(value) {
  if (!hasNumber(value)) {
    return "—";
  }

  const number = Number(value);
  return number.toLocaleString("uk-UA");
}

export function formatPercent(value) {
  if (!hasNumber(value)) {
    return "—";
  }

  const number = Number(value);
  return `${Math.round(number)}%`;
}
