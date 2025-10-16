import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { clusterMetrics } from "./augmenters/clusterMetrics";
import { helloWorld } from "./augmenters/helloWorld";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Load the bundled charts library once at startup
// const chartsBundle = readFileSync(join(__dirname, 'charts-bundle.js'), 'utf-8');

export const augmentWithUi = (toolResult: CallToolResult): CallToolResult => {
  if (toolResult.uri === 'data://cluster-metrics') {
    return clusterMetrics(toolResult);
  }

  if (toolResult.uri === 'data://hello-world') {
    return helloWorld(toolResult);
  }

  return toolResult;
};
