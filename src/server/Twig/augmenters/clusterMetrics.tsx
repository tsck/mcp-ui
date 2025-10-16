import { createUIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const clusterMetrics = (toolResult: CallToolResult): CallToolResult => {
  const { content } = toolResult;
  interface ClusterMetrics {
    name: string;
    data: Array<[string, number]>;
  }
  const data = JSON.parse(content[0].text as string) as Array<ClusterMetrics>;

  const uiResource = createUIResource({
    uri: 'ui://cluster-metrics',
    content: { 
      type: 'rawHtml', 
      htmlString: '<h1>Cluster Metrics</h1>' 
    },
    encoding: 'text',
  });

  return {
    ...toolResult,
    content: [uiResource]
  };
};
