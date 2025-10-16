# Getting Started with MCP UI

This guide will help you get the MCP UI project up and running.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher
- **pnpm** v10 or higher

## Installation

1. **Install root dependencies** (if not already done):

```bash
pnpm install
```

2. **Install client dependencies**:

```bash
cd src/client
pnpm install
cd ../..
```

## Running the Application

### Option 1: Run Both Server and Client (Recommended)

From the root directory:

```bash
pnpm dev
```

This command will:
- Start the MCP server on `http://localhost:3000`
- Start the React client on `http://localhost:3001`
- Display logs from both with color-coded prefixes

### Option 2: Run Separately

**Terminal 1 - Start the Server:**
```bash
pnpm server:dev
```

**Terminal 2 - Start the Client:**
```bash
pnpm client:dev
```

## Using the Application

1. **Open the client** in your browser at `http://localhost:3001`

2. **View available tools** - The left sidebar shows all tools registered with the MCP server

3. **Select a tool** - Click on any tool to see its details:
   - Title and description
   - Input schema (parameters it accepts)

4. **Execute a tool** - Click the "Execute" button to run the selected tool

5. **View responses** - After execution, you'll see:
   - **Top right panel**: Raw JSON response from the server
   - **Bottom right panel**: Rendered UI component (if the tool returns a UI resource)

## Example: Cluster Metrics Tool

The server comes with a pre-registered tool called `cluster_metrics`:

1. Select "Cluster Metrics" from the tool list
2. Click "Execute"
3. View the raw response data (JSON)
4. See the rendered chart visualization in the UI panel

## Architecture Overview

### Server (`src/server/`)

- **index.ts**: Express server with MCP protocol implementation
- **twig.tsx**: UI augmentation logic that converts data to UI resources
- **mockData.ts**: Sample cluster metrics data

### Client (`src/client/`)

- **ToolSelector**: Component for browsing and selecting tools
- **ResponseDisplay**: Shows raw JSON responses
- **UIRenderer**: Renders MCP-UI resources using `@mcp-ui/client`
- **mcpClient service**: Handles MCP protocol communication

## Key Features

### Server Features

✅ HTTP-based MCP protocol with streaming support  
✅ Session management for multiple clients  
✅ Tool registration and execution  
✅ UI resource generation with `@mcp-ui/server`  
✅ Chart rendering with `@lg-charts/core`  

### Client Features

✅ Automatic tool discovery  
✅ Interactive tool execution  
✅ Raw response inspection  
✅ MCP-UI resource rendering  
✅ Modern, responsive design  

## Troubleshooting

### Port Already in Use

If you see an error about port 3000 or 3001 being in use:

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or for port 3001
lsof -ti:3001 | xargs kill -9
```

### Client Can't Connect to Server

1. Ensure the server is running on `http://localhost:3000`
2. Check browser console for CORS errors
3. Verify the server URL in `src/client/src/services/mcpClient.ts`

### Dependencies Issues

If you encounter dependency issues:

```bash
# Clean install
rm -rf node_modules src/client/node_modules
rm pnpm-lock.yaml src/client/pnpm-lock.yaml
pnpm install
cd src/client && pnpm install && cd ../..
```

## Next Steps

### Adding New Tools

1. **Register a tool** in `src/server/index.ts`:

```typescript
server.registerTool('my_tool', {
  title: 'My Tool',
  description: 'Description of what it does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define parameters
    }
  },
}, async (params) => {
  // Tool implementation
  return {
    content: [{ type: 'text', text: 'Result' }]
  };
});
```

2. **Add UI augmentation** (optional) in `src/server/twig.tsx`

3. **Restart the server** - The client will automatically discover the new tool

### Customizing the UI

Edit the following files:

- `src/client/src/App.css` - Main styles
- `src/client/src/components/*.tsx` - Component logic and layout
- `src/client/src/index.css` - Global styles

## Resources

- [MCP-UI Documentation](https://github.com/idosal/mcp-ui)
- [Model Context Protocol Spec](https://modelcontextprotocol.io)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## Support

For issues or questions:

1. Check the main README.md
2. Review the MCP-UI documentation
3. Check the browser console for errors
4. Review server logs for MCP protocol issues

