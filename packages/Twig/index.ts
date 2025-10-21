import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { createAugmenterRegistry } from "./src/utils/add-utils";
import { transformData as clusterTransform } from "./src/augmenters/clusterMetrics/clusterMetrics.transform.js";

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

export const addUI = (toolResult: CallToolResult): CallToolResult => {
  return registry.augment(toolResult);
};
