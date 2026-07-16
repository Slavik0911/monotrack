import fs from "node:fs";

const inputPath =
  "C:/Users/Slava/Downloads/monotrack v4.1 account currency stats cached sub.json";
const outputPath =
  "C:/Users/Slava/Downloads/monotrack v4.2 sport pets categories cached sub.json";
const codeOutputPath =
  "C:/Users/Slava/Downloads/monotrack-v4.2-process-code-sport-pets.js";

const workflow = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const processNode = workflow.nodes.find((node) =>
  String(node.name).includes("Process Transactions")
);

if (!processNode?.parameters?.jsCode) {
  throw new Error("Process Transactions node was not found");
}

let code = processNode.parameters.jsCode;

const mccCategoryOverrides = {
  "0742": "pets",
  "5995": "pets",
  "5941": "sport",
  "7941": "sport",
  "7997": "sport",
};

for (const [mcc, category] of Object.entries(mccCategoryOverrides)) {
  const pattern = new RegExp(`("${mcc}":")([^"]+)(")`, "g");
  if (!pattern.test(code)) {
    throw new Error(`MCC ${mcc} was not found in embedded MCC_MAP`);
  }

  code = code.replace(pattern, `$1${category}$3`);
}

processNode.parameters.jsCode = code;
workflow.name = "monotrack sub v4.2";

fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2), "utf8");
fs.writeFileSync(codeOutputPath, code, "utf8");

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${codeOutputPath}`);
