import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { createUIResource } from "@mcp-ui/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL for external micro UI app
const MCP_UI_APP_BASE_URL = "http://localhost:3003";

// Tool name to route mappings for external URLs
const TOOL_TO_ROUTE_MAPPINGS: Record<string, string> = {
  "hello-world": "/HelloWorld",
};

interface AugmenterConfig {
  uri: string;
  bundleName: string;
  transformData?: (toolResult: CallToolResult) => any;
}

interface BundleCache {
  js: string;
}

/**
 * Registry for managing UI augmenters
 */
class AugmenterRegistry {
  private augmenters = new Map<string, AugmenterConfig>();
  private bundleCache = new Map<string, BundleCache>();

  /**
   * Register a new augmenter
   */
  register(config: AugmenterConfig): this {
    this.augmenters.set(config.uri, config);
    return this;
  }

  /**
   * Load bundle files for a given bundle name
   */
  private loadBundle(bundleName: string): BundleCache {
    // Check cache first
    if (this.bundleCache.has(bundleName)) {
      return this.bundleCache.get(bundleName)!;
    }

    // Load from disk
    const bundlesDir = join(__dirname, "../bundles");

    try {
      const jsBundle = readFileSync(
        join(bundlesDir, `${bundleName}-bundle.js`),
        "utf-8"
      );

      const cache = { js: jsBundle };
      this.bundleCache.set(bundleName, cache);

      return cache;
    } catch (error) {
      throw new Error(`Failed to load bundle for ${bundleName}: ${error}`);
    }
  }

  /**
   * Generate HTML string with embedded bundle
   * Note: Emotion styles are included in the JS bundle, no separate CSS needed
   */
  private generateHtml(
    bundleName: string,
    bundle: BundleCache,
    props?: any
  ): string {
    const propsJson = props ? JSON.stringify(props) : "undefined";
    const renderFunctionName = `render${
      bundleName.charAt(0).toUpperCase() + bundleName.slice(1)
    }`;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="ui-container"></div>
        <script>${bundle.js}</script>
        <script>
          window.${renderFunctionName}('ui-container', ${propsJson});
        </script>
      </body>
    </html>
  `;
  }

  /**
   * Augment a tool result with UI if a matching augmenter is registered
   */
  augment(toolResult: CallToolResult): CallToolResult {
    const config = this.augmenters.get((toolResult as any).uri || "");

    if (!config) {
      // No augmenter registered for this URI
      return toolResult;
    }

    const bundleName = config.bundleName;

    // Load bundles
    const bundle = this.loadBundle(bundleName);

    // Transform data if transformer provided
    const props = config.transformData
      ? config.transformData(toolResult)
      : undefined;

    // Generate HTML
    const htmlString = this.generateHtml(bundleName, bundle, props);

    // Create UI resource following MCP UIResource format
    const uiResource = {
      type: "resource" as const,
      resource: {
        uri: `ui://${bundleName}`,
        mimeType: "text/html" as const,
        text: htmlString,
      },
    };

    return {
      ...toolResult,
      content: [uiResource],
    };
  }
}

/**
 * Create a new augmenter registry
 */
export function createAugmenterRegistry(): AugmenterRegistry {
  return new AugmenterRegistry();
}

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

  // Generate the full external URL
  const externalUrl = `${MCP_UI_APP_BASE_URL}${route}`;

  // Create UI resource using @mcp-ui/server
  const uiResource = createUIResource({
    uri: `ui://${toolName}/${Date.now()}`,
    content: {
      type: "externalUrl",
      iframeUrl: externalUrl,
    },
    encoding: "text",
  });

  // Append the UI resource to the tool result content
  return {
    ...toolResult,
    content: [uiResource],
  };
}
