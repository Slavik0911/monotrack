import fs from "node:fs";

const sourceWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.7 categorizer transfer-pairs cached sub.json";
const outputWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.8 period comparison cached sub.json";
const outputCodeNode =
  "C:/Users/Slava/Downloads/monotrack-v3.8-code-node-period-comparison.js";

const workflow = JSON.parse(fs.readFileSync(sourceWorkflow, "utf8"));

const processNode = workflow.nodes.find(
  (item) => item.name === "Process Transactions (Categories + Transfers)1"
);
const aggregateNode = workflow.nodes.find((item) => item.name === "Code in JavaScript");

if (!processNode?.parameters?.jsCode || !aggregateNode?.parameters?.jsCode) {
  throw new Error("Required n8n code nodes were not found.");
}

function replaceBlock(source, startNeedle, endNeedle, replacement) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Could not replace block: ${startNeedle}`);
  }

  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

const periodFilterBlock = `// Date periods:
// current: 1st day of this month through today
// previous: same day range in the previous month
const now = new Date();
const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
currentStart.setHours(0, 0, 0, 0);

const currentEnd = new Date(now);
currentEnd.setHours(23, 59, 59, 999);

const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
previousStart.setHours(0, 0, 0, 0);

const previousEndDay = Math.min(
  now.getDate(),
  new Date(now.getFullYear(), now.getMonth(), 0).getDate()
);
const previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, previousEndDay);
previousEnd.setHours(23, 59, 59, 999);

const transactions = allTransactions
  .map(tx => {
    const txDate = new Date(tx.tx_time);
    const period =
      txDate >= currentStart && txDate <= currentEnd
        ? "current"
        : txDate >= previousStart && txDate <= previousEnd
          ? "previous"
          : null;

    return period ? { ...tx, period } : null;
  })
  .filter(Boolean);

if (!transactions.length) {
  return [];
}

`;

let processCode = processNode.parameters.jsCode;
processCode = replaceBlock(
  processCode,
  "// 📅 ФІЛЬТР: Залишаємо транзакції лише за останні 30 днів",
  "// 🧠 Нормалізуємо час та суми одразу",
  periodFilterBlock
);

processCode = processCode.replace(
  "date: tx.tx_time.split('T')[0], \n\n      type:",
  "date: tx.tx_time.split('T')[0], \n      period: tx.period || \"current\",\n\n      type:"
);

processNode.parameters.jsCode = processCode;

const aggregateCode = `const rawItems = $input.all();
const transactions = rawItems
  .map(item => item.json)
  .filter(tx => tx && tx.id);

const currentTransactions = transactions.filter(tx => tx.period !== 'previous');
const previousTransactions = transactions.filter(tx => tx.period === 'previous');

let BASE_CURRENCY = "UAH";
try {
  BASE_CURRENCY = String($('Settings').first().json.target_currency || 'UAH').toUpperCase();
} catch (e) {
  BASE_CURRENCY = "UAH";
}

const ratesToUah = {
  980: 1.0,
  840: 41.0,
  978: 44.5
};

const currencyMap = { UAH: 980, USD: 840, EUR: 978 };
const targetCurrencyCode = currencyMap[BASE_CURRENCY] || 980;

function roundMoney(value) {
  const number = Number(value || 0);
  return Number(number.toFixed(2));
}

function roundPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : null;
}

function getChangePercent(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (previousValue <= 0) {
    return currentValue > 0 ? null : 0;
  }

  return roundPercent(((currentValue - previousValue) / previousValue) * 100);
}

function convertAmount(amount, fromCode, toCode) {
  const from = Number(fromCode || 980);
  const to = Number(toCode || 980);
  const value = Number(amount || 0);

  if (from === to) return value;

  const amountInUah = value * (ratesToUah[from] || 1.0);
  return amountInUah / (ratesToUah[to] || 1.0);
}

function getAccountsCache() {
  try {
    return $getWorkflowStaticData('global');
  } catch (e) {
    return null;
  }
}

function getAccountsFromMono() {
  const cache = getAccountsCache();

  try {
    const payload = $('Get Account Balances').first().json;
    const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];

    if (accounts.length > 0) {
      if (cache) {
        cache.monobank_accounts = accounts;
        cache.monobank_accounts_updated_at = new Date().toISOString();
      }

      return accounts;
    }
  } catch (e) {
    // Fall through to the last successful Monobank accounts payload.
  }

  if (cache && Array.isArray(cache.monobank_accounts)) {
    return cache.monobank_accounts;
  }

  return [];
}

function getMajorAmount(tx) {
  if (typeof tx.amount === 'number' && Math.abs(tx.amount) >= 100) {
    return tx.amount / 100;
  }

  if (typeof tx.amount_human === 'number') {
    return tx.amount < 0 ? -Math.abs(tx.amount_human) : Math.abs(tx.amount_human);
  }

  return Number(tx.amount || 0);
}

