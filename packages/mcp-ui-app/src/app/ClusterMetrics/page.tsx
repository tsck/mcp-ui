/** @jsxImportSource @emotion/react */
"use client";

import { useRenderData } from "../../hooks/useRenderData";
import { ClusterMetrics } from "../../components/ClusterMetrics/ClusterMetrics";

// Define the expected data structure for type safety
interface ClusterMetricsData {
  data: Array<{
    name: string;
    data: Array<[string, number]>;
  }>;
}

export default function ClusterMetricsPage() {
  const { data, isLoading } = useRenderData<ClusterMetricsData>();

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return <ClusterMetrics data={data!.data} />;
}
