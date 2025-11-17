/** @jsxImportSource @emotion/react */
import React from "react";
import {
  Chart,
  ChartGrid,
  ChartHeader,
  ChartTooltip,
  Line,
  XAxis,
  YAxis,
} from "@lg-charts/core";
import { ClusterMetricSchema } from "@mcp-poc/mcp-ui-sdk";
import { z } from "zod";
import * as styles from "./ClusterMetrics.styles";

export interface ClusterMetric {
  name: string;
  data: Array<[string, number]>;
}

export interface ClusterMetricsProps {
  data: Array<ClusterMetric>;
}

export const ClusterMetrics = ({ data }: ClusterMetricsProps) => {
  // Validate props against schema
  const dataArraySchema = z.array(ClusterMetricSchema);
  const validationResult = dataArraySchema.safeParse(data);

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
        {data.map((item, index) => (
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
