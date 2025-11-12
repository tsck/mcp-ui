import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { createUIResource } from "@mcp-ui/server";

// Base URL for external micro UI app
// const MCP_UI_APP_BASE_URL = "https://mcp-ui-mcp-ui-app.vercel.app";
const MCP_UI_APP_BASE_URL = "http://localhost:3003";

// Tool name to route mappings for external URLs
const TOOL_TO_ROUTE_MAPPINGS: Record<string, string> = {
  "hello-world": "/HelloWorld",
  "cluster-metrics": "/ClusterMetrics",
};

/**
 * Options for augmenting a tool result with UI
 */
interface AugmentOptions {
  toolName: string;
}

/**
 * Augment a tool result with UI using external URL
 * This is the new API for adding UI resources to tool results
 */
export function augmentWithUI(
  toolResult: CallToolResult,
  options: AugmentOptions
): CallToolResult {
  const { toolName } = options;

  // Check if we have a mapping for this tool
  const route = TOOL_TO_ROUTE_MAPPINGS[toolName];

  if (!route) {
    // No mapping registered for this tool name
    return toolResult;
  }

  // Generate the full external URL with waitForRenderData flag
  const externalUrl = `${MCP_UI_APP_BASE_URL}${route}?waitForRenderData=true`;

  // Create UI resource using @mcp-ui/server
  const uiResource = createUIResource({
    uri: `ui://${toolName}/${Date.now()}`,
    content: {
      type: "externalUrl",
      iframeUrl: externalUrl,
    },
    encoding: "text",
  });

  // Append the UI resource to the tool result content (keep existing content like text data)
  return {
    ...toolResult,
    content: [...(toolResult.content || []), uiResource],
  };
}
