import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
