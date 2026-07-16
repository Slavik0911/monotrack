import fs from "node:fs";

const sourceWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.9 period comparison query cached sub.json";
const outputWorkflow =
  "C:/Users/Slava/Downloads/monotrack v4.0 dynamic exchange rates cached sub.json";
const outputAggregateCode =
  "C:/Users/Slava/Downloads/monotrack-v4.0-aggregate-code-dynamic-rates.js";

const workflow = JSON.parse(fs.readFileSync(sourceWorkflow, "utf8"));
const aggregateNode = workflow.nodes.find((item) => item.name === "Code in JavaScript");

if (!aggregateNode?.parameters?.jsCode) {
  throw new Error("Aggregate code node was not found.");
}

const oldRatesBlock = `const ratesToUah = {
  980: 1.0,
  840: 41.0,
  978: 44.5
};
`;

const newRatesBlock = `const DEFAULT_RATES_TO_UAH = {
  980: 1.0,
  840: 41.0,
  978: 44.5
};

async function loadRatesToUah() {
  const fallback = {
    source: "fallback",
    fetched_at: new Date().toISOString(),
    rates: { ...DEFAULT_RATES_TO_UAH }
  };

  try {
    const requestOptions = {
      method: "GET",
      url: "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json",
      json: true,
      timeout: 10000
    };

    let response;
    if (this && this.helpers && typeof this.helpers.httpRequest === "function") {
      response = await this.helpers.httpRequest(requestOptions);
    } else if (typeof fetch === "function") {
      const fetchResponse = await fetch(requestOptions.url);
      response = await fetchResponse.json();
    } else {
      return fallback;
    }

    const rows = Array.isArray(response) ? response : [];
    const rates = { ...DEFAULT_RATES_TO_UAH, 980: 1.0 };
    let exchangeDate = null;

    for (const row of rows) {
      const code = Number(row.r030);
      const rate = Number(row.rate);
      if (!Number.isFinite(code) || !Number.isFinite(rate) || rate <= 0) {
        continue;
      }

      if ([840, 978].includes(code)) {
        rates[code] = rate;
        exchangeDate = row.exchangedate || exchangeDate;
      }
    }

    return {
      source: "nbu",
      fetched_at: new Date().toISOString(),
      exchange_date: exchangeDate,
      rates
    };
  } catch (e) {
    return fallback;
  }
}

const exchangeRates = await loadRatesToUah.call(this);
const ratesToUah = exchangeRates.rates;
`;

let code = aggregateNode.parameters.jsCode;

if (!code.includes(oldRatesBlock)) {
  throw new Error("Hardcoded rates block was not found.");
}

code = code.replace(oldRatesBlock, newRatesBlock);

code = code.replace(
  "report_base_currency: BASE_CURRENCY,\n      report_period:",
  "report_base_currency: BASE_CURRENCY,\n      exchange_rates: exchangeRates,\n      report_period:"
);

aggregateNode.parameters.jsCode = code;
workflow.name = "monotrack sub v4.0 dynamic exchange rates";

fs.writeFileSync(outputWorkflow, JSON.stringify(workflow, null, 2));
fs.writeFileSync(outputAggregateCode, code);

console.log(
  JSON.stringify(
    {
      outputWorkflow,
      outputAggregateCode,
      hasNbuUrl: code.includes("bank.gov.ua"),
      hasExchangeRatesOutput: code.includes("exchange_rates: exchangeRates"),
    },
    null,
    2
  )
);
