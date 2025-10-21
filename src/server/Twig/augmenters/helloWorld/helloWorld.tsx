import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createUIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the bundled charts library once at startup
const jsBundle = readFileSync(
  join(__dirname, "bundles/helloWorld-bundle.js"),
  "utf-8"
);
const cssBundle = readFileSync(
  join(__dirname, "bundles/helloWorld-bundle.css"),
  "utf-8"
);

export const helloWorld = (toolResult: CallToolResult): CallToolResult => {
  // Create self-contained HTML with inline bundle and initialization
  const htmlString = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssBundle}</style>
      </head>
      <body>
        <div id="ui-container"></div>
        <script>${jsBundle}</script>
        <script>
          window.renderHelloWorld('ui-container');
        </script>
      </body>
    </html>
  `;

  const uiResource = createUIResource({
    uri: "ui://hello-world",
    content: {
      type: "rawHtml",
      htmlString,
    },
    encoding: "text",
  });

  return {
    ...toolResult,
    content: [uiResource],
  };
};
