import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { clusterMetrics } from "./augmenters/clusterMetrics";
import { helloWorld } from "./augmenters/helloWorld";

export const augmentWithUi = (toolResult: CallToolResult): CallToolResult => {
  if (toolResult.uri === 'data://cluster-metrics') {
    return clusterMetrics(toolResult);
  }

  if (toolResult.uri === 'data://hello-world') {
    return helloWorld(toolResult);
  }

  return toolResult;
};
