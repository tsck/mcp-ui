import { useState, useEffect } from 'react';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { mcpClient } from '../services/mcpClient';

interface ToolSelectorProps {
  onToolCall: (toolName: string, args?: Record<string, unknown>) => void;
}

export function ToolSelector({ onToolCall }: ToolSelectorProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        await mcpClient.initialize();
        const result = await mcpClient.listTools();
        setTools(result.tools);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tools');
        console.error('Error loading tools:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleExecute = () => {
    if (selectedTool) {
      onToolCall(selectedTool.name);
    }
  };

  if (loading) {
    return (
      <div className="tool-selector">
        <h2>Available Tools</h2>
        <p>Loading tools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tool-selector">
        <h2>Available Tools</h2>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="tool-selector">
      <h2>Available Tools</h2>
      <div className="tools-list">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className={`tool-item ${selectedTool?.name === tool.name ? 'selected' : ''}`}
            onClick={() => handleToolSelect(tool)}
          >
            <h3>{tool.title || tool.name}</h3>
            <p>{tool.description}</p>
            {tool.inputSchema && (
              <pre className="input-schema">
                {JSON.stringify(tool.inputSchema, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
      {selectedTool && (
        <div className="tool-actions">
          <button onClick={handleExecute} className="execute-btn">
            Execute {selectedTool.name}
          </button>
        </div>
      )}
    </div>
  );
}