function getConvertedSignedAmount(tx) {
  const majorAmount = getMajorAmount(tx);
  const converted = convertAmount(Math.abs(majorAmount), tx.currency_code, targetCurrencyCode);
  return majorAmount < 0 ? -converted : converted;
}

function getDateKey(tx) {
  if (tx.date) return String(tx.date).slice(0, 10);
  if (tx.tx_time) return new Date(tx.tx_time).toISOString().slice(0, 10);
  return 'unknown';
}

function generateBreakdown(categoriesMap, totalAmount) {
  return Object.entries(categoriesMap)
    .map(([category, amount]) => ({
      category,
      amount_converted: roundMoney(amount),
      percent: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0
    }))
    .sort((a, b) => b.amount_converted - a.amount_converted);
}

function getMaskedAccount(account) {
  const maskedPan = Array.isArray(account.maskedPan) ? account.maskedPan[0] : account.maskedPan;
  if (maskedPan) return maskedPan;
  if (account.iban) return account.iban;
  return account.id;
}

function createPeriodSummary(list) {
  let spent = 0;
  let income = 0;
  const byAccount = {};

  for (const tx of list) {
    const accountId = tx.account_id || 'unknown_account';
    const convertedAbs = Math.abs(getConvertedSignedAmount(tx));

    if (!byAccount[accountId]) {
      byAccount[accountId] = { spent: 0, income: 0 };
    }

    if (tx.type === 'expense' && !tx.is_transfer) {
      spent += convertedAbs;
      byAccount[accountId].spent += convertedAbs;
    }

    if (tx.type === 'income' && !tx.is_transfer) {
      income += convertedAbs;
      byAccount[accountId].income += convertedAbs;
    }
  }

  return {
    spent,
    income,
    byAccount
  };
}

const monoAccounts = getAccountsFromMono();
const accountMeta = new Map();

for (const account of monoAccounts) {
  const currencyCode = Number(account.currencyCode || 980);
  const balance = convertAmount(Number(account.balance || 0) / 100, currencyCode, targetCurrencyCode);
  const creditLimit = convertAmount(Number(account.creditLimit || 0) / 100, currencyCode, targetCurrencyCode);

  accountMeta.set(account.id, {
    account_id: account.id,
    account_type: account.type || null,
    currency_code: currencyCode,
    masked_pan: getMaskedAccount(account),
    cashback_type: account.cashbackType || null,
    balance_converted: roundMoney(balance),
    credit_limit_converted: roundMoney(creditLimit)
  });
}

const expenses = currentTransactions.filter(tx => tx.type === 'expense' && !tx.is_transfer);
const incomes = currentTransactions.filter(tx => tx.type === 'income' && !tx.is_transfer);
const transfers = currentTransactions.filter(tx => tx.is_transfer || tx.type === 'transfer');
const previousSummary = createPeriodSummary(previousTransactions);

let totalSpent = 0;
let totalIncome = 0;
const globalCategories = {};
const dailyExpenses = {};
const accountsData = {};

function ensureAccount(accountId, txCurrencyCode = 980) {
  const id = accountId || 'unknown_account';
  if (!accountsData[id]) {
    const meta = accountMeta.get(id) || {};
    accountsData[id] = {
      account_id: id,
      account_type: meta.account_type || null,
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
      net_flow_converted: 0,
      transactions_count: 0,
      expenses_count: 0,
      income_count: 0,
      transfer_count: 0,
      categories: {}
    };
  }

  return accountsData[id];
}

for (const account of monoAccounts) {
  ensureAccount(account.id, account.currencyCode);
}

for (const tx of currentTransactions) {
  const account = ensureAccount(tx.account_id, tx.currency_code);
  const convertedSigned = getConvertedSignedAmount(tx);
  const convertedAbs = Math.abs(convertedSigned);

  account.transactions_count++;
  account.net_flow_converted += convertedSigned;

  if (tx.type === 'expense' && !tx.is_transfer) {
    const category = tx.category || 'other';
    totalSpent += convertedAbs;
    account.total_spent_original += Math.abs(getMajorAmount(tx));
    account.total_spent_converted += convertedAbs;
    account.expenses_count++;
    account.categories[category] = (account.categories[category] || 0) + convertedAbs;
    globalCategories[category] = (globalCategories[category] || 0) + convertedAbs;

    const dateKey = getDateKey(tx);
    dailyExpenses[dateKey] = (dailyExpenses[dateKey] || 0) + convertedAbs;
  }

  if (tx.type === 'income' && !tx.is_transfer) {
    totalIncome += convertedAbs;
    account.total_income_converted += convertedAbs;
    account.income_count++;
  }

  if (tx.is_transfer || tx.type === 'transfer') {
    account.transfer_count++;
  }
}

