# **WIP** LeafyGreen MCP-UI

Author: [Terrence Keane](mailto:terrence.keane@mongodb.com)  
Date:

# LGTMs

| Reviewer | Status (✅/🚧/⛔) |
| :------- | :---------------- |
| TBD      | 🚧                |
| TBD      | 🚧                |
| TBD      | 🚧                |
| TBD      | 🚧                |

# Goals

The output of this project will be:

1. **A working package** (`@lg-mcp-ui/core`) that can augment MongoDB MCP Server tool responses with UI resources
2. **An example implementation** demonstrating LeafyGreen MCP-UI working with the MongoDB MCP Server, rendering UI that displays the results of the `list-databases` tool.

The example will showcase the complete end-to-end flow:

- MongoDB MCP Server executes `list-databases` tool
- LeafyGreen MCP-UI augments the response with a `UIResource` pointing to an embeddable UI
- Embeddable UI renders a Card component displaying the list of databases
- Client application renders the UI pointed to in the UIResource in a sandboxed iframe

# MCP Flowchart

[![][image1]](https://lucid.app/lucidchart/921ca29e-6713-444c-bd61-96f39f496a6c/edit?=&page=1&v=6356&s=612&referringApp=google%20docs)

# Architecture

The LeafyGreen MCP-UI project will be structured as a monorepo workspace within the `leafygreen-ui` repository, following the existing package structure conventions. The project consists of three main components:

## Package Exports

### **`@lg-mcp-ui/core`**

The main package exports the core `augmentWithUI()` function and types:

```ts
export { augmentWithUI } from "@lg-mcp-ui/core";
export type { AugmentWithUIOptions, UIResourceMetadata } from "@lg-mcp-ui/core";
```

### **`@lg-mcp-ui/[embeddable-ui]`**

Each embeddable UI package exports a single React component:

```ts
export { ListDatabases } from "@lg-mcp-ui/list-databases";
```

### **`mcp-ui-app`**

The Next.js application serves as the hosting infrastructure for embeddable UIs. Each route corresponds to an embeddable UI component that will be rendered within an iframe. Note: This will NOT be exported externally.

## Package Structure

```
apps/
  mcp-ui-app/                 # Next.js app hosting embeddable UIs
    src/
      app/
        list-databases/       # Embeddable UI route
        [other-embeddable-uis]/
    package.json
    tsconfig.json

mcp-ui/                      # All @lg-mcp-ui packages
  list-databases/            # Embeddable UI package (@lg-mcp-ui/list-databases)
    src/
      index.tsx              # Embeddable UI React component export
    package.json
    README.md
    tsconfig.json

  core/                      # Core package (@lg-mcp-ui/core)
    src/
      index.ts               # Main export: augmentWithUI()
    package.json
    README.md
    tsconfig.json
```

# Core Dependencies

## `@mcp-ui/server`

The official mcp-ui server SDK that provides the `createUIResource` function and `UIResource` type definitions. This package handles the creation of spec-compliant `UIResource` objects according to the [mcp-ui specification](https://mcpui.dev/guide/introduction).

## `@modelcontextprotocol/sdk`

The official Model Context Protocol SDK for TypeScript. This provides type definitions for `CallToolResult` and related MCP structures.

## `next`

Next.js framework for hosting the embeddable UI application. Provides the web application infrastructure to serve embeddable UIs at individual routes. Each embeddable UI will be accessible via a unique URL path (e.g., `/list-databases`).

## `@leafygreen-ui/*` components

MongoDB's design system components for building consistent embeddable UIs.

# Implementation Details

## Core Package Implementation (`@lg-mcp-ui/core`)

### **Schema Definitions**

All Zod schemas for tool render data are defined in `src/schemas.ts` and exported from the package. This centralizes schema definitions and ensures consistency between validation at the data source and component level.

**Example:**

```ts
// src/schemas.ts
import { z } from "zod";

export const DatabaseInfoSchema = z.object({
  name: z.string(),
  size: z.number(),
});

export const ListDatabasesDataSchema = z.object({
  databases: z.array(DatabaseInfoSchema),
  totalCount: z.number(),
});

export const TOOL_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "list-databases": ListDatabasesDataSchema,
};
```

### **`augmentWithUI()` Function**

The primary entry point for LeafyGreen MCP-UI. This function takes a `CallToolResult` and augments it with a `UIResource` if a corresponding embeddable UI exists for the tool call.

```ts
function augmentWithUI(
  toolResult: CallToolResult,
  options: {
    toolName: string;
    renderData: Record<string, unknown>;
  }
): CallToolResult;
```

#### Behavior

1. Extracts the tool name and render data from `options.toolName` and `options.renderData`
2. Looks up the tool name in the internal `TOOL_TO_ROUTE_MAPPINGS` registry
3. If a mapping exists:
   - **Validates renderData** against the corresponding schema from `TOOL_SCHEMAS`
   - If validation fails, logs a warning and returns the original \`CallToolResult\` unchanged (prevents UI augmentation)
   - If validation passes, continues to create UI resource
   - Constructs external URL with route and `?waitForRenderData=true` query parameter
   - Creates a `UIResource` with `content.type: 'externalUrl'` pointing to the generated URL
   - **Embeds the provided render data** directly in `uiMetadata['initial-render-data']`
   - Appends the `UIResource` to the `CallToolResult.content` array
   - Returns the augmented `CallToolResult`
4. If no mapping exists, returns the `CallToolResult` unchanged

#### Error Handling

- If URL mapping doesn't exist, returns the original `CallToolResult` unchanged
- If schema validation fails, logs a warning and returns the original \`CallToolResult\` unchanged (prevents UI augmentation but preserves tool result data)
- All errors are non-fatal to ensure the MCP server can still return data even if UI augmentation fails

#### Validation

LeafyGreen MCP-UI validates `renderData` against the schema defined for each tool before creating the UI resource. This ensures data integrity at the source:

```ts
// Validate renderData against the schema for this tool (if schema exists)
const schema = TOOL_SCHEMAS[toolName];
if (schema) {
  try {
    schema.parse(renderData);
    console.log(`[augmentWithUI] Validation passed for tool: ${toolName}`);
  } catch (error) {
    const errorMessage =
      error instanceof z.ZodError
        ? `Schema validation failed for tool "${toolName}": ${error.issues
            .map((e) => e.message)
            .join(", ")}`
        : `Schema validation failed for tool "${toolName}"`;
    console.warn(`[augmentWithUI] ${errorMessage}`, error);
    // Return the tool result unmodified - validation failure prevents UI augmentation
    return toolResult;
  }
}
```

**UIResource Creation**  
LeafyGreen MCP-UI internally uses `@mcp-ui/server`'s `createUIResource` function.

#### Implementation Details

- `uri` follows the pattern `ui://{toolName}/{timestamp}` where timestamp is `Date.now()`
- `content.type` is always `'externalUrl'` for embeddable UIs
- `content.iframeUrl` includes the `?waitForRenderData=true` query parameter to signal the embeddable UI to wait for data via `postMessage`
- `encoding` defaults to `'text'`
- `uiMetadata['initial-render-data']` contains the render data provided by the MCP server

**Example: Creating UIResource for list-databases**

```ts
// MCP server passes renderData directly
const renderData = {
  databases: [
    { name: "users_db", size: 1024000 },
    { name: "products_db", size: 2048000 },
    { name: "analytics_db", size: 512000 },
  ],
  totalCount: 3,
};

// LeafyGreen MCP-UI validates renderData against ListDatabasesDataSchema
// LeafyGreen MCP-UI creates UIResource with validated renderData
const uiResource = createUIResource({
  uri: `ui://list-databases/${Date.now()}`,
  content: {
    type: "externalUrl",
    iframeUrl:
      "https://mcp-ui-mcp-ui-app.vercel.app/list-databases?waitForRenderData=true",
  },
  encoding: "text",
  metadata: {
    "mcpui.dev/ui-initial-render-data": renderData,
  },
});
```

### **UI Metadata and Communication Protocol**

Embeddable UIs communicate bidirectionally with the parent MCP client via the `postMessage` protocol as defined in the [mcp-ui embeddable UI specification](https://mcpui.dev/guide/embeddable-ui#message-types).

#### Read Flow (Data Display)

When an embeddable UI needs to display data:

1. MCP server extracts and transforms tool result into structured render data
2. MCP server calls `augmentWithUI()` with the render data
3. **LeafyGreen MCP-UI validates renderData against schema** (if schema exists for the tool)
4. LeafyGreen MCP-UI creates `UIResource` with validated render data embedded in `uiMetadata['initial-render-data']`
5. Client renders the iframe using `UIResourceRenderer` from `@mcp-ui/client`
6. Embeddable UI component listens for `ui-lifecycle-iframe-render-data` message
7. Embeddable UI receives structured render data via `event.data.payload.renderData`
8. **Component validates props against schema** before rendering
9. Embeddable UI renders using the validated data

**Message Structure (Parent → Iframe):**

The render data passed to the embeddable UI is the **structured render data provided by the MCP server**, not the raw tool result.

```ts
{
  type: 'ui-lifecycle-iframe-render-data',
  payload: {
    renderData: {
      // Tool-specific structured data provided by MCP server
      // Example for list-databases:
      databases: [
        { name: "users_db", size: 1024000 },
        { name: "products_db", size: 2048000 }
      ],
      totalCount: 2
    }
  }
}
```

Embeddable UIs listen for this message to receive data:

```ts
// In embeddable UI component
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === "ui-lifecycle-iframe-render-data") {
      const data = event.data.payload.renderData;
      // data contains: { databases: [...], totalCount: 2 }
      setDatabases(data.databases);
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);
```

The MCP server handles all extraction and transformation; embeddable UIs receive clean, typed data structures ready for rendering.

#### Write Flow (Interactive Forms & Actions)

When an embeddable UI needs to trigger an action (e.g., form submission):

1. User interacts with UI (submits form, clicks button)
2. Embeddable UI sends action message via `postMessage`
3. Parent MCP client receives message and forwards to MCP server
4. MCP server executes tool (with proper authentication/authorization)
5. MCP server extracts/transforms result data into render data
6. MCP server augments result with `augmentWithUI()` passing render data directly
7. **LeafyGreen MCP-UI validates renderData against schema** before creating UI resource
8. Client extracts render data and sends it back to iframe via read flow above
9. **Component validates props against schema** before rendering

#### Client Data Passing Assumptions

**Important**: The mcp-ui specification is still evolving, and certain aspects of client implementation are not fully standardized. LeafyGreen MCP-UI makes the following assumptions about how MCP clients handle data:

1. **Metadata Structure**:
   - UIResource metadata is stored in the `_meta` field of the resource object
   - MCP-UI specific metadata uses the prefix `mcpui.dev/ui-`
   - Example structure:

```ts
   {
     type: 'resource',
     resource: {
       uri: 'ui://...',
       mimeType: '...',
       text: '...',
       _meta: {
         'mcpui.dev/ui-initial-render-data': { /* render data */ },
         'mcpui.dev/ui-preferred-frame-size': ['800px', '600px'],
         title: 'My Component' // standard metadata
       }
     }
   }
