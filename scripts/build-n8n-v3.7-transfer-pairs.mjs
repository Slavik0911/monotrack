import fs from "node:fs";

const sourceWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.6 categorizer transfers cached sub.json";
const outputWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.7 categorizer transfer-pairs cached sub.json";
const outputCodeNode =
  "C:/Users/Slava/Downloads/monotrack-v3.7-code-node-transfer-pairs.js";

const workflow = JSON.parse(fs.readFileSync(sourceWorkflow, "utf8"));
const node = workflow.nodes.find(
  (item) => item.name === "Process Transactions (Categories + Transfers)1"
);

if (!node?.parameters?.jsCode) {
  throw new Error("Process Transactions code node was not found.");
}

const transferBlock = `/**
 * Покращена one-to-one логіка детекції трансферів.
 * Важливо: не всі MCC 4829 є внутрішніми трансферами.
 * Тому шукаємо пари між різними своїми рахунками і не даємо одній операції
 * матчитися з кількома іншими операціями.
 */
const TRANSFER_MCC = new Set([
  4829, 6010, 6011, 6012, 6050, 6051, 6211,
  6532, 6533, 6536, 6537, 6538, 6540,
]);

function txDateKey(tx) {
  return String(tx.tx_time || "").slice(0, 10);
}

function hasFullTimestamp(tx) {
  return /T\\d{2}:\\d{2}/.test(String(tx.tx_time || ""));
}

function timeDeltaMs(a, b) {
  if (!hasFullTimestamp(a) || !hasFullTimestamp(b)) {
    return txDateKey(a) === txDateKey(b) ? 0 : Number.POSITIVE_INFINITY;
  }

  return Math.abs(a.time_ms - b.time_ms);
}

function transferDesc(tx) {
  return String(tx.description || "").toLowerCase();
}

function hasTransferMcc(tx) {
  return TRANSFER_MCC.has(Number(tx.mcc || 0));
}

function isOutgoingCardTransfer(tx) {
  const desc = transferDesc(tx);
  return (
    tx.amount < 0 &&
    hasTransferMcc(tx) &&
    (
      desc.includes("переказ на картку") ||
      desc.includes("переказ на карту") ||
      desc.includes("card transfer") ||
      desc.includes("p2p")
    )
  );
}

function isIncomingOwnCard(tx) {
  const desc = transferDesc(tx);
  return (
    tx.amount > 0 &&
    hasTransferMcc(tx) &&
    (
      desc.includes("з єврової картки") ||
      desc.includes("з еврової картки") ||
      desc.includes("з доларової картки") ||
      desc.includes("з чорної картки") ||
      desc.includes("з білої картки") ||
      desc.includes("з картки") ||
      desc.includes("з карти") ||
      desc.includes("from own card")
    )
  );
}

function hasExchangeText(tx) {
  const desc = transferDesc(tx);
  return (
    desc.includes("обмін") ||
    desc.includes("валют") ||
    desc.includes("євров") ||
    desc.includes("евров") ||
    desc.includes("доларов") ||
    desc.includes("eur") ||
    desc.includes("usd")
  );
}

function amountRatioDiff(a, b) {
  const amountA = Math.abs(a.amount);
  const amountB = Math.abs(b.amount);
  const max = Math.max(amountA, amountB);
  return max > 0 ? Math.abs(amountA - amountB) / max : 1;
}

function currencyPairScore(a, b) {
  const amountA = Math.abs(a.amount);
  const amountB = Math.abs(b.amount);
  const min = Math.min(amountA, amountB);
  const max = Math.max(amountA, amountB);

  if (!min || !max) return 0;

  const ratio = max / min;
  if (ratio >= 25 && ratio <= 70) return 115;
  if (ratio >= 20 && ratio <= 90) return 110;
  return 105;
}

function isSameAmountTransfer(a, b) {
  return amountRatioDiff(a, b) <= 0.03;
}

function scoreTransferPair(a, b) {
  if (!a || !b) return null;
  if (a.account_id === b.account_id) return null;
  if (a.amount * b.amount >= 0) return null;

  const delta = timeDeltaMs(a, b);
  if (!Number.isFinite(delta)) return null;

  const sameDateOnly = !hasFullTimestamp(a) || !hasFullTimestamp(b);
  const tenMinutes = 10 * 60 * 1000;
  const sixHours = 6 * 60 * 60 * 1000;
  const closeEnough = sameDateOnly || delta <= tenMinutes;
  const currencyWindow = sameDateOnly || delta <= sixHours;
  const ratioDiff = amountRatioDiff(a, b);

  const outgoing = isOutgoingCardTransfer(a) ? a : isOutgoingCardTransfer(b) ? b : null;
  const incomingOwn = isIncomingOwnCard(a) ? a : isIncomingOwnCard(b) ? b : null;

  if (outgoing && incomingOwn && currencyWindow) {
    return {
      a,
      b,
      score: isSameAmountTransfer(a, b) ? 120 : currencyPairScore(a, b),
      delta,
      ratioDiff,
    };
  }

  const bothFinancial = hasTransferMcc(a) && hasTransferMcc(b);
  if (bothFinancial && closeEnough && isSameAmountTransfer(a, b)) {
    return { a, b, score: 100, delta, ratioDiff };
  }

  const exchangePair =
    bothFinancial &&
    currencyWindow &&
    (hasExchangeText(a) || hasExchangeText(b)) &&
    (isOutgoingCardTransfer(a) || isOutgoingCardTransfer(b) || isIncomingOwnCard(a) || isIncomingOwnCard(b));

  if (exchangePair) {
    return { a, b, score: 90, delta, ratioDiff };
  }

  return null;
}

// 🔍 Шукаємо пари внутрішніх трансферів one-to-one
const transferIds = new Set();
const transferCandidates = [];

for (let i = 0; i < transactions.length; i++) {
  for (let j = i + 1; j < transactions.length; j++) {
    const candidate = scoreTransferPair(transactions[i], transactions[j]);
    if (candidate) transferCandidates.push(candidate);
  }
}

transferCandidates.sort((left, right) => {
  if (right.score !== left.score) return right.score - left.score;
  if (left.delta !== right.delta) return left.delta - right.delta;
  return left.ratioDiff - right.ratioDiff;
});

for (const candidate of transferCandidates) {
  if (transferIds.has(candidate.a.id) || transferIds.has(candidate.b.id)) continue;
  transferIds.add(candidate.a.id);
  transferIds.add(candidate.b.id);
}

`;

const code = node.parameters.jsCode;
const start = code.indexOf("/**\n * Покращена логіка детекції трансферів");
const fallbackStart = code.indexOf("function isTransfer");
const blockStart = start === -1 ? fallbackStart : start;
const blockEnd = code.indexOf("// 🧾 Формуємо фінальний результат");

if (blockStart === -1 || blockEnd === -1 || blockEnd <= blockStart) {
  throw new Error("Could not find transfer detection block.");
}

node.parameters.jsCode = `${code.slice(0, blockStart)}${transferBlock}${code.slice(blockEnd)}`;
workflow.name = "monotrack sub v3.7 categorizer transfer-pairs";

fs.writeFileSync(outputWorkflow, JSON.stringify(workflow, null, 2));
fs.writeFileSync(outputCodeNode, node.parameters.jsCode);

console.log(
  JSON.stringify(
    {
      outputWorkflow,
      outputCodeNode,
      codeChars: node.parameters.jsCode.length,
      hasOneToOne: node.parameters.jsCode.includes("transferCandidates.sort"),
      hasEuroCardRule: node.parameters.jsCode.includes("з єврової картки"),
    },
    null,
    2
  )
);
