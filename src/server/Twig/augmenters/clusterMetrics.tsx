import React from "react";
import { renderToString } from "react-dom/server";
import { Chart, Line } from "@lg-charts/core";
import { createUIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const clusterMetrics = (toolResult: CallToolResult): CallToolResult => {
  const { content } = toolResult;
  interface ClusterMetrics {
    name: string;
    data: Array<[string, number]>;
  }
  const data = JSON.parse(content[0].text as string) as Array<ClusterMetrics>;

  const html = (
    <Chart>
      {data.map((item) => (
        <Line name={item.name} data={item.data} />
      ))}
    </Chart>
  );

  console.log(html)

  const uiResource = createUIResource({
    uri: 'ui://cluster-metrics',
    content: { 
      type: 'rawHtml', 
      htmlString: renderToString(html) 
    },
    encoding: 'text',
  });

  return {
    ...toolResult,
    content: [uiResource]
  };
};
