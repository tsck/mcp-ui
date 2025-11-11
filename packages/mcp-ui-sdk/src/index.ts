import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { createAugmenterRegistry, augmentWithUI } from "./utils/add-utils";
import { transformData as clusterTransform } from "./microUIs/clusterMetrics/clusterMetrics.transform.js";

const registry = createAugmenterRegistry()
  .register({
    uri: "data://cluster-metrics",
    bundleName: "clusterMetrics",
    transformData: clusterTransform,
  })
  .register({
    uri: "data://hello-world",
    bundleName: "helloWorld",
  });

// Keep old API for backward compatibility (for clusterMetrics)
export const addUI = (toolResult: CallToolResult): CallToolResult => {
  return registry.augment(toolResult);
};

// Export new API for tool name-based UI augmentation
export { augmentWithUI };
