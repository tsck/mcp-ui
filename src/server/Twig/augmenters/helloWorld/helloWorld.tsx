import { createUIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const helloWorld = (toolResult: CallToolResult): CallToolResult => {
  const uiResource = createUIResource({
    uri: "ui://hello-world",
    content: {
      type: "rawHtml",
      htmlString: '<h1 style="color: white;">Hello World</h1>',
    },
    encoding: "blob",
  });

  return {
    ...toolResult,
    content: [uiResource],
  };
};
