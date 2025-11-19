# MCP UI App (`@mcp-poc/mcp-ui-app`)

**⚠️ This is a proof-of-concept application.** This Next.js app demonstrates how embeddable UIs are hosted and rendered. The production implementation will be deployed separately.

## Overview

This Next.js application serves as the hosting infrastructure for embeddable UI components. Each route corresponds to an embeddable UI component that will be rendered within an iframe by MCP clients.

## Purpose

This POC demonstrates:
- How embeddable UIs receive render data via the `postMessage` protocol
- How UI components validate data using Zod schemas
- How LeafyGreen components are used to build consistent UIs

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
pnpm mcp-ui-app:dev
```

The app will be available at `http://localhost:3003`.

### Available Routes

- `/HelloWorld` - Simple greeting message component
- `/ClusterMetrics` - Time-series chart visualization
- `/ListDatabases` - Database list displayed in a Card component

## How It Works

Each embeddable UI has its own route (e.g., `/HelloWorld`, `/ClusterMetrics`). Components use the `useRenderData()` hook to:

1. Send `ui-lifecycle-iframe-ready` message on mount
2. Listen for `ui-lifecycle-iframe-render-data` messages from the parent client
3. Receive and validate render data using Zod schemas
4. Render using LeafyGreen components

The app uses permissive CORS headers (`Access-Control-Allow-Origin: *`, `frame-ancestors *`) to support iframe embedding from any MCP client.

**See the [root README](../../README.md) for setup and development details.**
