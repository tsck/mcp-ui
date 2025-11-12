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
import * as styles from "./ClusterMetrics.styles";

export interface ClusterMetric {
  name: string;
  data: Array<[string, number]>;
}

export interface ClusterMetricsProps {
  data: Array<ClusterMetric>;
}

export const ClusterMetrics = ({ data }: ClusterMetricsProps) => (
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
