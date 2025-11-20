/** @jsxImportSource @emotion/react */
import { Card } from "@leafygreen-ui/card";
import { H1 } from "@leafygreen-ui/typography";
import { z } from "zod";
import { useRenderData } from "../../hooks/useRenderData";
import * as styles from "./ListDatabases.styles";

// Schema for a single database
const DatabaseInfoSchema = z.object({
  name: z.string(),
  size: z.number(),
});

// Schema for list-databases tool render data
const ListDatabasesDataSchema = z.object({
  databases: z.array(DatabaseInfoSchema),
  totalCount: z.number(),
});

type ListDatabasesRenderData = z.infer<typeof ListDatabasesDataSchema>;

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

export const ListDatabases = () => {
  const { data, isLoading, error } = useRenderData<ListDatabasesRenderData>();

  if (isLoading) {
    return (
      <Card>
        <div css={styles.cardContentStyles}>
          <H1>Databases</H1>
          <div style={{ padding: "20px" }}>Loading...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div css={styles.cardContentStyles}>
          <H1>Databases</H1>
          <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>
        </div>
      </Card>
    );
  }

  if (!data || !data.databases || data.databases.length === 0) {
    return (
      <Card>
        <div css={styles.cardContentStyles}>
          <H1>Databases</H1>
          <div style={{ padding: "20px" }}>No databases available</div>
        </div>
      </Card>
    );
  }

  // Validate props against schema
  const validationResult = ListDatabasesDataSchema.safeParse(data);

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
          {data.databases.map((db, index) => (
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

