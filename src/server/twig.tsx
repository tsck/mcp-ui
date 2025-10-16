import React from "react";
import { renderToString } from "react-dom/server";
import { createUIResource, UIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Chart, Line } from "@lg-charts/core";


export const augmentWithUi = (toolResult: CallToolResult): CallToolResult => {
  if (toolResult.uri === 'data://cluster-metrics') {
    const { content } = toolResult;
    interface ClusterMetrics {
      name: string;
      data: Array<[string, number]>;
    }
    const data = JSON.parse(content[0].text as string) as Array<ClusterMetrics>;

    const lines = data.map((item) => (<Line name={item.name} data={item.data} />));
    const chart = (
      <Chart>
        {lines}
      </Chart>
    );

    const htmlString = renderToString(chart);

    console.log(htmlString);

    const uiResource = createUIResource({
      uri: 'ui://cluster-metrics',
      content: { type: 'rawHtml', htmlString },
      encoding: 'blob',
    });

    console.log(uiResource);

    return {
      ...toolResult,
      content: [uiResource]
    };
  }

  return toolResult;
};