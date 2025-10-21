import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { clusterMetrics } from "./src/augmenters/clusterMetrics/clusterMetrics";
import { helloWorld } from "./src/augmenters/helloWorld/helloWorld";

export const augmentWithUi = (toolResult: CallToolResult): CallToolResult => {
  if (toolResult.uri === "data://cluster-metrics") {
    return clusterMetrics(toolResult);
  }

  if (toolResult.uri === "data://hello-world") {
    return helloWorld(toolResult);
  }

  return toolResult;
};
