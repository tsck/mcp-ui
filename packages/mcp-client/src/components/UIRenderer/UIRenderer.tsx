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

  // Extract render data from the UI resource's uiMetadata['initial-render-data']
  // The server should have embedded the data here using augmentWithUI()
  const renderData =
    (uiResource as any).resource?.uiMetadata?.["initial-render-data"] || null;

  if (renderData) {
    console.log(
      "Extracted render data from uiMetadata['initial-render-data']:",
      renderData
    );
  } else {
    console.warn(
      "No render data found in uiMetadata['initial-render-data']. The server may not have embedded data correctly."
    );
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
