import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { createUIResource } from "@mcp-ui/server";
import type {
  HelloWorldRenderData,
  ClusterMetricsRenderData,
  RenderData,
} from "../types";

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
 * Extract structured data from tool result content for a specific tool
 * This maps the raw tool result content to the data structure expected by the UI
 */
function extractToolData(
  toolName: string,
  toolResult: CallToolResult
): RenderData | null {
  // Find the first text content item
  const textContent = toolResult.content?.find(
    (item: any) => item.type === "text"
  ) as any;

  if (!textContent || typeof textContent.text !== "string") {
    return null;
  }

  const text: string = textContent.text;

  // Tool-specific data extraction logic
  switch (toolName) {
    case "cluster-metrics": {
      // For cluster-metrics, the data is already in the correct format (JSON string)
      try {
        const parsed = JSON.parse(text) as ClusterMetricsRenderData;
        return parsed;
      } catch (e) {
        console.error(`Failed to parse cluster-metrics data:`, e);
        return null;
      }
    }

    case "hello-world": {
      // For hello-world, we can pass a simple object
      const data: HelloWorldRenderData = {
        message: text || "Hello World",
        timestamp: new Date().toISOString(),
      };
      return data;
    }

    default:
      // For unknown tools, try to parse as JSON or return text
      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        return { text };
      }
  }
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
  const { toolName } = options;

  // Check if we have a mapping for this tool
  const route = TOOL_TO_ROUTE_MAPPINGS[toolName];

  if (!route) {
    // No mapping registered for this tool name
    return toolResult;
  }

  // Extract structured data for this tool
  const renderData = extractToolData(toolName, toolResult);

  if (!renderData) {
    console.warn(
      `No render data extracted for tool '${toolName}'. Skipping UI augmentation.`
    );
    // Return original result without UI augmentation
    return toolResult;
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
      "initial-render-data": renderData as Record<string, unknown>,
    },
  });

  // Append the UI resource to the tool result content (keep existing content like text data)
  return {
    ...toolResult,
    content: [...(toolResult.content || []), uiResource],
  };
}
