import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createUIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the bundled charts library once at startup
const chartsBundle = readFileSync(
  join(__dirname, "../bundles/chart-bundle.js"),
  "utf-8"
);
const chartsCss = readFileSync(
  join(__dirname, "../bundles/chart-bundle.css"),
  "utf-8"
);

export const clusterMetrics = (toolResult: CallToolResult): CallToolResult => {
  const { content } = toolResult;
  interface ClusterMetrics {
    name: string;
    data: Array<[string, number]>;
  }
  const data = JSON.parse(content[0].text as string) as Array<ClusterMetrics>;

  // Create self-contained HTML with inline bundle and initialization
  const htmlString = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${chartsCss}</style>
      </head>
      <body>
        <div id="chart-container"></div>
        <script>${chartsBundle}</script>
        <script>
          // Initialize the chart with data
          window.renderChart('chart-container', ${JSON.stringify(data)});
        </script>
      </body>
    </html>
  `;

  const uiResource = createUIResource({
    uri: "ui://cluster-metrics",
    content: {
      type: "rawHtml",
      htmlString,
    },
    encoding: "blob",
  });

  return {
    ...toolResult,
    content: [uiResource],
  };
};
