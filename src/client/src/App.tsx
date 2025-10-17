/** @jsxImportSource @emotion/react */
import { useState } from "react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ToolNav } from "./components/ToolNav";
import { ResponseDisplay } from "./components/ResponseDisplay";
import { UIRenderer } from "./components/UIRenderer";
import { mcpClient } from "./services/mcpClient";
import { Tabs, Tab } from "@leafygreen-ui/tabs";

import {
  getAppContainerStyle,
  appLayoutStyle,
  mainContentStyle,
} from "./App.styles";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { css } from "@emotion/react";

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
        <main
          css={css`
            display: flex;
            flex-direction: column;
            height: 100vh;
          `}
        >
          <Tabs
            aria-labelledby="tabs-1"
            css={css`
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              /* Remove default tab content padding */
              > div[role="tabpanel"] {
                padding: 0;
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: auto;
              }
            `}
          >
            <Tab name="UI">
              <div css={mainContentStyle}>
                <UIRenderer response={response} />
              </div>
            </Tab>
            <Tab name="Response Object">
              <div
                css={css`
                  ${mainContentStyle};
                  flex: 0 0 auto;
                  height: auto;
                `}
              >
                <ResponseDisplay
                  response={response}
                  loading={loading}
                  error={error}
                />
              </div>
            </Tab>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default App;
