import fs from "node:fs";

const sourceWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.8 period comparison cached sub.json";
const outputWorkflow =
  "C:/Users/Slava/Downloads/monotrack v3.9 period comparison query cached sub.json";

const workflow = JSON.parse(fs.readFileSync(sourceWorkflow, "utf8"));
const supabaseNode = workflow.nodes.find((item) => item.name === "Get many rows");

if (!supabaseNode?.parameters?.filters?.conditions) {
  throw new Error("Supabase Get many rows node filters were not found.");
}

const txTimeFilter = supabaseNode.parameters.filters.conditions.find(
  (condition) => condition.keyName === "tx_time" && condition.condition === "gte"
);

if (!txTimeFilter) {
  throw new Error("tx_time gte filter was not found.");
}

txTimeFilter.keyValue =
  "={{ $now.minus({ months: 1 }).startOf('month').toFormat('yyyy-MM-dd HH:mm:ss') }}";

workflow.name = "monotrack sub v3.9 period comparison query";

fs.writeFileSync(outputWorkflow, JSON.stringify(workflow, null, 2));

console.log(
  JSON.stringify(
    {
      outputWorkflow,
      txTimeFilter: txTimeFilter.keyValue,
    },
    null,
    2
  )
);
