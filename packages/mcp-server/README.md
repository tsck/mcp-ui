# MCP Server (`@mcp-poc/mcp-server`)

**⚠️ This is a proof-of-concept mock server.** This Express-based MCP server demonstrates how tools integrate with `augmentWithUI()`. It is **not production code** and exists only for POC demonstration purposes.

## Overview

This mock MCP server demonstrates:
- How to register MCP tools
- How to execute tool operations
- How to integrate `augmentWithUI()` to add UI resources to tool responses
- How to structure render data for embeddable UIs

## Purpose

This POC server shows the integration pattern that will be used in the production MongoDB MCP Server:

1. Execute the tool operation and obtain raw data
2. Transform raw data into structured render data matching the tool's schema
3. Augment the tool result with UI using `augmentWithUI()`
4. Return the augmented result (or original result if augmentation fails)

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v8+)

### Running Locally

From the root of the monorepo:

```bash
# Run all services (recommended)
pnpm dev

# Or run this package only
pnpm mcp-server:dev
```

The server will be available at `http://localhost:3000` with the MCP endpoint at `http://localhost:3000/mcp`.

## How It Works

Tools follow this pattern:

1. Execute the tool operation and obtain raw data
2. Transform raw data into structured render data matching the tool's Zod schema
3. Create a base `CallToolResult` with text content
4. Call `augmentWithUI()` to add a UI resource (non-blocking - failures return original result)

The server includes three demo tools:
- `hello_world` - Simple greeting message
- `cluster_metrics` - Mock cluster metrics with time-series chart
- `list_databases` - Database list displayed in a Card component

**See the [root README](../../README.md) for setup and development details.**

