import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createUIResource } from "@mcp-ui/server";
import { z } from "zod";
import { TOOL_SCHEMAS } from "./schemas";

// Base URL for external micro UI app
const MCP_UI_APP_BASE_URL = "https://mcp-ui-mcp-ui-app.vercel.app";
// const MCP_UI_APP_BASE_URL = "http://localhost:3003";

// Tool name to route mappings for external URLs
const TOOL_TO_ROUTE_MAPPINGS: Record<string, string> = {
  "hello-world": "/HelloWorld",
  "cluster-metrics": "/ClusterMetrics",
  "list-databases": "/ListDatabases",
};

/**
 * Options for augmenting a tool result with UI
 */
export interface AugmentOptions {
  toolName: string;
  renderData: Record<string, unknown>;
}

/**
 * Augment a tool result with UI using external URL
 * This is the new API for adding UI resources to tool results
 *
 * The render data is embedded in the UI resource using uiMetadata['initial-render-data'].
 * The MCP client will automatically extract this data and pass it to the iframe via postMessage.
 */
export function augmentWithUI(
  toolResult: CallToolResult,
  options: AugmentOptions
): CallToolResult {
  const { toolName, renderData } = options;

  console.log(
    `[augmentWithUI] Tool: ${toolName}, Result:`,
    JSON.stringify(toolResult, null, 2)
  );

  // Check if we have a mapping for this tool
  const route = TOOL_TO_ROUTE_MAPPINGS[toolName];

  if (!route) {
    // No mapping registered for this tool name
    return toolResult;
  }

  // Validate renderData against the schema for this tool (if schema exists)
  const schema = TOOL_SCHEMAS[toolName];
  if (schema) {
    try {
      schema.parse(renderData);
      console.log(`[augmentWithUI] Validation passed for tool: ${toolName}`);
    } catch (error) {
      const errorMessage =
        error instanceof z.ZodError
          ? `Schema validation failed for tool "${toolName}": ${error.issues
              .map((e) => e.message)
              .join(", ")}`
          : `Schema validation failed for tool "${toolName}"`;
      console.warn(`[augmentWithUI] ${errorMessage}`, error);
      // Return the tool result unmodified - validation failure prevents UI augmentation
      return toolResult;
    }
  }

  // Generate the full external URL with waitForRenderData flag
  const externalUrl = `${MCP_UI_APP_BASE_URL}${route}?waitForRenderData=true`;

  // Create UI resource using @mcp-ui/server with embedded render data
  const uiResource = createUIResource({
    uri: `ui://${toolName}/${Date.now()}`,
    content: {
      type: "externalUrl",
      iframeUrl: externalUrl,
    },
    encoding: "text",
    // ✅ Embed the render data in uiMetadata
    // The MCP client will automatically extract this and pass it to the iframe
    uiMetadata: {
      "initial-render-data": renderData,
    },
  });

  // Append the UI resource to the tool result content (keep existing content like text data)
  return {
    ...toolResult,
    content: [...(toolResult.content || []), uiResource],
  };
}
