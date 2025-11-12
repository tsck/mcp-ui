/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  UIResourceRenderer,
  isUIResource,
  type UIActionResult,
} from "@mcp-ui/client";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { placeholderStyle, uiContainerStyle } from "./UIRenderer.styles";

interface UIRendererProps {
  response: CallToolResult | null;
}

export function UIRenderer({ response }: UIRendererProps) {
  const handleUIAction = async (result: UIActionResult) => {
    console.log("UI Action:", result);
    return { status: "handled" as const };
  };

  if (!response) {
    return (
      <div>
        <div css={placeholderStyle}>
          No UI to render yet. Execute a tool to see the rendered output.
        </div>
      </div>
    );
  }

  // Check if the response contains a UIResource
  const uiResource = response.content?.find((item: any) => isUIResource(item));

  if (!uiResource) {
    return (
      <div>
        <div css={placeholderStyle}>
          This response does not contain a UI resource.
        </div>
      </div>
    );
  }

  // Extract data from the first text content item (before the UI resource)
  // This is the actual data from the tool (e.g., cluster metrics JSON)
  const dataContent = response.content?.find(
    (item: any) => item.type === "text"
  );
  let renderData = null;

  if (dataContent && dataContent.text) {
    try {
      renderData = JSON.parse(dataContent.text);
      console.log("Extracted render data for iframe:", renderData);
    } catch (e) {
      console.error("Failed to parse render data:", e);
    }
  }

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <div css={uiContainerStyle}>
        <UIResourceRenderer
          resource={(uiResource as any).resource}
          onUIAction={handleUIAction}
          htmlProps={{
            style: {
              width: "100%",
              minHeight: "calc(100vh - 200px)",
              border: "none",
            },
            // Pass the extracted data directly - UIResourceRenderer will handle the postMessage lifecycle
            iframeRenderData: renderData || undefined,
          }}
        />
      </div>
    </div>
  );
}
