import fs from "node:fs";

const sourceWorkflow =
  "C:/Users/Slava/Downloads/monotrack v4.0 dynamic exchange rates cached sub.json";
const outputWorkflow =
  "C:/Users/Slava/Downloads/monotrack v4.1 account currency stats cached sub.json";
const outputAggregateCode =
  "C:/Users/Slava/Downloads/monotrack-v4.1-aggregate-code-account-currency.js";

const workflow = JSON.parse(fs.readFileSync(sourceWorkflow, "utf8"));
const aggregateNode = workflow.nodes.find((item) => item.name === "Code in JavaScript");

if (!aggregateNode?.parameters?.jsCode) {
  throw new Error("Aggregate code node was not found.");
}

let code = aggregateNode.parameters.jsCode;

code = code.replace(
  "const currencyMap = { UAH: 980, USD: 840, EUR: 978 };\nconst targetCurrencyCode = currencyMap[BASE_CURRENCY] || 980;",
  `const currencyMap = { UAH: 980, USD: 840, EUR: 978 };
const currencyNameByCode = { 980: "UAH", 840: "USD", 978: "EUR" };
const targetCurrencyCode = currencyMap[BASE_CURRENCY] || 980;

function getCurrencyName(code) {
  return currencyNameByCode[Number(code)] || "UAH";
}`
);

code = code.replace(
  `  const balance = convertAmount(Number(account.balance || 0) / 100, currencyCode, targetCurrencyCode);
  const creditLimit = convertAmount(Number(account.creditLimit || 0) / 100, currencyCode, targetCurrencyCode);

  accountMeta.set(account.id, {
    account_id: account.id,
    account_type: account.type || null,
    currency_code: currencyCode,
    masked_pan: getMaskedAccount(account),
    cashback_type: account.cashbackType || null,
    balance_converted: roundMoney(balance),
    credit_limit_converted: roundMoney(creditLimit)
  });`,
  `  const balanceOriginal = Number(account.balance || 0) / 100;
  const creditLimitOriginal = Number(account.creditLimit || 0) / 100;
  const balance = convertAmount(balanceOriginal, currencyCode, targetCurrencyCode);
  const creditLimit = convertAmount(creditLimitOriginal, currencyCode, targetCurrencyCode);

  accountMeta.set(account.id, {
    account_id: account.id,
    account_type: account.type || null,
    account_currency: getCurrencyName(currencyCode),
    currency_code: currencyCode,
    masked_pan: getMaskedAccount(account),
    cashback_type: account.cashbackType || null,
    balance_original: roundMoney(balanceOriginal),
    balance_converted: roundMoney(balance),
    credit_limit_original: roundMoney(creditLimitOriginal),
    credit_limit_converted: roundMoney(creditLimit)
  });`
);

code = code.replace(
  `    if (!byAccount[accountId]) {
      byAccount[accountId] = { spent: 0, income: 0 };
    }

    if (tx.type === 'expense' && !tx.is_transfer) {
      spent += convertedAbs;
      byAccount[accountId].spent += convertedAbs;
    }

    if (tx.type === 'income' && !tx.is_transfer) {
      income += convertedAbs;
      byAccount[accountId].income += convertedAbs;
    }`,
  `    if (!byAccount[accountId]) {
      byAccount[accountId] = {
        spent: 0,
        income: 0,
        spentOriginal: 0,
        incomeOriginal: 0
      };
    }

    const originalAbs = Math.abs(getMajorAmount(tx));

    if (tx.type === 'expense' && !tx.is_transfer) {
      spent += convertedAbs;
      byAccount[accountId].spent += convertedAbs;
      byAccount[accountId].spentOriginal += originalAbs;
    }

    if (tx.type === 'income' && !tx.is_transfer) {
      income += convertedAbs;
      byAccount[accountId].income += convertedAbs;
      byAccount[accountId].incomeOriginal += originalAbs;
    }`
);

code = code.replace(
  `      account_type: meta.account_type || null,
      currency_code: meta.currency_code || Number(txCurrencyCode || 980),
      masked_pan: meta.masked_pan || null,
      cashback_type: meta.cashback_type || null,
      balance_converted: meta.balance_converted ?? null,
      credit_limit_converted: meta.credit_limit_converted ?? null,
      total_spent_original: 0,
      total_spent_converted: 0,
      total_income_converted: 0,
      previous_spent_converted: 0,
      previous_income_converted: 0,
      spent_change_percent: null,
      income_change_percent: null,
      net_flow_converted: 0,`,
  `      account_type: meta.account_type || null,
      account_currency: meta.account_currency || getCurrencyName(txCurrencyCode),
      currency_code: meta.currency_code || Number(txCurrencyCode || 980),
      masked_pan: meta.masked_pan || null,
      cashback_type: meta.cashback_type || null,
      balance_original: meta.balance_original ?? null,
      balance_converted: meta.balance_converted ?? null,
      credit_limit_original: meta.credit_limit_original ?? null,
      credit_limit_converted: meta.credit_limit_converted ?? null,
      total_spent_original: 0,
      total_spent_converted: 0,
      total_income_original: 0,
      total_income_converted: 0,
      previous_spent_original: 0,
      previous_spent_converted: 0,
      previous_income_original: 0,
      previous_income_converted: 0,
      spent_change_percent: null,
      income_change_percent: null,
      net_flow_original: 0,
      net_flow_converted: 0,`
);

