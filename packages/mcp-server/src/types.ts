/**
 * TypeScript interfaces for tool render data
 * These define the data structures expected by each UI component
 */

/**
 * Data structure for the hello-world tool
 */
export interface HelloWorldRenderData {
  message: string;
  timestamp: string;
}

/**
 * Data structure for cluster metrics time series data
 */
export interface ClusterMetricsDataPoint {
  /** ISO timestamp string */
  0: string;
  /** Metric value */
  1: number;
}

/**
 * Data structure for a single cluster metric series
 */
export interface ClusterMetricsSeries {
  /** Name of the cluster/shard */
  name: string;
  /** Time series data points */
  data: ClusterMetricsDataPoint[];
}

/**
 * Data structure for the cluster-metrics tool
 */
export type ClusterMetricsRenderData = ClusterMetricsSeries[];

/**
 * Data structure for a single database
 */
export interface DatabaseInfo {
  name: string;
  size: number; // Size in bytes
}

/**
 * Data structure for the list-databases tool
 */
export interface ListDatabasesRenderData {
  databases: DatabaseInfo[];
  totalCount: number;
}

/**
 * Union type of all possible render data types
 */
export type RenderData =
  | HelloWorldRenderData
  | ClusterMetricsRenderData
  | ListDatabasesRenderData
  | Record<string, unknown>; // Fallback for unknown tools

