/** @jsxImportSource @emotion/react */
import {
  Chart,
  ChartGrid,
  ChartHeader,
  ChartTooltip,
  Line,
  XAxis,
  YAxis,
} from "@lg-charts/core";
import { z } from "zod";
import { useRenderData } from "../../hooks/useRenderData";
import * as styles from "./ClusterMetrics.styles";

// Schema for a single cluster metric series
const ClusterMetricSchema = z.object({
  name: z.string(),
  data: z.array(z.tuple([z.string(), z.number()])),
});

// Schema for cluster-metrics tool render data
// Handles both array format and object-with-numeric-keys format
const ClusterMetricsDataSchema = z.union([
  z.array(ClusterMetricSchema),
  z.record(z.string(), ClusterMetricSchema),
]);

type ClusterMetricsRawData = z.infer<typeof ClusterMetricsDataSchema>;

export interface ClusterMetric {
  name: string;
  data: Array<[string, number]>;
}

export const ClusterMetrics = () => {
  const { data, isLoading, error } = useRenderData<ClusterMetricsRawData>();

  if (isLoading) {
    return (
      <div css={styles.chartContainer}>
        <div style={{ padding: "20px" }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div css={styles.chartContainer}>
        <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div css={styles.chartContainer}>
        <div style={{ padding: "20px" }}>No data available</div>
      </div>
    );
  }

  // Convert object with numeric keys to array if needed
  // This handles cases where arrays are serialized as objects
  const dataArray = Array.isArray(data)
    ? data
    : Object.values(data as Record<string, ClusterMetric>);

  // Validate props against schema
  const dataArraySchema = z.array(ClusterMetricSchema);
  const validationResult = dataArraySchema.safeParse(dataArray);

  if (!validationResult.success) {
    console.error("[ClusterMetrics] Validation error:", validationResult.error);
    return (
      <div css={styles.chartContainer}>
        <div style={{ color: "red", padding: "20px" }}>
          Validation Error:{" "}
          {validationResult.error.issues.map((e) => e.message).join(", ")}
        </div>
      </div>
    );
  }

  return (
    <div css={styles.chartContainer}>
      <Chart>
        {dataArray.map((item, index) => (
          <Line key={index} name={item.name} data={item.data} />
        ))}
        <ChartHeader title="MCP Generated Chart" />
        <ChartGrid />
        <ChartTooltip />
        <XAxis type="time" />
        <YAxis type="value" />
      </Chart>
    </div>
  );
};

