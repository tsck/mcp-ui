/** @jsxImportSource @emotion/react */
import { UIResourceRenderer, isUIResource, type UIActionResult } from '@mcp-ui/client';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { sectionTitleStyle, placeholderStyle, uiContainerStyle } from '../App.styles';

interface UIRendererProps {
  response: CallToolResult | null;
}

export function UIRenderer({ response }: UIRendererProps) {
  const handleUIAction = async (result: UIActionResult) => {
    console.log('UI Action:', result);
    return { status: 'handled' as const };
  };

  if (!response) {
    return (
      <div>
        <h2 css={sectionTitleStyle}>Rendered UI</h2>
        <div css={placeholderStyle}>No UI to render yet. Execute a tool to see the rendered output.</div>
      </div>
    );
  }

  // Check if the response contains a UIResource
  const uiResource = response.content?.find((item: any) => isUIResource(item));

  if (!uiResource) {
    return (
      <div>
        <h2 css={sectionTitleStyle}>Rendered UI</h2>
        <div css={placeholderStyle}>This response does not contain a UI resource.</div>
      </div>
    );
  }

  return (
    <div>
      <h2 css={sectionTitleStyle}>Rendered UI</h2>
      <div css={uiContainerStyle}>
        <UIResourceRenderer
          resource={(uiResource as any).resource}
          onUIAction={handleUIAction}
        />
      </div>
    </div>
  );
}

