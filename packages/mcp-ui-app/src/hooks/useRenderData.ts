import { useEffect, useState } from "react";

/**
 * Hook for receiving render data from parent window via postMessage
 * This is used by iframe-based UI components that receive data from the MCP client
 *
 * @template T - The type of data expected in the renderData payload
 * @returns An object containing:
 *   - data: The received render data (or null if not yet received)
 *   - isReady: Whether the iframe has completed the lifecycle handshake
 *   - isLoading: Convenience flag that's true when not ready or data is null
 *
 * @example
 * ```tsx
 * interface MyData {
 *   items: string[];
 * }
 *
 * function MyComponent() {
 *   const { data, isLoading } = useRenderData<MyData>();
 *
 *   if (isLoading) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return <div>{data.items.map(item => <div key={item}>{item}</div>)}</div>;
 * }
 * ```
 */
export function useRenderData<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("[useRenderData] Waiting for render data from parent...");

    // Listen for render data from parent window
    const handleMessage = (event: MessageEvent) => {
      console.log("[useRenderData] Received message:", event.data);

      if (event.data.type === "ui-lifecycle-iframe-render-data") {
        const renderData = event.data.payload?.renderData;
        console.log("[useRenderData] Received render data:", renderData);

        if (renderData !== undefined && renderData !== null) {
          setData(renderData);
        }
        setIsReady(true);
      }
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
    isReady,
    isLoading: !isReady || data === null,
  };
}
