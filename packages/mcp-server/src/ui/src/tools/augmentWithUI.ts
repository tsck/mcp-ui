import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createUIResource } from "@mcp-ui/server";
import { z } from "zod";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { TOOL_SCHEMAS } from "./schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tool name to HTML file mappings
const TOOL_TO_HTML_MAPPINGS: Record<string, string> = {
  "hello-world": "HelloWorld.html",
  "cluster-metrics": "ClusterMetrics.html",
  "list-databases": "ListDatabases.html",
};

/**
 * Options for augmenting a tool result with UI
 */
export interface AugmentOptions {
  toolName: string;
  renderData: Record<string, unknown>;
}

/**
 * Augment a tool result with UI using rawHtml content type
 * This reads built HTML files from the UI build output and embeds them as rawHtml
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
  const htmlFileName = TOOL_TO_HTML_MAPPINGS[toolName];

  if (!htmlFileName) {
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

  // Read the built HTML file from the UI dist directory
  // Path: from src/tools/ go up to ui/, then to dist/embeddable-uis/
  const uiDistPath = join(
    __dirname,
    "..",
    "..",
    "dist",
    "embeddable-uis",
    htmlFileName
  );
  console.log(`[augmentWithUI] Looking for HTML file at: ${uiDistPath}`);

  let htmlContent: string;

  try {
    htmlContent = readFileSync(uiDistPath, "utf-8");
    console.log(
      `[augmentWithUI] Successfully read HTML file: ${htmlFileName} (${htmlContent.length} bytes)`
    );
  } catch (error) {
    console.error(
      `[augmentWithUI] Failed to read HTML file ${htmlFileName} from ${uiDistPath}:`,
      error
    );
    // Return the tool result unmodified if HTML file cannot be read
    return toolResult;
  }

  // Create UI resource using @mcp-ui/server with rawHtml content
  const uiResource = createUIResource({
    uri: `ui://${toolName}/${Date.now()}`,
    content: {
      type: "rawHtml",
      htmlString: htmlContent,
    },
    encoding: "text",
    // ✅ Embed the render data in uiMetadata
    // The MCP client will automatically extract this and pass it to the iframe via postMessage
    uiMetadata: {
      "initial-render-data": renderData,
    },
  });

  console.log(
    `[augmentWithUI] Created UI resource:`,
    JSON.stringify(uiResource, null, 2)
  );

  // Append the UI resource to the tool result content (keep existing content like text data)
  const augmentedResult = {
    ...toolResult,
    content: [...(toolResult.content || []), uiResource],
  };

  console.log(
    `[augmentWithUI] Returning augmented result with ${augmentedResult.content.length} content items`
  );
  return augmentedResult;
}
