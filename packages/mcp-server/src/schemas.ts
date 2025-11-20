import { z } from "zod";

// Schema for a single database
export const DatabaseInfoSchema = z.object({
  name: z.string(),
  size: z.number(),
});

// Schema for list-databases tool render data
export const ListDatabasesDataSchema = z.object({
  databases: z.array(DatabaseInfoSchema),
  totalCount: z.number(),
});

// Schema for a single cluster metric series
export const ClusterMetricSchema = z.object({
  name: z.string(),
  data: z.array(z.tuple([z.string(), z.number()])),
});

// Schema for cluster-metrics tool render data
// Handles both array format and object-with-numeric-keys format
// (arrays can get serialized as objects during JSON processing)
export const ClusterMetricsDataSchema = z.union([
  z.array(ClusterMetricSchema),
  z.record(z.string(), ClusterMetricSchema),
]);

// Map tool names to their corresponding schemas
export const TOOL_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "list-databases": ListDatabasesDataSchema,
  "cluster-metrics": ClusterMetricsDataSchema,
  // hello-world doesn't require render data, so no schema needed
};

