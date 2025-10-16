import { createUIResource } from "@mcp-ui/server";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const helloWorld = (toolResult: CallToolResult): CallToolResult => {
  const uiResource = createUIResource({
    uri: 'ui://hello-world',
    content: { 
      type: 'rawHtml', 
      htmlString: '<h1>Hello World</h1>' 
    },
    encoding: 'text',
  });

  return {
    ...toolResult,
    content: [uiResource]
  };
};
