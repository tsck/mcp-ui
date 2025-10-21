import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

interface ClusterMetrics {
  name: string;
  data: Array<[string, number]>;
}

export const transformData = (toolResult: CallToolResult) => {
  const data = JSON.parse(
    toolResult.content[0].text as string
  ) as Array<ClusterMetrics>;
  return { data };
};
