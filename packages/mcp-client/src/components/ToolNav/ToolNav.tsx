/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { mcpClient } from "../../services/mcpClient";
import { errorMessageStyle } from "../../App.styles";
import { SideNav, SideNavGroup, SideNavItem } from "@leafygreen-ui/side-nav";
interface ToolNavProps {
  onToolCall: (toolName: string, args?: Record<string, unknown>) => void;
  activeTool: string;
}

export function ToolNav({ onToolCall, activeTool }: ToolNavProps) {
  const [tools, setTools] = useState<Tool[]>([]);
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
        setError(err instanceof Error ? err.message : "Failed to load tools");
        console.error("Error loading tools:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const handleExecute = (tool: Tool) => {
    onToolCall(tool.name);
  };

  if (loading) {
    return <p>Loading tools...</p>;
  }

  if (error) {
    return <div css={errorMessageStyle}>Error: {error}</div>;
  }

  return (
    <SideNav>
      <SideNavGroup header="Available Tools">
        {tools
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((tool) => (
            <SideNavItem
              key={tool.name}
              onClick={() => handleExecute(tool)}
              active={activeTool === tool.name}
            >
              {tool.title || tool.name}
            </SideNavItem>
          ))}
      </SideNavGroup>
    </SideNav>
  );
}
