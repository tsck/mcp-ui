# LeafyGreen MCP-UI Proof of Concept

This repository is a **proof-of-concept** demonstrating how the `@lg-mcp-ui/core` package can augment MCP Server tool responses with UI resources according to the [mcp-ui specification](https://mcpui.dev/guide/introduction).

## 🎯 Purpose

This POC serves as a working example that engineers can clone and run to understand:

1. How `augmentWithUI()` works to add UI resources to MCP tool responses
2. How embeddable UIs are hosted and rendered in iframes
3. How MCP clients extract and forward render data to embeddable UIs
4. The complete end-to-end flow from tool execution to UI rendering

**Note**: This is demonstration code. The production implementation will integrate with the [MongoDB MCP Server](https://github.com/mongodb-js/mongodb-mcp-server).

## 📦 Package Overview

This monorepo contains:

- **`mcp-ui-core`** (`@mcp-poc/core`) - The core augmentation library containing `augmentWithUI()`
- **`mcp-server`** (`@mcp-poc/mcp-server`) - Mock MCP server demonstrating tool integration
- **`mcp-ui-app`** (`@mcp-poc/mcp-ui-app`) - Next.js app hosting embeddable UI components
- **`mcp-client`** (`@mcp-poc/mcp-client`) - Demo React client that renders MCP-UI resources
- **`mongodb-mcp-server`** - Reference implementation (clone of MongoDB MCP Server)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- pnpm (v8+)

### Installation

```bash
# Install dependencies
pnpm install
```

### Running the POC

Run all services concurrently:

```bash
pnpm dev
```

This starts:

- **MCP Server** on `http://localhost:3000`
- **MCP Client** on `http://localhost:3001` (or next available port)
- **MCP UI App** on `http://localhost:3003`

### Individual Services

You can also run services individually:

```bash
# MCP Server only
pnpm mcp-server:dev

# MCP Client only
pnpm mcp-client:dev

# MCP UI App only
pnpm mcp-ui-app:dev
```

## 🧪 Testing the POC

1. **Open the MCP Client**: Navigate to `http://localhost:3001` in your browser
2. **Execute a Tool**: Click on any available tool (e.g., "Hello World", "Cluster Metrics", "List Databases")
3. **View the UI**: The tool response will include both:
   - Text content (standard MCP response)
   - Embedded UI component (rendered in an iframe)

### Available Demo Tools

- **`hello_world`** - Simple greeting message with timestamp
- **`cluster_metrics`** - Mock cluster metrics displayed as a time-series chart
- **`list_databases`** - Database list displayed in a Card component

## 📁 Project Structure

```
mcp-ui/
├── packages/
│   ├── mcp-ui-core/          # Core augmentation library
│   │   └── src/
│   │       ├── augmentWithUI.ts    # Main augmentation function
│   │       ├── schemas.ts          # Zod schemas for validation
│   │       └── index.ts            # Public exports
│   │
│   ├── mcp-server/           # Mock MCP server (demo only)
│   │   └── src/
│   │       └── index.ts            # Tool implementations
│   │
│   ├── mcp-ui-app/           # Next.js app hosting embeddable UIs
│   │   └── src/
│   │       ├── app/                # Route pages for each UI
│   │       └── hooks/
│   │           └── useRenderData.ts # Data extraction hook
│   │
│   ├── mcp-client/           # Demo React client
│   │   └── src/
│   │       └── components/
│   │           └── UIRenderer/     # MCP-UI resource renderer
│   │
│   └── mongodb-mcp-server/   # Reference implementation
│
└── README.md                 # This file
```

## 🔄 How It Works

### 1. Tool Execution

The MCP server executes a tool and creates a `CallToolResult`:

```typescript
const toolResult: CallToolResult = {
  content: [{ type: "text", text: "Found 3 databases" }],
};
```

### 2. UI Augmentation

The server calls `augmentWithUI()` to add a UI resource:

```typescript
return augmentWithUI(toolResult, {
  toolName: "list-databases",
  renderData: {
    databases: [...],
    totalCount: 3,
  },
});
```

### 3. UI Resource Creation

`augmentWithUI()` creates a `UIResource` with:

- External URL pointing to the embeddable UI route
- Render data embedded in `uiMetadata['initial-render-data']`

### 4. Client Rendering

The MCP client:

- Extracts render data from `uiMetadata`
- Renders an iframe pointing to the UI route
- Sends render data to the iframe via `postMessage`

### 5. UI Component Rendering

The embeddable UI component:

- Receives render data via `useRenderData()` hook
- Validates data against Zod schemas
- Renders using LeafyGreen components

## 📚 Documentation

- **[`packages/mcp-ui-core/README.md`](./packages/mcp-ui-core/README.md)** - Core package documentation
- **[`packages/mcp-server/README.md`](./packages/mcp-server/README.md)** - Mock server documentation
- **[`packages/mcp-ui-app/README.md`](./packages/mcp-ui-app/README.md)** - UI hosting app documentation
- **[`packages/mcp-client/README.md`](./packages/mcp-client/README.md)** - Demo client documentation

## 🎓 Key Concepts

### Validation Strategy

Two-layer validation ensures data integrity:

1. **Server-side**: `augmentWithUI()` validates render data before creating UI resources
2. **Component-level**: UI components validate props before rendering

### Error Handling

UI augmentation is **non-blocking** and **non-fatal**:

- If augmentation fails, the original `CallToolResult` is returned unchanged
- Tools continue to work even if UI augmentation is unavailable

### Communication Protocol

Embeddable UIs communicate with the parent client via `postMessage`:

- **Read flow**: Client sends render data to iframe
- **Write flow**: Iframe sends action requests to client

## 🔗 Related Resources

- [MCP-UI Specification](https://mcpui.dev/guide/introduction)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MongoDB MCP Server](https://github.com/mongodb-js/mongodb-mcp-server)
- [LeafyGreen UI](https://github.com/mongodb/leafygreen-ui)

## ⚠️ Important Notes

- This is **proof-of-concept code** for demonstration purposes
- The mock server and client are **not production code**
- Production implementation will integrate with the real MongoDB MCP Server

## 📝 License

MIT
