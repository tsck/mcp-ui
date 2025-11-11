# MicroUIs

This directory contains micro UIs that transform tool results into interactive UI components.

## Creating a New MicroUI

Creating a new microUI is simple - just create a directory with your component, optional styles, and optional transform function.

### Example: Simple MicroUI (No Data)

**Directory structure:**

```
src/microUIs/myWidget/
  myWidget.tsx
  myWidget.styles.ts  (optional)
```

**Component file:**

```typescript
// src/microUIs/myWidget/myWidget.tsx
/** @jsxImportSource @emotion/react */
import { Card } from "@leafygreen-ui/card";
import { H1 } from "@leafygreen-ui/typography";
import * as styles from "./myWidget.styles";

export const MyWidget = () => (
  <Card>
    <div css={styles.container}>
      <H1>My Widget</H1>
    </div>
  </Card>
);
```

**Styles file (optional):**

```typescript
// src/microUIs/myWidget/myWidget.styles.ts
import { css } from "@emotion/react";

export const container = css`
  padding: 24px;
  background-color: #f5f5f5;
`;
```

### Example: Data-Driven MicroUI

**Directory structure:**

```
src/microUIs/myChart/
  myChart.tsx
  myChart.styles.ts     (optional)
  myChart.transform.ts  (if you need data transformation)
```

**Component file:**

```typescript
// src/microUIs/myChart/myChart.tsx
/** @jsxImportSource @emotion/react */
import { Chart, Line } from "@lg-charts/core";

interface MyChartProps {
  data: Array<{ x: number; y: number }>;
}

export const MyChart = ({ data }: MyChartProps) => (
  <Chart>
    <Line data={data} />
  </Chart>
);
```

**Transform file (optional):**

```typescript
// src/microUIs/myChart/myChart.transform.ts
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const transformData = (toolResult: CallToolResult) => {
  const data = JSON.parse(toolResult.content[0].text as string);
  return { data };
};
```

### Styling with Emotion

All microUIs use [Emotion](https://emotion.sh/) for styling:

1. **Add the JSX pragma** at the top of your component file:

   ```typescript
   /** @jsxImportSource @emotion/react */
   ```

2. **Create a styles file** using Emotion's `css` function:

   ```typescript
   import { css } from "@emotion/react";

   export const myStyle = css`
     color: blue;
     padding: 10px;
   `;
   ```

3. **Import and use** in your component:

   ```typescript
   import * as styles from "./myComponent.styles";

   <div css={styles.myStyle}>Styled content</div>;
   ```

**Benefits of Emotion:**

- ✅ Type-safe styles with TypeScript
- ✅ Automatic bundling (no separate CSS files)
- ✅ Dynamic styles based on props
- ✅ Better co-location of styles with components

## Registering Your MicroUI

Register your microUI in `/packages/Twig/index.ts`:

```typescript
import { transformData as myChartTransform } from "./src/microUIs/myChart/myChart.transform.js";

const registry = createAugmenterRegistry().register({
  uri: "data://my-chart", // URI to match from tool results
  bundleName: "myChart", // Bundle name (matches directory/component name)
  transformData: myChartTransform, // Optional: transform function
});
```

**Important:**

- `bundleName` should match your directory name (e.g., `myChart/` → `bundleName: "myChart"`)
- Do NOT import the component file in `index.ts` as it contains browser-only libraries
- Only import the `.transform.ts` file if you need data transformation

## Building

Run the build script to generate bundles:

```bash
npm run build
```

This will:

1. Discover all microUI directories (looks for `dirName/dirName.tsx` pattern)
2. Generate temporary entry files with React rendering boilerplate
3. Bundle each component with esbuild (includes Emotion and all styles)
4. Output bundles to `src/bundles/` directory
5. Clean up temporary files

## How It Works

1. **Build Time**: The build script discovers your component files and creates self-contained JavaScript bundles.

2. **Runtime**: When a tool result matches a registered URI, the microUI utility:
   - Loads the pre-built bundles from disk
   - Transforms the tool result data using your `transformData` function (if provided)
   - Generates an HTML document with embedded bundles
   - Returns a UI resource that can be rendered by the MCP client

## File Structure

```
src/
  ├── bundles/                        # Generated bundles (git-ignored)
  │   ├── clusterMetrics-bundle.js    # JS + Emotion styles bundled together
  │   └── helloWorld-bundle.js        # JS + Emotion styles bundled together
  └── microUIs/
      ├── clusterMetrics/
      │   ├── clusterMetrics.tsx          # Component (browser-only)
      │   ├── clusterMetrics.styles.ts    # Emotion styles (optional)
      │   └── clusterMetrics.transform.ts # Data transform (server-side)
      └── helloWorld/
          ├── helloWorld.tsx              # Component (browser-only)
          └── helloWorld.styles.ts        # Emotion styles (optional)
```

**Note:** Emotion styles are injected directly into the JavaScript bundle, so there are no separate CSS files generated or loaded.

## Benefits

- **Minimal boilerplate**: Just write React components
- **Type-safe**: Full TypeScript support
- **Self-contained**: Each bundle is standalone with all dependencies
- **Cached**: Bundles are loaded once and cached in memory
- **Easy to maintain**: Clear separation of concerns