for (const [accountId, summary] of Object.entries(previousSummary.byAccount)) {
  const account = ensureAccount(accountId);
  account.previous_spent_converted = summary.spent;
  account.previous_income_converted = summary.income;
}

const byAccountResult = Object.values(accountsData)
  .map(account => {
    const breakdown = generateBreakdown(account.categories, account.total_spent_converted);
    const topCategory = breakdown[0] || null;
    const previousSpent = roundMoney(account.previous_spent_converted);
    const previousIncome = roundMoney(account.previous_income_converted);

    return {
      account_id: account.account_id,
      account_type: account.account_type,
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
      net_flow_converted: roundMoney(account.net_flow_converted),
      transactions_count: account.transactions_count,
      expenses_count: account.expenses_count,
      income_count: account.income_count,
      transfer_count: account.transfer_count,
      top_category: topCategory ? topCategory.category : null,
      breakdown
    };
  })
  .sort((a, b) => b.total_spent_converted - a.total_spent_converted);

const globalBreakdown = generateBreakdown(globalCategories, totalSpent);
const topGlobal = globalBreakdown[0] || null;

const chartData = Object.entries(dailyExpenses)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([date, amount]) => ({
    date,
    day: String(new Date(date).getDate()),
    label: new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' }).format(new Date(date)),
    amount: roundMoney(amount)
  }));

const recentTransactions = currentTransactions
  .slice()
  .sort((a, b) => new Date(b.tx_time || b.date || 0) - new Date(a.tx_time || a.date || 0))
  .map(tx => {
    const account = accountMeta.get(tx.account_id) || {};
    const signedConverted = getConvertedSignedAmount(tx);

    return {
      id: tx.id,
      account_id: tx.account_id || null,
      account_name: account.masked_pan || tx.account_id || 'unknown_account',
      account_type: account.account_type || null,
      amount_original: roundMoney(getMajorAmount(tx)),
      amount_converted: roundMoney(signedConverted),
      amount_abs_converted: roundMoney(Math.abs(signedConverted)),
      report_currency: BASE_CURRENCY,
      currency_code: Number(tx.currency_code || 980),
      description: tx.description || '',
      tx_time: tx.tx_time || null,
      date: getDateKey(tx),
      period: tx.period || 'current',
      type: tx.type || (signedConverted > 0 ? 'income' : 'expense'),
      is_transfer: Boolean(tx.is_transfer),
      mcc: Number(tx.mcc || 0),
      category: tx.category || 'other'
    };
  });

const totalBalance = byAccountResult.reduce((sum, account) => {
  return typeof account.balance_converted === 'number' ? sum + account.balance_converted : sum;
}, 0);

const previousSpent = roundMoney(previousSummary.spent);
const previousIncome = roundMoney(previousSummary.income);

return [
  {
    json: {
      report_base_currency: BASE_CURRENCY,
      report_period: {
        current: 'month_to_date',
        previous: 'same_period_previous_month'
      },
      global: {
        total_balance_converted: monoAccounts.length ? roundMoney(totalBalance) : null,
        total_income_converted: roundMoney(totalIncome),
        total_spent_converted: roundMoney(totalSpent),
        previous_income_converted: previousIncome,
        previous_spent_converted: previousSpent,
        income_change_percent: getChangePercent(totalIncome, previousIncome),
        spent_change_percent: getChangePercent(totalSpent, previousSpent),
        net_flow_converted: roundMoney(totalIncome - totalSpent),
        transactions_count: currentTransactions.length,
        previous_transactions_count: previousTransactions.length,
        expenses_count: expenses.length,
        income_count: incomes.length,
        transfer_count: transfers.length,
        accounts_count: byAccountResult.length,
        top_category: topGlobal ? topGlobal.category : null,
        top_percent: topGlobal ? topGlobal.percent : 0,
        breakdown: globalBreakdown,
        chartData
      },
      chartData,
      transactions: recentTransactions,
      by_account: byAccountResult
    }
  }
];
`;

aggregateNode.parameters.jsCode = aggregateCode;
workflow.name = "monotrack sub v3.8 period comparison";

fs.writeFileSync(outputWorkflow, JSON.stringify(workflow, null, 2));
fs.writeFileSync(outputCodeNode, processNode.parameters.jsCode);

console.log(
  JSON.stringify(
    {
      outputWorkflow,
      outputCodeNode,
      processCodeChars: processNode.parameters.jsCode.length,
      aggregateCodeChars: aggregateNode.parameters.jsCode.length,
      hasPeriodField: processNode.parameters.jsCode.includes("period: tx.period"),
      hasChangePercent: aggregateNode.parameters.jsCode.includes("income_change_percent"),
    },
    null,
    2
  )
);
