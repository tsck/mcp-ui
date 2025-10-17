/** @jsxImportSource @emotion/react */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  sectionTitleStyle,
  placeholderStyle,
  errorMessageStyle,
} from "./ResponseDisplay.styles";
import { CodeEditor } from "@leafygreen-ui/code-editor";

interface ResponseDisplayProps {
  response: CallToolResult | null;
  loading: boolean;
  error: string | null;
}

export function ResponseDisplay({
  response,
  loading,
  error,
}: ResponseDisplayProps) {
  if (loading) {
    return (
      <div>
        <p>Executing tool...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div css={errorMessageStyle}>Error: {error}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div>
        <div css={placeholderStyle}>
          No response yet. Execute a tool to see the result.
        </div>
      </div>
    );
  }

  return (
    <>
      <CodeEditor
        readOnly
        value={JSON.stringify(response, null, 2)}
        enableLineWrapping
        language="json"
        // @ts-ignore
        copyButtonAppearance="hidden"
      />
    </>
  );
}
