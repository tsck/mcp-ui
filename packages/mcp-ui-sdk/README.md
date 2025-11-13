# MCP UI SDK

UI augmentation library for Model Context Protocol (MCP) servers.

## Overview

The MCP UI SDK provides a simple way to add rich, interactive UI components to your MCP tool responses. Instead of returning plain text, your tools can return embedded UI components that render in the client.

## How It Works

The SDK uses the MCP-UI specification's `uiMetadata['initial-render-data']` field to embed structured data directly in UI resources. This ensures that:

1. **Server-side**: Tools define and embed the exact data structure needed by the UI
2. **Client-side**: The MCP client automatically extracts and passes the data to the iframe
3. **UI Component**: The iframe receives the data via the standard MCP-UI lifecycle

This decouples data extraction logic from the client and keeps it close to the tool implementation where it belongs.

## Installation

```bash
npm install @mcp-poc/mcp-ui-sdk
```

## Usage

### Basic Example

```typescript
import { augmentWithUI } from "@mcp-poc/mcp-ui-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types";

// In your MCP tool handler
async function handleClusterMetrics() {
  // Your tool logic that generates data
  const metricsData = getClusterMetrics();

  // Create a tool result with the data as text content
  const result: CallToolResult = {
    content: [
      {
        type: "text",
        text: JSON.stringify(metricsData),
      },
    ],
  };

  // Augment with UI - this will:
  // 1. Extract and parse the data from the text content
  // 2. Embed it in uiMetadata['initial-render-data']
  // 3. Add a UI resource pointing to the visualization
  return augmentWithUI(result, { toolName: "cluster-metrics" });
}
```

### How Data Flows

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. MCP Server (Your Tool)                                      │
│    - Generates data                                             │
│    - Calls augmentWithUI()                                      │
│      └─> Extracts data from content                            │
│      └─> Embeds in uiMetadata['initial-render-data']           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. MCP Client                                                   │
│    - Receives CallToolResult with UI resource                   │
│    - Extracts uiMetadata['initial-render-data']                 │
│    - Passes to UIResourceRenderer as iframeRenderData           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. UI Component (Iframe)                                        │
│    - Uses useRenderData() hook                                  │
│    - Receives data via postMessage                              │
│    - Renders the visualization                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Reference

### `augmentWithUI(toolResult, options)`

Augments a tool result with a UI resource containing embedded render data.

**Parameters:**

- `toolResult: CallToolResult` - The tool result to augment
- `options.toolName: string` - The name of the tool (must be registered in `TOOL_TO_ROUTE_MAPPINGS`)

**Returns:** `CallToolResult` - The augmented tool result with UI resource

**Example:**

```typescript
const result = {
  content: [{ type: "text", text: JSON.stringify(data) }],
};

return augmentWithUI(result, { toolName: "cluster-metrics" });
```

## TypeScript Types

The SDK exports TypeScript interfaces for all supported tool data structures:

```typescript
import type {
  HelloWorldRenderData,
  ClusterMetricsRenderData,
  ClusterMetricsSeries,
  ClusterMetricsDataPoint,
  RenderData,
} from "@mcp-poc/mcp-ui-sdk";
```

### Example Type Definitions

```typescript
// Hello World tool data
interface HelloWorldRenderData {
  message: string;
  timestamp: string;
}

// Cluster Metrics tool data
interface ClusterMetricsSeries {
  name: string;
  data: [string, number][]; // [timestamp, value]
}

type ClusterMetricsRenderData = ClusterMetricsSeries[];
```

## Adding New Tools

To add support for a new tool:

### 1. Register the Route Mapping

Edit `src/utils/index.ts`:

```typescript
const TOOL_TO_ROUTE_MAPPINGS: Record<string, string> = {
  "hello-world": "/HelloWorld",
  "cluster-metrics": "/ClusterMetrics",
  "your-new-tool": "/YourNewTool", // Add your tool here
};
```

### 2. Define the Data Type

