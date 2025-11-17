import { useEffect, useState } from "react";

/**
 * Hook for receiving render data from parent window via postMessage
 * This is used by iframe-based UI components that receive data from the MCP client
 *
 * @template T - The type of data expected in the renderData payload
 * @returns An object containing:
 *   - data: The received render data (or null if not yet received)
 *   - isLoading: Whether data is still being loaded
 *   - error: Error message if message validation failed
 *
 * @example
 * ```tsx
 * interface MyData {
 *   items: string[];
 * }
 *
 * function MyComponent() {
 *   const { data, isLoading, error } = useRenderData<MyData>();
 *   // ...
 * }
 * ```
 */
export function useRenderData<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useRenderData] Waiting for render data from parent...");

    // Listen for render data from parent window
    const handleMessage = (event: MessageEvent) => {
      console.log("[useRenderData] Received message:", event.data);

      // Note: Origin validation is intentionally NOT performed here
      // MCP-UI is designed to be universally embeddable from any MCP client
      // (desktop apps, browser extensions, web apps with variable origins)
      // For private/enterprise deployments requiring origin restrictions, see next.config.ts

      // Security: Message type validation - only accept expected message types
      if (event.data?.type !== "ui-lifecycle-iframe-render-data") {
        // Silently ignore messages that aren't for us
        return;
      }

      // Security: Payload structure validation
      if (!event.data.payload || typeof event.data.payload !== "object") {
        const errorMsg = "Invalid payload structure received";
        console.error(`[useRenderData] ${errorMsg}`);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      const renderData = event.data.payload.renderData;
      console.log("[useRenderData] Received render data:", renderData);

      // Security: Validate data exists and is of expected type
      if (renderData === undefined || renderData === null) {
        console.warn("[useRenderData] Received null/undefined renderData");
        setIsLoading(false);
        // Not an error - parent may intentionally send null
        return;
      }

      // Security: Basic type checking - ensure data matches expected structure
      if (typeof renderData !== "object") {
        const errorMsg = `Expected object but received ${typeof renderData}`;
        console.error(`[useRenderData] ${errorMsg}`);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Note: XSS prevention is handled by React's automatic escaping when rendering
      // If you need to render raw HTML (dangerouslySetInnerHTML), sanitize with DOMPurify
      // Note: Schema validation is handled by the components themselves
      setData(renderData as T);
      setIsLoading(false);
      setError(null);
    };

    window.addEventListener("message", handleMessage);

    // Notify parent we're ready to receive data
    window.parent.postMessage({ type: "ui-lifecycle-iframe-ready" }, "*");
    console.log("[useRenderData] Sent ui-lifecycle-iframe-ready to parent");

    return () => {
      console.log("[useRenderData] Cleaning up message listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return {
    data,
    isLoading,
    error,
  };
}
