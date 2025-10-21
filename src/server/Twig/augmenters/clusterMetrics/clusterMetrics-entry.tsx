import React from "react";
import { createRoot } from "react-dom/client";
import {
  Chart,
  ChartGrid,
  ChartHeader,
  ChartTooltip,
  Line,
  XAxis,
  YAxis,
} from "@lg-charts/core";
import "./clusterMetrics-entry.css";

interface ClusterMetrics {
  name: string;
  data: Array<[string, number]>;
}

// Expose a global function to render cluster metrics charts
declare global {
  interface Window {
    renderClusterMetrics: (
      containerId: string,
      data: Array<ClusterMetrics>
    ) => void;
  }
}

window.renderClusterMetrics = (
  containerId: string,
  data: Array<ClusterMetrics>
) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(
    <Chart>
      {data.map((item, index) => (
        <Line key={index} name={item.name} data={item.data} />
      ))}
      <ChartHeader title="MCP Generated Chart" />
      <ChartGrid />
      <ChartTooltip />
    </Chart>
  );
};