code = code.replace(
  `  account.net_flow_converted += convertedSigned;`,
  `  account.net_flow_converted += convertedSigned;
  account.net_flow_original += getMajorAmount(tx);`
);

code = code.replace(
  `    account.total_income_converted += convertedAbs;`,
  `    account.total_income_original += Math.abs(getMajorAmount(tx));
    account.total_income_converted += convertedAbs;`
);

code = code.replace(
  `  account.previous_spent_converted = summary.spent;
  account.previous_income_converted = summary.income;`,
  `  account.previous_spent_original = summary.spentOriginal;
  account.previous_spent_converted = summary.spent;
  account.previous_income_original = summary.incomeOriginal;
  account.previous_income_converted = summary.income;`
);

code = code.replace(
  `    const previousSpent = roundMoney(account.previous_spent_converted);
    const previousIncome = roundMoney(account.previous_income_converted);`,
  `    const previousSpent = roundMoney(account.previous_spent_converted);
    const previousIncome = roundMoney(account.previous_income_converted);
    const previousSpentOriginal = roundMoney(account.previous_spent_original);
    const previousIncomeOriginal = roundMoney(account.previous_income_original);`
);

code = code.replace(
  `      account_type: account.account_type,
      currency_code: account.currency_code,
      masked_pan: account.masked_pan,
      cashback_type: account.cashback_type,
      balance_converted: account.balance_converted,
      credit_limit_converted: account.credit_limit_converted,
      total_spent_original: roundMoney(account.total_spent_original),
      total_spent_converted: roundMoney(account.total_spent_converted),
      total_income_converted: roundMoney(account.total_income_converted),
      previous_spent_converted: previousSpent,
      previous_income_converted: previousIncome,
      spent_change_percent: getChangePercent(account.total_spent_converted, previousSpent),
      income_change_percent: getChangePercent(account.total_income_converted, previousIncome),
      net_flow_converted: roundMoney(account.net_flow_converted),`,
  `      account_type: account.account_type,
      account_currency: account.account_currency,
      currency_code: account.currency_code,
      masked_pan: account.masked_pan,
      cashback_type: account.cashback_type,
      balance_original: account.balance_original,
      balance_converted: account.balance_converted,
      credit_limit_original: account.credit_limit_original,
      credit_limit_converted: account.credit_limit_converted,
      total_spent_original: roundMoney(account.total_spent_original),
      total_spent_converted: roundMoney(account.total_spent_converted),
      total_income_original: roundMoney(account.total_income_original),
      total_income_converted: roundMoney(account.total_income_converted),
      previous_spent_original: previousSpentOriginal,
      previous_spent_converted: previousSpent,
      previous_income_original: previousIncomeOriginal,
      previous_income_converted: previousIncome,
      spent_change_percent: getChangePercent(account.total_spent_original, previousSpentOriginal),
      income_change_percent: getChangePercent(account.total_income_original, previousIncomeOriginal),
      net_flow_original: roundMoney(account.net_flow_original),
      net_flow_converted: roundMoney(account.net_flow_converted),`
);

code = code.replace(
  `      amount_original: roundMoney(getMajorAmount(tx)),
      amount_converted: roundMoney(signedConverted),`,
  `      amount_original: roundMoney(getMajorAmount(tx)),
      amount_abs_original: roundMoney(Math.abs(getMajorAmount(tx))),
      amount_converted: roundMoney(signedConverted),`
);

aggregateNode.parameters.jsCode = code;
workflow.name = "monotrack sub v4.1 account currency stats";

fs.writeFileSync(outputWorkflow, JSON.stringify(workflow, null, 2));
fs.writeFileSync(outputAggregateCode, code);

console.log(
  JSON.stringify(
    {
      outputWorkflow,
      outputAggregateCode,
      hasAccountCurrency: code.includes("account_currency"),
      hasOriginalBalance: code.includes("balance_original"),
      hasOriginalAmounts: code.includes("amount_abs_original"),
    },
    null,
    2
  )
);
