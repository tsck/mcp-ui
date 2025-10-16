# MCP React Client - Usage Guide

## Quick Start

```bash
# Start both server and client
pnpm dev
```

Then open http://localhost:3001 in your browser.

## User Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  MCP React Client                                               │
│  Interact with MCP Server Tools                                 │
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                               │
│  TOOL SELECTOR  │          RAW RESPONSE DISPLAY                │
│                 │                                               │
│  ┌───────────┐  │  ┌─────────────────────────────────────────┐ │
│  │ Tool 1    │  │  │ {                                       │ │
│  │ Selected  │  │  │   "content": [...],                     │ │
│  └───────────┘  │  │   "isError": false                      │ │
│                 │  │ }                                       │ │
│  ┌───────────┐  │  └─────────────────────────────────────────┘ │
│  │ Tool 2    │  │                                               │
│  └───────────┘  ├───────────────────────────────────────────────┤
│                 │                                               │
│  [Execute]      │          RENDERED UI DISPLAY                 │
│                 │                                               │
│                 │  ┌─────────────────────────────────────────┐ │
│                 │  │                                         │ │
│                 │  │   [MCP-UI Rendered Component]           │ │
│                 │  │                                         │ │
│                 │  └─────────────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────────────┘
```

## Step-by-Step Usage

### 1. View Available Tools

When you open the application, the **Tool Selector** on the left automatically:
- Connects to the MCP server
- Fetches all available tools
- Displays them as clickable cards

Each tool card shows:
- **Title**: The tool's display name
- **Description**: What the tool does
- **Input Schema**: What parameters it accepts (if any)

### 2. Select a Tool

Click on any tool card to select it:
- The card will highlight with a cyan border
- The card will have a slightly lighter background
- An "Execute" button will appear at the bottom

### 3. Execute a Tool

Click the **Execute** button:
- The button will show loading state
- A request is sent to the MCP server
- The server processes the request and returns a response

### 4. View Raw Response

The **Response Display** (top right) shows:
- Complete JSON response from the server
- Formatted with proper indentation
- Syntax highlighting for readability
- Includes all metadata and content

Example response:
```json
{
  "content": [
    {
      "type": "resource",
      "resource": {
        "uri": "ui://cluster-metrics",
        "mimeType": "text/html",
        "text": "..."
      }
    }
  ],
  "isError": false
}
```

### 5. View Rendered UI

The **UI Renderer** (bottom right) shows:
- Rendered UI component if the response includes a UI resource
- Uses the `@mcp-ui/client` renderer
- Interactive components work as designed
- Falls back to placeholder if no UI resource

## Example: Cluster Metrics Tool

### What It Does
The `cluster_metrics` tool returns mock cluster performance data and visualizes it as a chart.

### Steps to Use

1. **Select the Tool**
   - Look for "Cluster Metrics" in the tool list
   - Click on the card to select it

2. **Execute**
   - Click the "Execute cluster_metrics" button
   - Wait for the response (should be quick)

3. **View Results**
   - **Raw Response**: See the JSON data with cluster metrics
   - **Rendered UI**: See a beautiful chart visualization

### What You'll See

**Raw Response (Top Right)**:
```json
{
  "content": [
    {
      "type": "resource",
      "resource": {
        "uri": "ui://cluster-metrics",
        "mimeType": "text/html",
        "text": "{\"type\":\"resource\",..."
      }
    }
  ]
}
```

**Rendered UI (Bottom Right)**:
A chart showing cluster metrics over time with multiple lines representing different data series.

## Features Explained

### Auto-Connect
- Client automatically connects to the MCP server on startup
- No manual connection step required
- Shows error if server is not available

### Loading States
- **Initial Load**: "Loading tools..." while fetching
- **Tool Execution**: Button shows executing state
- **Response**: "Executing tool..." while waiting

### Error Handling
- **Connection Errors**: Red error message if server unreachable
- **Tool Errors**: Displays error message from server
- **Graceful Degradation**: App continues to work even if one part fails

### Real-Time Updates
- Tool list updates if server changes (refresh page)
- Responses update immediately upon completion
- UI re-renders when new response arrives

## Keyboard Shortcuts

Currently, the app is mouse-driven. Future enhancements could add:
- Arrow keys to navigate tools
- Enter to execute selected tool
- Tab to navigate between panels

## Tips & Tricks

### Debugging
1. **Check Raw Response First**: If UI doesn't render, check the raw JSON
2. **Console Logs**: Open browser DevTools to see detailed logs
3. **Network Tab**: View actual HTTP requests to the server

### Understanding Responses

**Text Content**:
```json
{
  "content": [
    { "type": "text", "text": "Some response" }
  ]
}
```
→ No UI to render, shows placeholder

**UI Resource Content**:
```json
{
  "content": [
    {
      "type": "resource",
      "resource": { "uri": "ui://...", ... }
    }
  ]
}
```
→ Renders UI component

### Common Scenarios

#### Scenario 1: No Tools Showing
- **Cause**: Server not running or not reachable
- **Solution**: Start server with `pnpm server:dev`

#### Scenario 2: Execute Button Doesn't Work
- **Cause**: Tool not properly selected
- **Solution**: Click on tool card first, then execute

#### Scenario 3: No UI Renders
- **Cause**: Tool doesn't return a UI resource
- **Solution**: This is normal for text-only tools

## Advanced Usage

### Modifying the MCP Server URL

Edit `src/client/src/services/mcpClient.ts`:

```typescript
// Change from localhost:3000 to your server
export const mcpClient = new MCPClient('http://your-server:port/mcp');
```

### Adding Custom Styling

Edit `src/client/src/App.css`:

```css
/* Change accent color */
:root {
  --accent-color: #61dafb; /* Change this */
}

