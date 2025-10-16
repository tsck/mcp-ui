# MCP UI Project

A full-stack MCP (Model Context Protocol) implementation with a React client and Express server, demonstrating interactive UI resources.

## Project Structure

```
mcp-ui/
├── src/
│   ├── server/           # MCP Server (Express + TypeScript)
│   │   ├── index.ts      # Server entry point
│   │   ├── twig.tsx      # UI augmentation logic
│   │   └── mockData.ts   # Sample data
│   └── client/           # MCP Client (React + Vite)
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── services/      # MCP client service
│       │   └── App.tsx        # Main app
│       └── vite.config.ts
├── package.json
└── README.md
```

## Features

### Server
- **MCP Protocol**: HTTP-based MCP server using streaming transport
- **Tool Registration**: Registers `cluster_metrics` tool
- **UI Resources**: Returns interactive UI components using `@mcp-ui/server`
- **Charts**: Generates charts using `@lg-charts/core`
- **Session Management**: Manages multiple client sessions

### Client
- **Tool Discovery**: Lists all available tools from the server
- **Tool Execution**: Execute tools with a simple interface
- **Response Display**: View raw JSON responses
- **UI Rendering**: Renders MCP-UI resources using `@mcp-ui/client`
- **Modern Interface**: Clean, responsive UI with dark theme

## Quick Start

### Prerequisites

- Node.js (v18+)
- pnpm (v10+)

### Installation

```bash
# Install dependencies
pnpm install

# Install client dependencies
cd src/client && pnpm install && cd ../..
```

### Development

#### Run Both Server and Client

```bash
pnpm dev
```

This will start:
- MCP Server on `http://localhost:3000`
- React Client on `http://localhost:3001`

#### Run Individually

```bash
# Server only
pnpm server:dev

# Client only
pnpm client:dev
```

## Usage

1. Start both server and client using `pnpm dev`
2. Open `http://localhost:3001` in your browser
3. The client will automatically connect to the MCP server
4. Available tools will be listed in the left sidebar
5. Click on a tool to select it
6. Click "Execute" to run the tool
7. View the raw response in the upper right panel
8. View the rendered UI in the lower right panel

## API Endpoints

### MCP Server

- **POST /mcp**: Initialize session and handle tool calls
- **GET /mcp**: Stream server-to-client messages
- **DELETE /mcp**: Terminate session

## Technologies

### Server
- Express.js
- TypeScript
- @modelcontextprotocol/sdk
- @mcp-ui/server
- @lg-charts/core
- tsx (TypeScript executor)

### Client
- React 19
- TypeScript
- Vite
- @mcp-ui/client
- @modelcontextprotocol/sdk

## Development

### Server Development

The server watches for changes and auto-reloads:

```bash
pnpm server:dev
```

### Client Development

The client uses Vite's HMR for fast refresh:

```bash
pnpm client:dev
```

## Project Details

### MCP Protocol

This project implements the Model Context Protocol (MCP), which enables standardized communication between AI models and tools. The protocol supports:

- Tool discovery and execution
- Interactive UI resources
- Session management
- Streaming responses

### UI Resources

The server can return UI resources that the client renders. These resources can be:

- **Raw HTML**: Direct HTML content
- **External URLs**: iframe-embedded content
- **Remote DOM**: Component-based UI using `@mcp-ui/client`

### Example Tool

The `cluster_metrics` tool demonstrates:

1. Returning structured data (mock cluster metrics)
2. Augmenting the response with a UI resource
3. Rendering a chart using `@lg-charts/core`
4. Displaying the chart in the client using `@mcp-ui/client`

## License

ISC

## Authors

Built with MCP-UI by Ido Salomon and Liad Yosef

