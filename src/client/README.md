# MCP React Client

A React-based client for interacting with MCP (Model Context Protocol) servers, built with Vite and TypeScript.

## Features

- **Tool Discovery**: Automatically fetches and displays available tools from the MCP server
- **Tool Execution**: Execute tools with a simple click
- **Response Display**: View raw JSON responses from tool calls
- **UI Rendering**: Renders MCP-UI resources using the `@mcp-ui/client` package
- **Modern UI**: Clean, dark-themed interface with responsive layout

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- Running MCP server on `http://localhost:3000/mcp`

### Installation

Dependencies are already installed if you've run the setup from the root project.

### Development

From the client directory:

```bash
cd src/client
pnpm dev
```

Or from the root directory:

```bash
# Run only the client
pnpm client:dev

# Run both server and client
pnpm dev
```

The client will be available at `http://localhost:3001`.

## Architecture

### Components

- **ToolSelector**: Displays available tools and handles tool selection/execution
- **ResponseDisplay**: Shows the raw JSON response from tool calls
- **UIRenderer**: Renders MCP-UI resources using `UIResourceRenderer`

### Services

- **mcpClient**: Handles communication with the MCP server
  - Manages session initialization
  - Lists available tools
  - Executes tool calls
  - Handles cleanup

## Configuration

The client connects to the MCP server at `http://localhost:3000/mcp` by default. To change this, modify the `MCPClient` constructor in `src/services/mcpClient.ts`:

```typescript
export const mcpClient = new MCPClient('http://your-server:port/mcp');
```

## Project Structure

```
src/client/
├── src/
│   ├── components/
│   │   ├── ToolSelector.tsx    # Tool selection UI
│   │   ├── ResponseDisplay.tsx # Response display
│   │   └── UIRenderer.tsx      # MCP-UI renderer
│   ├── services/
│   │   └── mcpClient.ts        # MCP client service
│   ├── App.tsx                 # Main application
│   ├── App.css                 # Styles
│   └── main.tsx                # Entry point
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies
```

## Technologies

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **@mcp-ui/client**: MCP-UI rendering
- **@modelcontextprotocol/sdk**: MCP protocol implementation
