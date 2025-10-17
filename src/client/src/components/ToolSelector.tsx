/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { mcpClient } from '../services/mcpClient';
import {
  toolSelectorStyle,
  toolsListStyle,
  toolItemStyle,
  inputSchemaStyle,
  toolActionsStyle,
  executeButtonStyle,
  errorMessageStyle,
} from '../App.styles';

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
      <div css={toolSelectorStyle}>
        <h2>Available Tools</h2>
        <p>Loading tools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div css={toolSelectorStyle}>
        <h2>Available Tools</h2>
        <div css={errorMessageStyle}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div css={toolSelectorStyle}>
      <h2>Available Tools</h2>
      <div css={toolsListStyle}>
        {tools.map((tool) => (
          <div
            key={tool.name}
            css={toolItemStyle(selectedTool?.name === tool.name)}
            onClick={() => handleToolSelect(tool)}
          >
            <h3>{tool.title || tool.name}</h3>
            <p>{tool.description}</p>
            {tool.inputSchema && (
              <pre css={inputSchemaStyle}>
                {JSON.stringify(tool.inputSchema, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
      {selectedTool && (
        <div css={toolActionsStyle}>
          <button css={executeButtonStyle} onClick={handleExecute}>
            Execute {selectedTool.name}
          </button>
        </div>
      )}
    </div>
  );
}

