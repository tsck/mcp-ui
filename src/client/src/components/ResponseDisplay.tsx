import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

interface ResponseDisplayProps {
  response: CallToolResult | null;
  loading: boolean;
  error: string | null;
}

export function ResponseDisplay({ response, loading, error }: ResponseDisplayProps) {
  if (loading) {
    return (
      <div className="response-display">
        <h2>Response</h2>
        <p>Executing tool...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="response-display">
        <h2>Response</h2>
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-display">
        <h2>Response</h2>
        <p className="placeholder">No response yet. Execute a tool to see the result.</p>
      </div>
    );
  }

  return (
    <div className="response-display">
      <h2>Response</h2>
      <pre className="response-json">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}