Edit `src/types.ts`:

```typescript
export interface YourNewToolRenderData {
  // Define the data structure your UI component expects
  items: string[];
  count: number;
}

// Update the union type
export type RenderData =
  | HelloWorldRenderData
  | ClusterMetricsRenderData
  | YourNewToolRenderData // Add your type here
  | Record<string, unknown>;
```

### 3. Add Data Extraction Logic

Edit `src/utils/index.ts` in the `extractToolData()` function:

```typescript
function extractToolData(
  toolName: string,
  toolResult: CallToolResult
): RenderData | null {
  // ... existing code ...

  switch (toolName) {
    // ... existing cases ...

    case "your-new-tool": {
      try {
        const parsed = JSON.parse(text) as YourNewToolRenderData;
        return parsed;
      } catch (e) {
        console.error(`Failed to parse your-new-tool data:`, e);
        return null;
      }
    }

    // ... rest of cases ...
  }
}
```

### 4. Create the UI Component

Create your UI component in the `mcp-ui-app` package:

```typescript
// packages/mcp-ui-app/src/app/YourNewTool/page.tsx
"use client";

import { useRenderData } from "@/hooks/useRenderData";
import type { YourNewToolRenderData } from "@mcp-poc/mcp-ui-sdk";

export default function YourNewToolPage() {
  const { data, isLoading, error } = useRenderData<YourNewToolRenderData>();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Your New Tool</h1>
      <p>Count: {data.count}</p>
      <ul>
        {data.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

### 1. Define Clear Data Contracts

Always define TypeScript interfaces for your tool's render data. This ensures type safety and makes it clear what data the UI component expects.

### 2. Handle Errors Gracefully

The `extractToolData()` function should handle parsing errors and return `null` if data extraction fails. This prevents the entire tool response from breaking.

### 3. Keep Data Transformation on the Server

The server-side `extractToolData()` function is the right place to transform raw tool output into the structure expected by the UI. Don't make the client or UI component do this work.

### 4. Use Semantic Tool Names

Tool names should be descriptive and use kebab-case (e.g., `cluster-metrics`, `user-analytics`).

### 5. Validate Data in the UI

Always use the `useRenderData()` hook with proper error handling in your UI components. Consider adding Zod schemas for runtime validation:

```typescript
import { z } from "zod";

const YourToolSchema = z.object({
  items: z.array(z.string()),
  count: z.number(),
});

const { data, error } = useRenderData({
  schema: YourToolSchema,
});
```

## Why `uiMetadata['initial-render-data']`?

The MCP-UI specification defines `uiMetadata['initial-render-data']` as the standard way to pass data to UI resources. This approach has several advantages:

1. **Decoupled**: The client doesn't need tool-specific logic to extract data
2. **Type-safe**: Data structures are defined once on the server
3. **Standard**: Follows the MCP-UI specification
4. **Efficient**: Data is passed directly without client-side parsing
5. **Maintainable**: Adding new tools doesn't require client changes

## Architecture

```
mcp-ui (monorepo)
├── packages/
│   ├── mcp-ui-sdk/          # This package
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   │   └── index.ts      # augmentWithUI implementation
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   └── index.ts          # Public exports
│   │   └── package.json
│   │
│   ├── mcp-server/          # Example MCP server
│   │   └── src/
│   │       └── index.ts          # Tool implementations
│   │
│   ├── mcp-client/          # MCP client (extracts data from uiMetadata)
│   │   └── src/
│   │       └── components/
│   │           └── UIRenderer/
│   │               └── UIRenderer.tsx
│   │
│   └── mcp-ui-app/          # UI components (iframes)
│       └── src/
│           ├── hooks/
│           │   └── useRenderData.ts  # Receives data via postMessage
│           └── app/
│               ├── HelloWorld/
│               └── ClusterMetrics/
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. TypeScript types are defined for all data structures
2. Error handling is comprehensive
3. Documentation is updated
4. Code follows the existing patterns