```

2. **Data Extraction**:

   - We assume that MCP clients will extract render data from `_meta['mcpui.dev/ui-initial-render-data']` in the UIResource
   - Clients may use the `@mcp-ui/client` utility functions:
     - `getResourceMetadata(resource)` \- extracts all `_meta` content
     - `getUIResourceMetadata(resource)` \- extracts only `mcpui.dev/ui-*` fields (with prefixes removed)

3. **Data Forwarding**:
   - We assume clients will pass the extracted render data to the iframe via postMessage
   - Expected message format:

```ts
   {
     type: 'ui-lifecycle-iframe-render-data',
     payload: {
       renderData: { /* the data from _meta['mcpui.dev/ui-initial-render-data'] */ }
     }
   }
```

4. **Timing**:
   - We assume clients will wait for the `ui-lifecycle-iframe-ready` message from the iframe before sending render data
   - The `?waitForRenderData=true` query parameter signals this requirement

**Rationale**: While the [mcp-ui embeddable UI specification](https://mcpui.dev/guide/embeddable-ui#message-types) defines the postMessage protocol, the exact mechanism for how clients extract and forward `_meta['mcpui.dev/ui-initial-render-data']` to iframes is an implementation detail. Our implementation follows the pattern established by the `@mcp-ui/client` SDK and the metadata structure documented in the mcp-ui client overview.

**Impact**: If clients implement different data passing mechanisms, embeddable UIs may not receive render data correctly. This is a known risk given the early-stage nature of the mcp-ui ecosystem. For more context on the current state of mcp-ui client support, see [Current State of mcp-ui Ecosystem](#current-state-of-mcp-ui-ecosystem).

**Message Structure (Iframe → Parent):**

Embeddable UIs can send different types of action messages to the parent:

```ts
interface UIActionMessage {
  type: "tool" | "intent" | "notify" | "prompt" | "link";
  payload: {
    toolName?: string; // Required for type: 'tool'
    params?: Record<string, unknown>; // Tool parameters for type: 'tool'
  };
}
```

**Message Types:**

- `tool`: Request to call an MCP tool (most common for forms/actions)
- `intent`: High-level user intent for the LLM to interpret
- `notify`: Send notification to user
- `prompt`: Request input from user
- `link`: Navigate or open external link

**Example: Rename Collection Form**

```ts
// In embeddable UI component
function RenameCollectionForm() {
  const handleSubmit = (formData) => {
    // Send tool call request to parent
    window.parent.postMessage(
      {
        type: "tool",
        payload: {
          toolName: "rename-collection",
          params: {
            database: formData.database,
            collection: formData.collection,
            newName: formData.newName,
            dropTarget: formData.dropTarget,
          },
        },
      },
      "*"
    );
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

After the parent processes the request, the embeddable UI will receive the result via the read flow (a `ui-lifecycle-iframe-render-data` message with the updated data).

**Security note:** For more information on what should and shouldn't be sent via `postMessage`, see [Security Architecture](https://docs.google.com/document/d/1Ks9QW5EUkbbior9Oe-mehfi1Fg47jRM55CPHgDDhUlk/edit?tab=t.0#heading=h.vgikpaokkb62) section.

## Embeddable UI Hosting Application (`@lg-apps/mcp-ui-app`)

### **Route Structure**

Each embeddable UI must have its own route the Next.js application:

```ts
// src/app/list-databases/page.tsx
import { ListDatabases } from "@lg-mcp-ui/list-databases";

export default function ListDatabases() {
  const { isLoading, data } = useRenderData();
  return <ListDatabases data={data} />;
}
```

### **Data Extraction Hook**

The `useRenderData<T>()` hook provides a secure interface for embeddable UI components to receive data from the parent MCP client via the postMessage protocol.

#### Implementation

Located at `src/hooks/useRenderData.ts`, this hook implements the iframe lifecycle handshake defined in the [mcp-ui specification](https://mcpui.dev/guide/embeddable-ui#message-types):

1. **Initialization**: Sends `ui-lifecycle-iframe-ready` message to parent on mount
2. **Data Reception**: Listens for `ui-lifecycle-iframe-render-data` messages
3. **State Management**: Exposes data, loading, and error states to components

#### Security Features

The hook implements multiple validation layers:

- **Message type validation**: Only processes `ui-lifecycle-iframe-render-data` messages
- **Payload structure validation**: Verifies payload is a valid object
- **Data type checking**: Ensures renderData is an object before setting state
- **Error exposure**: Validation failures are surfaced to components via error state
- **No origin validation**: Intentionally permits messages from any origin to support universal MCP client embeddability

**Note:** Schema validation is handled at two layers:

1. **Data source** (`augmentWithUI` in LeafyGreen MCP-UI) \- validates `renderData` before creating UI resources
2. **Component level** \- components validate their props using schemas imported from the package

#### API

```ts
// Basic usage (TypeScript types only)
const { data, isLoading, error } = useRenderData<T>();
```

**Returns:**

- `data: T | null` \- The render data, or null if not yet received
- `isLoading: boolean` \- Whether data is still being loaded
- `error: string | null` \- Error message if validation failed, null otherwise

#### Usage Examples

**Basic Usage (Simple Data Structures):**

```ts
// src/app/hello-world/page.tsx
import { useRenderData } from "@/hooks/useRenderData";

interface HelloWorldData {
  message: string;
}

export default function HelloWorldPage() {
  const { data, isLoading, error } = useRenderData<HelloWorldData>();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return <div>{data.message}</div>;
}
```

**Production Usage (With Schema-Based Type Inference):**

```ts
// src/app/list-databases/page.tsx
import { z } from "zod";
import { ListDatabasesDataSchema } from "@lg-mcp-ui/core";
import { useRenderData } from "@/hooks/useRenderData";

// Use schema for type inference
type ListDatabasesRenderData = z.infer<typeof ListDatabasesDataSchema>;

export default function ListDatabasesPage() {
  // Schema is used for TypeScript type inference only
  // Validation happens in the component itself
  const { data, isLoading, error } = useRenderData<ListDatabasesRenderData>();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || !data.databases || data.databases.length === 0) {
    return <div>No databases available</div>;
  }

  // Component will validate props before rendering
  return <ListDatabases databases={data.databases} />;
}
```

### **Component-Level Validation**

#### Components validate their props using schemas imported from LeafyGreen MCP-UI. This provides a second layer of validation and ensures components only render with valid data.

#### **Example: Component with Validation**

```ts
// src/components/ListDatabases/ListDatabases.tsx
import { DatabaseInfoSchema } from "@lg-mcp-ui/core";
import { z } from "zod";

export interface ListDatabasesProps {
  databases: DatabaseInfo[];
}

export const ListDatabases = ({ databases }: ListDatabasesProps) => {
  // Validate props against schema
  const databasesArraySchema = z.array(DatabaseInfoSchema);
  const validationResult = databasesArraySchema.safeParse(databases);

  if (!validationResult.success) {
    console.error("[ListDatabases] Validation error:", validationResult.error);
    return (
      <div>
        <h1>Databases</h1>
        <div style={{ color: "red" }}>
          Validation Error:{" "}
          {validationResult.error.issues.map((e) => e.message).join(", ")}
        </div>
      </div>
    );
  }

  return <div>{/* Render validated data */}</div>;
};
```

#### Best Practices

**Schema Design:**

- **Centralized schemas**: All schemas are defined in LeafyGreen MCP-UI (`@lg-mcp-ui/core`) and exported for use in both package validation and component validation
- **Schema matches props**: Zod schemas validate the exact structure the component expects
- **No transformation layer**: MCP server data should match component props directly, eliminating the need for data transformation in the page component
- **Type from schema**: Use `z.infer<typeof Schema>` for TypeScript type inference

**Validation Strategy:**

- **Two-layer validation**:
  1. LeafyGreen MCP-UI validates at data source (`augmentWithUI`) before creating UI resources
  2. Components validate props before rendering
- **Shared schemas**: Schemas are exported from the package and reused across validation layers
- **Error handling**: Both layers handle validation errors gracefully, logging errors and displaying user-friendly error messages

#### TypeScript Support

The hook is fully typed and accepts a generic type parameter. Types can be inferred from schemas using `z.infer<>` or defined manually. Components import schemas from LeafyGreen MCP-UI for both validation and type inference.

### **Configuration**

The application requires permissive cross-origin headers to support iframe embedding from any MCP client:

```ts
// next.config.ts
headers: [
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors *",
  },
];
```

#### Rationale

MCP clients operate from diverse, unpredictable origins (Electron apps, browser extensions, variable localhost ports, etc.), making origin pre-registration infeasible. See [Security Architecture](#security-architecture) section for full security model and risk assessment.

#### Environment Variables

- `NEXT_PUBLIC_BASE_URL`: Base URL for the hosted application (used by LeafyGreen MCP-UI for iframe URL generation)
- `ALLOWED_ORIGINS` (optional): For enterprise deployments requiring origin restrictions

Hosting: [https://us-east-1.console.aws.amazon.com/amplify/apps](https://us-east-1.console.aws.amazon.com/amplify/apps)  
Amplify App: [https://us-east-1.console.aws.amazon.com/amplify/apps/d26xp5ggqwqo0y/overview](https://us-east-1.console.aws.amazon.com/amplify/apps/d26xp5ggqwqo0y/overview)

## Integration with MongoDB MCP Server

Integration of LeafyGreen MCP-UI with the MongoDB MCP Server occurs at the tool level, within each tool's `execute()` method. The integration follows a consistent pattern:

1. **Execute the tool operation** and obtain the raw result
2. **Transform raw data** into structured render data matching the tool's schema
3. **Augment the tool result** with UI using `augmentWithUI()`
4. **Return the augmented result** (or original result if augmentation fails)

### **Dependency Installation**

Add `@lg-mcp-ui/core` as a dependency to the MongoDB MCP Server:

```json
{
  "dependencies": {
    "@lg-mcp-ui/core": "^0.1.0"
  }
}
```

### **Integration Pattern**

The integration follows a consistent pattern across all tools:

```ts
import { augmentWithUI } from "@lg-mcp-ui/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

protected async execute(...args): Promise<CallToolResult> {
  // 1. Execute the tool operation
  const provider = await this.ensureConnected();
  const rawData = await provider.someOperation(...args);

  // 2. Transform raw data into structured render data
  const renderData = {
    // Transform raw MongoDB data to match schema
    // Example: map database objects to { name, size } format
  };

  // 3. Create base tool result
  const toolResult: CallToolResult = {
    content: formatUntrustedData(
      `Found ${rawData.length} items`,
      ...rawData.map((item) => `Name: ${item.name}`)
    ),
  };

  // 4. Augment with UI (non-blocking - failures return original result)
  try {
    return augmentWithUI(toolResult, {
      toolName: this.name,
      renderData,
    });
  } catch (error) {
    // Log error but return original result
    this.session.logger.warning({
      id: LogId.toolExecute,
      context: "tool",
      message: `Failed to augment ${this.name} with UI: ${error}`,
    });
    return toolResult;
  }
}
```

### **Key Integration Points**

#### 1\. **Data Transformation**

The tool must transform raw MongoDB data (which may include BSON types like `Long`, `ObjectId`, etc.) into plain JavaScript objects matching the Zod schema:

- **BSON Long** → `number` (use `.toNumber()`)
- **BSON ObjectId** → `string` (use `.toString()`)
- **BSON Date** → `string` (use `.toISOString()`)
- **Nested objects** → Flatten or structure according to schema

#### 2\. **Error Handling**

UI augmentation is **non-blocking** and **non-fatal**:

- If `augmentWithUI()` throws an error, the tool returns the original `CallToolResult` unchanged
- Errors are logged but do not prevent the tool from completing successfully
- This ensures backward compatibility and graceful degradation

#### 3\. **Schema Validation**

`augmentWithUI()` validates `renderData` against the tool's schema before creating the UI resource:

- If validation fails, the original `CallToolResult` is returned unchanged
- Validation errors are logged as warnings
- This ensures only valid data reaches the embeddable UI

#### 4\. **Tool Result Structure**

The augmented result preserves the original tool result content and appends the UI resource:

```ts
// Original result
{
  content: [
    { type: "text", text: "Found 3 databases" },
    { type: "text", text: "..." }
  ]
}

// Augmented result
{
  content: [
    { type: "text", text: "Found 3 databases" },
    { type: "text", text: "..." },
    {
      type: "resource",
      resource: {
        uri: "ui://list-databases/1234567890",
        content: {
          type: "externalUrl",
          iframeUrl: "https://mcp-ui-app.example.com/ListDatabases?waitForRenderData=true"
        },
        uiMetadata: {
          "initial-render-data": { databases: [...], totalCount: 3 }
        }
      }
    }
  ]
}
```

## Example Implementation: List Databases Embeddable UI

To demonstrate the complete flow and deliverable, here's a concrete example of an embeddable UI that renders a Card component displaying the results of the `list-databases` tool from the MongoDB MCP Server:

### **Tool Call and Augmentation**

```ts
// MongoDB MCP Server handles tool call
const toolResult: CallToolResult = {
  content: [
    {
      type: "text",
      text: JSON.stringify({
        databases: ["admin", "config", "local", "myDatabase"],
      }),
    },
  ],
};

// Augment with UI
const augmented = augmentWithUI(toolResult, {
  toolName: "list-databases",
});
```

### **Embeddable UI Component**

```ts
// mcp-ui/list-databases/src/ListDatabases
import React from "react";
import { Card } from "@leafygreen-ui/card";
import { H2, Body } from "@leafygreen-ui/typography";

import { ListDatabasesProps } from "./ListDatabases.types.ts";

export function ListDatabases({ databases }: ListDatabasesProps) {
  return (
    <Card>
      <H2>Databases</H2>
      {databases.length === 0 ? (
        <Body>No databases found</Body>
      ) : (
        <ul>
          {databases.map((dbName) => (
            <li key={dbName}>
              <Body>{dbName}</Body>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

```ts
// mcp-ui/list-databases/src/index.ts
export { ListDatabases } from "./ListDatabases";
export type { ListDatabasesProps } from "./ListDatabases.types";
```

### **`mcp-ui-app` Page**

```ts
// apps/mcp-ui-app/src/app/list-databases/page.tsx
import { z } from "zod";
import { ListDatabasesDataSchema } from "@lg-mcp-ui/core";
import { useRenderData } from "@/hooks/useRenderData";
import { ListDatabases } from "@/components/ListDatabases";

type ListDatabasesRenderData = z.infer<typeof ListDatabasesDataSchema>;

export default function ListDatabasesPage() {
  const { data, isLoading, error } = useRenderData<ListDatabasesRenderData>();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || !data.databases || data.databases.length === 0) {
    return <div>No databases available</div>;
  }

  // Component will validate props before rendering
  return <ListDatabases databases={data.databases} />;
}
```

### **Client Rendering**

_Note: This is on the MCP client that is making the request to the MCP server. This is just an example implementation of how that might look. It is not something we implement ourselves._

```ts
// In MCP client application
import { UIResourceRenderer } from "@mcp-ui/client";

function renderMCPSResponse(response: MCPSResponse) {
  return response.content.map((item, index) => {
    if (item.type === "resource" && item.resource.uri?.startsWith("ui://")) {
      return (
        <UIResourceRenderer
          key={index}
          resource={item.resource}
          onUIAction={(action) => {
            console.log("UI Action:", action);
            // Handle action (e.g., trigger another tool call)
          }}
        />
      );
    }
    // Render text content normally
    return <div key={index}>{item.text}</div>;
  });
}
```

This example demonstrates the complete end-to-end flow from tool call to rendered Card component in the client application.

# Security Architecture {#security-architecture}

## Threat Model

MCP-UI components operate as **stateless presentation layers** with a specific security model:

**Architecture Characteristics:**

- No database connections, API endpoints, or server-side state
- No authentication or authorization logic
- Communication exclusively via `postMessage` protocol
- All data operations require MCP server authentication

**Attack Surface:**

- **Information disclosure**: Malicious embedders can intercept `postMessage` data
- **Action compromise**: NOT possible \- intercepted data cannot be used for unauthorized operations (requires MCP server authentication)

**Trade-off**: Higher information disclosure risk, lower action compromise risk vs. traditional authenticated web apps.

## Permissive CORS Rationale

The permissive headers (`Access-Control-Allow-Origin: *`, `frame-ancestors *`) are **architecturally appropriate** rather than a security compromise:

1. **MCP client diversity**: Clients operate from unpredictable origins (Electron apps with `app://`, browser extensions with dynamic IDs, variable localhost ports, etc.)
2. **Open ecosystem model**: Pre-registration of allowed origins would require approval for every new MCP client, hindering adoption
3. **Stateless presentation layer**: UIs have no data without the MCP server/client setup, making unrestricted embedding low-risk

**Security model parallels LeafyGreen**: LeafyGreen components are publicly accessible yet safely render sensitive MongoDB data because the components themselves are data-less presentation wrappers. MCP-UI follows the same pattern.

## Architectural Constraints

**Critical Limitation**: MCP-UI components **should not be used for capturing authentication credentials** (passwords, API keys, OAuth secrets) due to `postMessage` interception risk.

**Safe for**: Operational data (database names, configuration settings, search queries) where information disclosure does not enable unauthorized actions.

**Rationale**: If credentials are intercepted via `postMessage`, they enable full compromise. Operational data interception only reveals information—the attacker still cannot perform actions without MCP server authentication.

**Implementation requirement**: MCP servers must validate that authentication happens server-side or at the MCP client level (outside iframes), never via embedded UI forms.

## Security Responsibilities by Component

| Component       | Security Responsibility                                                                                                |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **MCP Server**  | Authentication, authorization, input validation, credential storage                                                    |
| **MCP Client**  | Session management, origin validation (if needed), action mediation                                                    |
| **MCP-UI App**  | postMessage protocol validation (message type checking), data structure validation, XSS prevention when rendering data |
| **Embedded UI** | Data rendering only, no direct API calls or state storage                                                              |

# Development and Testing

## Overview

This section outlines the testing strategy and development workflow for LeafyGreen MCP-UI, covering both local development testing and production demo requirements.

## Development Testing Workflow

### **Storybook for Component Development**

Storybook is the primary development tool for testing embeddable UI components. It provides an isolated environment with MCP client simulation via a custom decorator that sends `postMessage` events.

**MCP Client Decorator:**

A custom decorator (`mcpClientDecorator`) simulates the MCP client's `postMessage` behavior. It listens for `ui-lifecycle-iframe-ready` messages and responds with `ui-lifecycle-iframe-render-data` containing mock render data. This allows components using `useRenderData()` to work in Storybook without a real MCP client.

**Implementation:**

The decorator must be implemented as a Storybook decorator function that:

1. **Sets up message listener**: Listens for `ui-lifecycle-iframe-ready` messages from the component
2. **Responds with render data**: Sends `ui-lifecycle-iframe-render-data` message containing mock data
3. **Handles cleanup**: Removes event listeners when the story unmounts
4. **Supports configuration**: Accepts render data as a parameter

**Usage in Stories:**

```ts
// ListDatabases.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { createMCPClientDecorator } from "../.storybook/decorators/mcpClientDecorator";
import ListDatabasesPage from "./ListDatabasesPage";

const meta: Meta<typeof ListDatabasesPage> = {
  title: "Pages/ListDatabases",
  component: ListDatabasesPage,
};

export default meta;
type Story = StoryObj<typeof ListDatabasesPage>;

// Story using useRenderData hook
export const Default: Story = {
  decorators: [
    createMCPClientDecorator({
      databases: [
        { name: "admin", size: 245760 },
        { name: "config", size: 73728 },
        { name: "local", size: 73728 },
      ],
      totalCount: 3,
    }),
  ],
};

// Story with empty data
export const Empty: Story = {
  decorators: [
    createMCPClientDecorator({
      databases: [],
      totalCount: 0,
    }),
  ],
};

// Story with single database
export const SingleDatabase: Story = {
  decorators: [
    createMCPClientDecorator({
      databases: [{ name: "myDatabase", size: 1024000 }],
      totalCount: 1,
    }),
  ],
};
```

**Writing Stories:**

- **Direct components** (with props): Write standard Storybook stories with `args`
- **Page components** (using `useRenderData`): Use `createMCPClientDecorator()` with mock render data matching your component's expected schema

## Production Demo Setup

### **Requirements**

Production demo requires:

1. **`@lg-mcp-ui/core`** published to npm and integrated into MongoDB MCP Server
2. **`mcp-ui-app`** deployed to a public URL (e.g., Vercel, AWS Amplify)
3. **MCP Client** that supports the mcp-ui specification (implements `UIResourceRenderer` from `@mcp-ui/client`)

Some investigation will need to be done to see if a known client has the mcp-ui spec fully implemented and to ultimately get it working. If there is none, we may need to build out own for demonstration purposes.

For more information on the current state of mcp-ui client support and ecosystem limitations, see [Current State of mcp-ui Ecosystem](#mcp-clients-with-mcp-ui-support).

**Testing Tool:**

For local development and testing, use [ui-inspector](https://github.com/idosal/ui-inspector), a dedicated testing tool for mcp-ui-enabled servers:

1. Clone and run ui-inspector locally
2. Connect to your local MCP server endpoint
3. Execute tools and verify UI rendering

**Building a Custom MCP Client:**

If we need to build a custom MCP client with mcp-ui support, use the `@mcp-ui/client` SDK:

For more details, see the [mcp-ui client documentation](https://mcpui.dev/guide/client/overview) and [React usage examples](https://mcpui.dev/guide/client/react-usage-examples).

### **Deployment Steps**

1. Deploy `mcp-ui-app` to public URL
2. Update `MCP_UI_APP_BASE_URL` in `augmentWithUI.ts` (or use environment variable)
3. Publish `@lg-mcp-ui/core` to npm
4. Integrate `@lg-mcp-ui/core` into MongoDB MCP Server
5. Connect MCP client (with mcp-ui support) to MongoDB MCP Server
6. Execute tools in chat interface and verify UI renders correctly

### **Demo Scenarios**

- **List Databases**: Execute `list-databases` → Display database list in Card component
- **Error Handling**: Invalid data → Graceful degradation (text-only response)

# Current State of mcp-ui Ecosystem

**Status**: The mcp-ui specification is still in early stages, and client support is limited and incomplete.

## Key Observations

1. **Limited Client Adoption**: Most LLM clients and MCP-compatible applications do not yet support mcp-ui rendering or UI actions.

2. **Incomplete Implementations**: Even among clients that claim mcp-ui support, implementations are often partial:

   - Many support basic rendering but lack full UI action support
   - Data passing mechanisms may vary between implementations
   - Some clients may not fully implement the postMessage protocol as specified

3. **Spec Evolution**: The mcp-ui specification itself is still evolving, which means:
   - Our implementation follows the spec as we understand it, but the spec may change
   - Client implementations may diverge from the spec as they adapt to their own needs
   - Future spec updates may require changes to our implementation

## Implications for LeafyGreen MCP-UI

- **Spec Compliance**: We are building to be spec-compliant based on the current mcp-ui specification and `@mcp-ui/client` SDK patterns, but cannot guarantee compatibility with all current or future client implementations.

- **Testing Challenges**: Limited client support makes comprehensive testing difficult. We rely on:

  - The `@mcp-ui/client` SDK as a reference implementation
  - Local testing tools like `ui-inspector`
  - Custom mock clients for development

- **Future Adaptability**: As the ecosystem matures and more clients implement mcp-ui support, we may need to:
  - Adjust our data passing assumptions (see [Client Data Passing Assumptions](#client-data-passing-assumptions))
  - Update implementation details to match actual client behavior
  - Add compatibility layers for different client implementations

## MCP Clients with mcp-ui Support {#mcp-clients-with-mcp-ui-support}

Several MCP-compatible clients support rendering mcp-ui resources. Feature support varies by client:

| Client                                                      | Rendering | UI Actions | Notes                                                                                                     |
| :---------------------------------------------------------- | :-------: | :--------: | :-------------------------------------------------------------------------------------------------------- |
| [Nanobot](https://www.nanobot.ai/)                          |    ✅     |     ✅     | Full support for rendering and UI actions                                                                 |
| [ChatGPT](https://chatgpt.com/)                             |    ✅     |     ⚠️     | Rendering supported; UI actions partially supported. See [mcp-ui guide](https://mcpui.dev/guide/apps-sdk) |
| [Postman](https://www.postman.com/)                         |    ✅     |     ⚠️     | Rendering supported; UI actions partially supported                                                       |
| [Goose](https://block.github.io/goose/)                     |    ✅     |     ⚠️     | Rendering supported; UI actions partially supported                                                       |
| [LibreChat](https://www.librechat.ai/)                      |    ✅     |     ⚠️     | Rendering supported; UI actions partially supported                                                       |
| [Smithery](https://smithery.ai/playground)                  |    ✅     |     ❌     | Rendering supported; UI actions not yet supported                                                         |
| [MCPJam](https://www.mcpjam.com/)                           |    ✅     |     ❌     | Rendering supported; UI actions not yet supported                                                         |
| [fast-agent](https://fast-agent.ai/mcp/mcp-ui/)             |    ✅     |     ❌     | Rendering supported; UI actions not yet supported                                                         |
| [VSCode](https://github.com/microsoft/vscode/issues/260218) |     ?     |     ?      | Support planned (TBA)                                                                                     |

**Legend:**

- ✅: Fully Supported
- ⚠️: Partially Supported
- ❌: Not Supported (yet)
- ?: Planned/Unknown

**Note**: This table reflects the current state of mcp-ui support as of the time of this document. Client support is evolving rapidly, and implementations may vary.

# Known Limitations

## Dark Mode Support

**Status**: Dark mode is **not supported** in the current implementation.

### **The Problem**

Embeddable UIs are rendered in cross-origin iframes, which creates fundamental constraints for theme detection:

1. **No access to parent window**: Iframes cannot access parent window styles or theme state due to cross-origin restrictions
2. **No control over host applications**: Host applications use `UIResourceRenderer` from `@mcp-ui/client` directly \- we cannot modify their code
3. **System preference detection causes hydration mismatches**: When using `prefers-color-scheme` media query, the server renders with one theme (typically light mode as a default), but the client immediately detects the user's system preference and switches to a different theme. This mismatch between server-rendered HTML and client-rendered content causes React hydration errors and inconsistent initial renders across different user environments (some users see a flash of light mode before switching to dark, others see the opposite)

### **Why We Can't Solve This Now**

Any solution that would enable dark mode would require one of the following:

- **Host app modifications**: Requiring host applications to implement theme communication (postMessage, URL parameters, etc.) is not viable since we have no control over host application code
- **Standardized protocol**: The mcp-ui specification does not currently define a standard way for host applications to communicate theme preferences to embedded UIs
- **Framework-level support**: There's no established pattern in the MCP-UI ecosystem for theme synchronization between host and embedded UIs

### **Current Implementation**

Embeddable UIs default to **light mode** to ensure:

- Consistent, predictable rendering across all host applications
- No hydration mismatches or rendering inconsistencies
- Zero configuration required from host applications

Until then, embeddable UIs will render in light mode only.

# Future Considerations

## Dark Mode Support

Dark mode support may become feasible if:

1. The mcp-ui specification defines a standard theme communication protocol
2. Host applications begin implementing theme communication in a consistent way
3. A framework-level solution emerges that doesn't require host app modifications

## External URL Registration

For the MVP, all tool-to-UI mappings are owned and managed internally by LeafyGreen MCP-UI. In the future, we may want to support registration of external URLs for teams that host their own embeddable UIs outside of the `mcp-ui-app` infrastructure.

**Potential Future API**:

```ts
// Future consideration - not in MVP
registerExternalToolMapping({
  toolName: "customAnalytics",
  externalUrl: "https://custom-analytics.example.com/dashboard",
});
```

This would allow:

- Teams to host embeddable UIs on their own infrastructure
- Custom domains and deployments
- Flexibility for teams with specific hosting requirements

**Considerations for Future Implementation**:

- Security validation of external URLs
- CORS and CSP considerations
- Validation and health checks
- Documentation and developer experience

# Tickets

TODO

# References

## MCP-UI Specification

- [MCP-UI Documentation](https://mcpui.dev/guide/introduction) \- Official mcp-ui specification and guides
- [MCP-UI GitHub Repository](https://github.com/idosal/mcp-ui) \- Reference implementation and examples
- [MCP-UI Protocol Details](https://mcpui.dev/guide/protocol-details) \- Detailed protocol specification
- [Embeddable UI Communication](https://mcpui.dev/guide/embeddable-ui) \- PostMessage protocol documentation

## Model Context Protocol

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) \- Official MCP specification
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) \- Official TypeScript SDK reference

## Related MongoDB Projects

- [MongoDB MCP Server](https://github.com/mongodb-js/mongodb-mcp-server) \- The MongoDB MCP server that will integrate LeafyGreen MCP-UI
- [LeafyGreen UI Design System](https://github.com/mongodb/leafygreen-ui) \- Design system components used in embeddable UIs

## Technical References

- [MDN: postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) \- Web API documentation for iframe communication
- [MDN: iframe sandbox attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) \- Security best practices for iframes
- [Next.js Documentation](https://nextjs.org/docs) \- Framework documentation for hosting application
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) \- Accessibility standards

## Similar Implementations

- [Shopify Remote DOM](https://github.com/Shopify/remote-dom) \- Similar concept of rendering server-defined UI with host components (referenced in mcp-ui spec)
- [Component Libraries with UIResourceRenderer](https://mcpui.dev/guide/client/custom-component-libraries) \- Example of custom component integration

## Internal References

- [Code Editor Technical Design](http://./packages/code-editor/TECHNICAL_DESIGN.md) \- Example technical design document from leafygreen-ui
- [MCP-UI: Architectural Design Doc](https://docs.google.com/document/d/1yLrS16lT37ttOTkBTbjNyhuinC_18jLdeIBL3aufUrg/edit?tab=t.0) \- Initial brainstorming doc

# Open Questions

- Subdomain
