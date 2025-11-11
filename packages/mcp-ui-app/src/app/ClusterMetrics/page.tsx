/** @jsxImportSource @emotion/react */
"use client";

import { ClusterMetrics } from "../../components/ClusterMetrics/ClusterMetrics";
import { mockData } from "./mockData.js";

export default function ClusterMetricsPage() {
  return <ClusterMetrics data={mockData} />;
}
