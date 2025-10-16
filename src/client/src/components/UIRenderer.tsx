import { UIResourceRenderer, isUIResource, type UIActionResult } from '@mcp-ui/client';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

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
      <div className="ui-renderer">
        <h2>Rendered UI</h2>
        <p className="placeholder">No UI to render yet. Execute a tool to see the rendered output.</p>
      </div>
    );
  }

  // Check if the response contains a UIResource
  const uiResource = response.content?.find((item: any) => isUIResource(item));

  if (!uiResource) {
    return (
      <div className="ui-renderer">
        <h2>Rendered UI</h2>
        <p className="placeholder">This response does not contain a UI resource.</p>
      </div>
    );
  }

  return (
    <div className="ui-renderer">
      <h2>Rendered UI</h2>
      <div className="ui-container">
        <UIResourceRenderer
          resource={(uiResource as any).resource}
          onUIAction={handleUIAction}
        />
      </div>
    </div>
  );
}

