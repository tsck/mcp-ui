/** @jsxImportSource @emotion/react */
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { sectionTitleStyle, responseJsonStyle, placeholderStyle, errorMessageStyle } from '../App.styles';

interface ResponseDisplayProps {
  response: CallToolResult | null;
  loading: boolean;
  error: string | null;
}

export function ResponseDisplay({ response, loading, error }: ResponseDisplayProps) {
  if (loading) {
    return (
      <div>
        <h2 css={sectionTitleStyle}>Response</h2>
        <p>Executing tool...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 css={sectionTitleStyle}>Response</h2>
        <div css={errorMessageStyle}>Error: {error}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div>
        <h2 css={sectionTitleStyle}>Response</h2>
        <div css={placeholderStyle}>No response yet. Execute a tool to see the result.</div>
      </div>
    );
  }

  return (
    <div>
      <h2 css={sectionTitleStyle}>Response</h2>
      <pre css={responseJsonStyle}>
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}

