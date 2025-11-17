export { augmentWithUI, type AugmentOptions } from "./augmentWithUI";

// Export Zod schemas for validation
export {
  DatabaseInfoSchema,
  ListDatabasesDataSchema,
  ClusterMetricSchema,
  ClusterMetricsDataSchema,
} from "./schemas";

// Export TypeScript types for render data
export type {
  HelloWorldRenderData,
  ClusterMetricsRenderData,
  ClusterMetricsSeries,
  ClusterMetricsDataPoint,
  RenderData,
} from "./types";
