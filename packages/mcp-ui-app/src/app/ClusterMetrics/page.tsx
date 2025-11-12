/** @jsxImportSource @emotion/react */
"use client";

import { z } from "zod";
import { useRenderData } from "../../hooks/useRenderData";
import {
  ClusterMetrics,
  type ClusterMetricsProps,
} from "../../components/ClusterMetrics/ClusterMetrics";

// Define the data structure for a single metric series
const ClusterMetricSchema = z.object({
  name: z.string(),
  data: z.array(z.tuple([z.string(), z.number()])),
});

// Schema validates against component props structure
// Handles both array format and object-with-numeric-keys format
// (arrays can get serialized as objects during JSON processing)
const ClusterMetricsDataSchema = z.union([
  z.array(ClusterMetricSchema),
  z.record(z.string(), ClusterMetricSchema),
]);

type ClusterMetricsRawData = z.infer<typeof ClusterMetricsDataSchema>;

export default function ClusterMetricsPage() {
  const { data, isLoading, error } = useRenderData<ClusterMetricsRawData>({
    schema: ClusterMetricsDataSchema,
  });

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
