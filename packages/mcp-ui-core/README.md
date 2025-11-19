# MCP UI Core (`@mcp-poc/core`)

**⚠️ This is a proof-of-concept package.** This repository demonstrates how `augmentWithUI()` works. The production package will be `@lg-mcp-ui/core` and will integrate with the MongoDB MCP Server.

## Overview

The MCP UI Core package provides the `augmentWithUI()` function that augments MCP Server tool responses with UI resources according to the [mcp-ui specification](https://mcpui.dev/guide/introduction). Instead of returning plain text, your tools can return embedded UI components that render in MCP clients.

## How It Works

The SDK uses the MCP-UI specification's `uiMetadata['initial-render-data']` field to embed structured data directly in UI resources. This ensures that:

1. **Server-side**: Tools define and embed the exact data structure needed by the UI
2. **Client-side**: The MCP client automatically extracts and passes the data to the iframe
3. **UI Component**: The iframe receives the data via the standard MCP-UI lifecycle

This decouples data extraction logic from the client and keeps it close to the tool implementation where it belongs.

## Installation

**Note**: This is a POC package.

```bash
npm install @mcp-poc/core
```

## Usage

The `augmentWithUI()` function takes a tool result and adds a UI resource:

```typescript
import { augmentWithUI } from "@mcp-poc/core";

  const result: CallToolResult = {
  content: [{ type: "text", text: "Found 3 databases" }],
};

return augmentWithUI(result, {
  toolName: "list-databases",
  renderData: {
    databases: [...],
    totalCount: 3,
  },
});
```

The function:

1. Validates render data against the tool's Zod schema
2. Creates a `UIResource` with an external URL pointing to the embeddable UI route
3. Embeds render data in `uiMetadata['initial-render-data']`
4. Appends the UI resource to the tool result

If validation fails or no route mapping exists, the original tool result is returned unchanged.

**See the [root README](../../README.md) for how to run the complete POC.**

## License

MIT
