/** @jsxImportSource @emotion/react */
"use client";

import { z } from "zod";
import { ClusterMetricsDataSchema } from "@mcp-poc/core";
import { useRenderData } from "../../hooks/useRenderData";
import {
  ClusterMetrics,
  type ClusterMetricsProps,
} from "../../components/ClusterMetrics/ClusterMetrics";

type ClusterMetricsRawData = z.infer<typeof ClusterMetricsDataSchema>;

export default function ClusterMetricsPage() {
  const { data, isLoading, error } = useRenderData<ClusterMetricsRawData>();

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={{ padding: "20px" }}>No data available</div>;
  }

  // Convert object with numeric keys to array if needed
  // This handles cases where arrays are serialized as objects
  const dataArray = Array.isArray(data)
    ? data
    : Object.values(data as Record<string, ClusterMetricsProps["data"][0]>);

  return <ClusterMetrics data={dataArray} />;
}
