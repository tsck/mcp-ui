/** @jsxImportSource @emotion/react */
import React from "react";
import { Card } from "@leafygreen-ui/card";
import { H1 } from "@leafygreen-ui/typography";
import { DatabaseInfoSchema } from "@mcp-poc/core";
import { z } from "zod";
import * as styles from "./ListDatabases.styles";

export interface DatabaseInfo {
  name: string;
  size: number; // Size in bytes
}

export interface ListDatabasesProps {
  databases: DatabaseInfo[];
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export const ListDatabases = ({ databases }: ListDatabasesProps) => {
  // Validate props against schema
  const databasesArraySchema = z.array(DatabaseInfoSchema);
  const validationResult = databasesArraySchema.safeParse(databases);

  if (!validationResult.success) {
    console.error("[ListDatabases] Validation error:", validationResult.error);
    return (
      <Card>
        <div css={styles.cardContentStyles}>
          <H1>Databases</H1>
          <div style={{ color: "red", padding: "20px" }}>
            Validation Error:{" "}
            {validationResult.error.issues.map((e) => e.message).join(", ")}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div css={styles.cardContentStyles}>
        <H1>Databases</H1>
        <ul css={styles.listStyles}>
          {databases.map((db, index) => (
            <li key={index} css={styles.listItemStyles}>
              <span css={styles.databaseNameStyles}>{db.name}</span>
              <span css={styles.databaseSizeStyles}>
                {formatBytes(db.size)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
