/** @jsxImportSource @emotion/react */
import { useState } from "react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolNav } from "./components/ToolNav";
import { ResponseDisplay } from "./components/ResponseDisplay";
import { UIRenderer } from "./components/UIRenderer";
import { mcpClient } from "./services/mcpClient";

import {
  getAppContainerStyle,
  appLayoutStyle,
  mainContentStyle,
  contentPanelStyle,
} from "./App.styles";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";

function App() {
  const [response, setResponse] = useState<CallToolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useDarkMode();

  const handleToolCall = async (
    toolName: string,
    args?: Record<string, unknown>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mcpClient.callTool(toolName, args);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute tool");
      console.error("Error calling tool:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div css={getAppContainerStyle(theme)}>
      <div css={appLayoutStyle}>
        <ToolNav onToolCall={handleToolCall} />
        <main css={mainContentStyle}>
          <div css={contentPanelStyle}>
            <ResponseDisplay
              response={response}
              loading={loading}
              error={error}
            />
          </div>
          <div css={contentPanelStyle}>
            <UIRenderer response={response} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
