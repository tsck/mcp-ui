import { augmentWithUI } from "./utils";

// Export new API for tool name-based UI augmentation
export { augmentWithUI };

// Export TypeScript types for render data
export type {
  HelloWorldRenderData,
  ClusterMetricsRenderData,
  ClusterMetricsSeries,
  ClusterMetricsDataPoint,
  RenderData,
} from "./types";