/* Modify tool card appearance */
.tool-item {
  /* Your custom styles */
}
```

### Extending Functionality

**Add Tool Parameters**:
Modify `ToolSelector.tsx` to add a form for tool input parameters.

**Add History**:
Add state to track previous tool executions and display them.

**Add Export**:
Add a button to download the response as a JSON file.

## Troubleshooting

### Problem: "Loading tools..." never finishes

**Diagnosis**: Server connection issue

**Solutions**:
1. Check server is running: `curl http://localhost:3000/mcp`
2. Check browser console for CORS errors
3. Verify firewall isn't blocking port 3000

### Problem: Tool executes but shows error

**Diagnosis**: Server-side error

**Solutions**:
1. Check server logs in terminal
2. Verify tool implementation in `src/server/index.ts`
3. Check if tool throws an error

### Problem: UI doesn't render but JSON shows resource

**Diagnosis**: UI resource format issue

**Solutions**:
1. Verify resource has `uri` starting with `ui://`
2. Check `mimeType` is valid
3. Verify `@mcp-ui/client` is installed

## Development Workflow

### Making Changes

1. **Server Changes**:
   - Edit `src/server/index.ts`
   - Server auto-reloads (tsx watch mode)
   - Refresh browser to see changes

2. **Client Changes**:
   - Edit components in `src/client/src/`
   - Vite auto-reloads (HMR)
   - Changes appear immediately

### Testing a New Tool

1. Add tool in `src/server/index.ts`:
   ```typescript
   server.registerTool('my_tool', {...}, async () => {...});
   ```

2. Restart server (Ctrl+C, then `pnpm server:dev`)

3. Refresh client browser

4. New tool appears in list

## Resources

- **Project README**: `README.md`
- **Getting Started**: `GETTING_STARTED.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Checklist**: `CHECKLIST.md`

## Support

For issues:
1. Check console logs (browser and terminal)
2. Verify server and client are both running
3. Review error messages carefully
4. Check MCP-UI documentation at https://github.com/idosal/mcp-ui

---

**Enjoy using the MCP React Client!** 🎉

