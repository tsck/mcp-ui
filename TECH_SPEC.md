# **WIP** LeafyGreen MCP-UI SDK

Author: [Terrence Keane](mailto:terrence.keane@mongodb.com)  
Date:

# LGTMs

| Reviewer | Status (✅/🚧/⛔) |
| :------- | :---------------- |
| TBD      | 🚧                |
| TBD      | 🚧                |
| TBD      | 🚧                |
| TBD      | 🚧                |

# Glossary

TODO

# Goals

The output of this project will be:

1. **A working SDK** (`@lg-mcp-ui/sdk`) that can augment MongoDB MCP Server tool responses with UI resources
2. **An example implementation** demonstrating the SDK working with the MongoDB MCP Server, rendering UI that displays the results of the `list-databases` tool.

The example will showcase the complete end-to-end flow:

- MongoDB MCP Server executes `list-databases` tool
- SDK augments the response with a UIResource pointing to an embeddable UI
- Embeddable UI renders a Card component displaying the list of databases
- Client application renders the UI pointed to in the UIResource in a sandboxed iframe

# MCP Flowchart

[![][image1]](https://lucid.app/lucidchart/921ca29e-6713-444c-bd61-96f39f496a6c/edit?=&page=1&v=6356&s=612&referringApp=google%20docs)

# Architecture

The MCP-UI SDK project will be structured as a monorepo workspace within the `leafygreen-ui` repository, following the existing package structure conventions. The project consists of three main components:

## Package Exports

### **`@lg-mcp-ui/sdk`**

The main SDK package exports the core `augmentWithUI()` function and types:

```ts
export { augmentWithUI } from "@lg-mcp-ui/sdk";
export type { AugmentWithUIOptions, UIResourceMetadata } from "@lg-mcp-ui/sdk";
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

  mcp-ui-sdk/                # SDK package (@lg-mcp-ui/sdk)
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

## SDK Implementation (`@lg-mcp-ui/sdk`)

### **Schema Definitions**

All Zod schemas for tool render data are defined in `src/schemas.ts` and exported from the SDK. This centralizes schema definitions and ensures consistency between validation at the data source and component level.

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

The primary entry point for the SDK. This function takes a `CallToolResult` and augments it with a `UIResource` if a corresponding embeddable UI exists for the tool call.

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

The SDK validates `renderData` against the schema defined for each tool before creating the UI resource. This ensures data integrity at the source:

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
The SDK internally uses `@mcp-ui/server`'s `createUIResource` function.

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

// SDK validates renderData against ListDatabasesDataSchema
// SDK creates UIResource with validated renderData
const uiResource = createUIResource({
  uri: `ui://list-databases/${Date.now()}`,
  content: {
    type: "externalUrl",
    iframeUrl:
      "https://mcp-ui-mcp-ui-app.vercel.app/ListDatabases?waitForRenderData=true",
  },
  encoding: "text",
  uiMetadata: {
    "initial-render-data": renderData,
  },
});
```

### **UI Metadata and Communication Protocol**

Embeddable UIs communicate bidirectionally with the parent MCP client via the `postMessage` protocol as defined in the [mcp-ui embeddable UI specification](https://mcpui.dev/guide/embeddable-ui#message-types).

#### Read Flow (Data Display)

When an embeddable UI needs to display data:

1. MCP server extracts and transforms tool result into structured render data
2. MCP server calls `augmentWithUI()` with the render data
3. **SDK validates renderData against schema** (if schema exists for the tool)
4. SDK creates `UIResource` with validated render data embedded in `uiMetadata['initial-render-data']`
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
7. **SDK validates renderData against schema** before creating UI resource
8. Client extracts render data and sends it back to iframe via read flow above
9. **Component validates props against schema** before rendering

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

1. **Data source** (`augmentWithUI` in SDK) \- validates `renderData` before creating UI resources
2. **Component level** \- components validate their props using schemas imported from the SDK

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
import { ListDatabasesDataSchema } from "@lg-mcp/mcp-ui-sdk";
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

#### Components validate their props using schemas imported from the SDK. This provides a second layer of validation and ensures components only render with valid data.

#### **Example: Component with Validation**

```ts
// src/components/ListDatabases/ListDatabases.tsx
import { DatabaseInfoSchema } from "@lg-mcp/mcp-ui-sdk";
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

- **Centralized schemas**: All schemas are defined in the SDK (`@lg-mcp-ui/mcp-ui-sdk`) and exported for use in both SDK validation and component validation
- **Schema matches props**: Zod schemas validate the exact structure the component expects
- **No transformation layer**: MCP server data should match component props directly, eliminating the need for data transformation in the page component
- **Type from schema**: Use `z.infer<typeof Schema>` for TypeScript type inference

**Validation Strategy:**

- **Two-layer validation**:
  1. SDK validates at data source (`augmentWithUI`) before creating UI resources
  2. Components validate props before rendering
- **Shared schemas**: Schemas are exported from the SDK and reused across validation layers
- **Error handling**: Both layers handle validation errors gracefully, logging errors and displaying user-friendly error messages

#### TypeScript Support

The hook is fully typed and accepts a generic type parameter. Types can be inferred from schemas using `z.infer<>` or defined manually. Components import schemas from the SDK for both validation and type inference.

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

- `NEXT_PUBLIC_BASE_URL`: Base URL for the hosted application (used by SDK for iframe URL generation)
- `ALLOWED_ORIGINS` (optional): For enterprise deployments requiring origin restrictions

Hosting: [https://us-east-1.console.aws.amazon.com/amplify/apps](https://us-east-1.console.aws.amazon.com/amplify/apps)  
Amplify App: [https://us-east-1.console.aws.amazon.com/amplify/apps/d26xp5ggqwqo0y/overview](https://us-east-1.console.aws.amazon.com/amplify/apps/d26xp5ggqwqo0y/overview)

## Integration with MongoDB MCP Server

TODO

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
import { ListDatabasesDataSchema } from "@lg-mcp-ui/mcp-ui-sdk";
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

# TODO

# Future Considerations

## External URL Registration

For the MVP, all tool-to-UI mappings are owned and managed internally by the SDK. In the future, we may want to support registration of external URLs for teams that host their own embeddable UIs outside of the `mcp-ui-app` infrastructure.

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

- [MongoDB MCP Server](https://github.com/mongodb-js/mongodb-mcp-server) \- The MongoDB MCP server that will integrate this SDK
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
- What’s the difference between a Micro UI component and a regular React component package?
  - From my understanding, micro UIs will be static UIs (defined in this article: [https://www.copilotkit.ai/blog/the-three-kinds-of-generative-ui](https://www.copilotkit.ai/blog/the-three-kinds-of-generative-ui) )
- TK: What does the actual MDB MPC server response look like?
  - TK: Will mapping to toolname make sense or should it map to something else
- TK: How do we handle darkmode?
- TK: What are the specific CORS considerations that are needed? Is it ok from a security standpoint?
- TK: What’s the best location in the MCP Server to proxy responses?
- Is this actually an “SDK”

# TK TODO:

- Add section about assumptions in how data gets passed on the client
- Add section about current state \- most LLMs don’t support mcp-ui, and those that do are mostly incomplete
