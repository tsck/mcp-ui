import { useState } from 'react';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ToolSelector } from './components/ToolSelector';
import { ResponseDisplay } from './components/ResponseDisplay';
import { UIRenderer } from './components/UIRenderer';
import { mcpClient } from './services/mcpClient';
import './App.css';

function App() {
  const [response, setResponse] = useState<CallToolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToolCall = async (toolName: string, args?: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mcpClient.callTool(toolName, args);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute tool');
      console.error('Error calling tool:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MCP React Client</h1>
        <p>Interact with MCP Server Tools</p>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          <ToolSelector onToolCall={handleToolCall} />
        </aside>
        <main className="main-content">
          <div className="content-panel">
            <ResponseDisplay response={response} loading={loading} error={error} />
          </div>
          <div className="content-panel">
            <UIRenderer response={response} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
