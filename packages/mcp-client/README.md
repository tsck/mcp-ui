# MCP Client (`@mcp-poc/mcp-client`)

**⚠️ This is a proof-of-concept demo client.** This React application demonstrates how MCP clients can render MCP-UI resources. It is **not production code** and exists only for POC demonstration purposes.

## Overview

This React-based client demonstrates:
- How to connect to an MCP server
- How to discover and execute tools
- How to render MCP-UI resources using `@mcp-ui/client`
- How to extract and forward render data to embeddable UIs

## Purpose

This POC client shows the complete end-to-end flow:
1. Tool execution on the MCP server
2. UI resource augmentation via `augmentWithUI()`
3. Client extraction of render data from `uiMetadata`
4. Rendering of embeddable UIs in iframes

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- Running MCP server (see [`mcp-server`](../mcp-server/README.md))

### Running Locally

From the root of the monorepo:

```bash
# Run all services (recommended)
pnpm dev

# Or run this package only
pnpm mcp-client:dev
```

The client will be available at `http://localhost:3001` (or next available port).

### Configuration

The client connects to the MCP server at `http://localhost:3000/mcp` by default. This is configured in `src/services/mcpClient.ts`.

## How It Works

The client connects to the MCP server, discovers available tools, and executes them. When a tool response includes a UI resource:

1. Extracts render data from `uiMetadata['initial-render-data']` in the UI resource
2. Renders an iframe using `UIResourceRenderer` from `@mcp-ui/client`
3. Passes render data to the iframe via the `iframeRenderData` prop
4. The iframe receives data via `postMessage` and renders the embeddable UI

**See the [root README](../../README.md) for setup and development details.**
