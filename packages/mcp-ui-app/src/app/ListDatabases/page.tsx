/** @jsxImportSource @emotion/react */
"use client";

import { z } from "zod";
import { ListDatabasesDataSchema } from "@mcp-poc/core";
import { useRenderData } from "../../hooks/useRenderData";
import { ListDatabases } from "../../components/ListDatabases/ListDatabases";

type ListDatabasesRenderData = z.infer<typeof ListDatabasesDataSchema>;

export default function ListDatabasesPage() {
  const { data, isLoading, error } = useRenderData<ListDatabasesRenderData>();

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
