/** @jsxImportSource @emotion/react */
"use client";

import { useEffect, useState } from "react";
import { ClusterMetrics } from "../../components/ClusterMetrics/ClusterMetrics";

export default function ClusterMetricsPage() {
  const [data, setData] = useState<Array<{
    name: string;
    data: Array<[string, number]>;
  }> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("Waiting for render data from parent...");

    // Listen for render data from parent window
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message:", event.data);

      if (event.data.type === "ui-lifecycle-iframe-render-data") {
        const renderData = event.data.payload.renderData;
        console.log("Received render data:", renderData);

        if (renderData?.data) {
          setData(renderData.data);
        }
        setIsReady(true);
      }
    };

    window.addEventListener("message", handleMessage);

    // Notify parent we're ready to receive data
    window.parent.postMessage({ type: "ui-lifecycle-iframe-ready" }, "*");
    console.log("Sent ui-lifecycle-iframe-ready to parent");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!isReady || !data) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return <ClusterMetrics data={data} />;
}
