import fs from "node:fs";

const inputPath =
  "C:/Users/Slava/Downloads/monotrack v4.2 sport pets categories cached sub.json";
const outputPath =
  "C:/Users/Slava/Downloads/monotrack v4.3 limited transactions response cached sub.json";
const codeOutputPath =
  "C:/Users/Slava/Downloads/monotrack-v4.3-aggregate-code-limited-transactions.js";

const workflow = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const aggregateNode = workflow.nodes.find(
  (node) => node.name === "Code in JavaScript"
);

if (!aggregateNode?.parameters?.jsCode) {
  throw new Error("Aggregate Code in JavaScript node was not found");
}

let code = aggregateNode.parameters.jsCode;

code = code.replace(
  `const previousTransactions = transactions.filter(tx => tx.period === 'previous');`,
  `const previousTransactions = transactions.filter(tx => tx.period === 'previous');
const TRANSACTIONS_RESPONSE_LIMIT = 120;`
);

code = code.replace(
  `const recentTransactions = currentTransactions
  .slice()
  .sort((a, b) => new Date(b.tx_time || b.date || 0) - new Date(a.tx_time || a.date || 0))
  .map(tx => {`,
  `const recentTransactions = currentTransactions
  .slice()
  .sort((a, b) => new Date(b.tx_time || b.date || 0) - new Date(a.tx_time || a.date || 0))
  .slice(0, TRANSACTIONS_RESPONSE_LIMIT)
  .map(tx => {`
);

code = code.replace(
  `        transactions_count: currentTransactions.length,
        previous_transactions_count: previousTransactions.length,`,
  `        transactions_count: currentTransactions.length,
        transactions_returned: recentTransactions.length,
        transactions_limit: TRANSACTIONS_RESPONSE_LIMIT,
        previous_transactions_count: previousTransactions.length,`
);

if (!code.includes(".slice(0, TRANSACTIONS_RESPONSE_LIMIT)")) {
  throw new Error("Transaction response limit patch was not applied");
}

aggregateNode.parameters.jsCode = code;
workflow.name = "monotrack sub v4.3";

fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2), "utf8");
fs.writeFileSync(codeOutputPath, code, "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      codeOutputPath,
      limit: 120,
      hasLimit: code.includes(".slice(0, TRANSACTIONS_RESPONSE_LIMIT)"),
    },
    null,
    2
  )
);
