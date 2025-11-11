/** @jsxImportSource @emotion/react */
"use client";

import { ClusterMetrics } from "../../components/ClusterMetrics/ClusterMetrics";
import { mockData } from "./mockData";

export default function ClusterMetricsPage() {
  return <ClusterMetrics data={mockData} />;
}
