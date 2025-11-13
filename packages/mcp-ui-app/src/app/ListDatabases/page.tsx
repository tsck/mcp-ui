/** @jsxImportSource @emotion/react */
"use client";

import { z } from "zod";
import { useRenderData } from "../../hooks/useRenderData";
import {
  ListDatabases,
  type ListDatabasesProps,
} from "../../components/ListDatabases/ListDatabases";

// Define the schema for a single database
const DatabaseInfoSchema = z.object({
  name: z.string(),
  size: z.number(),
});

// Define the schema for the full data structure
const ListDatabasesDataSchema = z.object({
  databases: z.array(DatabaseInfoSchema),
  totalCount: z.number(),
});

type ListDatabasesRenderData = z.infer<typeof ListDatabasesDataSchema>;

export default function ListDatabasesPage() {
  const { data, isLoading, error } = useRenderData<ListDatabasesRenderData>({
    schema: ListDatabasesDataSchema,
  });

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  }

  if (!data || !data.databases || data.databases.length === 0) {
    return <div style={{ padding: "20px" }}>No databases available</div>;
  }

  return <ListDatabases databases={data.databases} />;
}
