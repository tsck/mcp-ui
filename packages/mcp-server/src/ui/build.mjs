import { build } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, "src");
const COMPONENTS_DIR = path.join(SOURCE_DIR, "components");
const OUTPUT_DIR = path.join(__dirname, "dist", "embeddable-uis");
const ENTRY_TEMPLATE_PATH = path.join(
  SOURCE_DIR,
  "component-entry-template.tsx"
);

/**
 * HTML wrapper template for embeddable UI components
 */
function createHTMLWrapper(componentJS, componentName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    #root { padding: 16px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    ${componentJS}
  </script>
</body>
</html>`;
}

/**
 * Generate entry point file for a component using the template
 */
async function generateEntryPoint(componentName, componentPath) {
  const templateContent = await fs.readFile(ENTRY_TEMPLATE_PATH, "utf-8");

  // Calculate relative path from temp dir to component file
  const tempDir = path.join(__dirname, ".temp");
  const relativePath = path
    .relative(tempDir, componentPath)
    .replace(/\\/g, "/");
  // Remove .tsx extension for import
  const importPath = relativePath.replace(/\.tsx$/, "");

  // Replace import path first
  let entryContent = templateContent.replace(
    /from ['"]\.\/components\/__COMPONENT_NAME__\/__COMPONENT_NAME__['"]/,
    `from '${importPath}'`
  );

  // Then replace component name placeholders
  entryContent = entryContent.replace(/__COMPONENT_NAME__/g, componentName);

  const tempEntryPath = path.join(tempDir, `${componentName}.entry.tsx`);
  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(tempEntryPath, entryContent, "utf-8");

  return tempEntryPath;
}

/**
 * Build a single component with Vite
 */
async function buildComponent(component) {
  const { name, path: componentPath } = component;

  try {
    // Generate entry point using template
    const entryPath = await generateEntryPoint(name, componentPath);

    // Build with Vite
    const result = await build({
      configFile: false,
      root: __dirname,
      mode: "production",
      plugins: [
        react({
          jsxImportSource: "@emotion/react",
          babel: {
            plugins: ["@emotion/babel-plugin"],
          },
        }),
        nodePolyfills({
          // Include specific polyfills
          include: ["buffer", "process", "stream"],
          globals: {
            Buffer: true,
            process: true,
          },
        }),
      ],
      build: {
        lib: {
          entry: entryPath,
          formats: ["es"],
          fileName: name,
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
            format: "es",
          },
          external: [], // Bundle everything including React
        },
        minify: "esbuild",
        write: false,
        target: "es2020",
      },
      resolve: {
        alias: {
          "@": SOURCE_DIR,
        },
      },
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "globalThis",
      },
    });

    // Handle both single RollupOutput and array of RollupOutput
    const outputs = Array.isArray(result) ? result : [result];

    // Extract JS from build output
    let jsContent = "";
    for (const rollupOutput of outputs) {
      if (rollupOutput.output && rollupOutput.output.length > 0) {
        for (const output of rollupOutput.output) {
          if (output.type === "chunk") {
            jsContent += output.code;
          }
        }
      }
    }

    if (!jsContent) {
      console.error(`✗ No output generated for ${name}`);
      return false;
    }

    // Wrap in HTML
    const html = createHTMLWrapper(jsContent, name);

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Write HTML file
    const outputPath = path.join(OUTPUT_DIR, `${name}.html`);
    await fs.writeFile(outputPath, html, "utf-8");

    console.log(`✓ Built ${name} → ${name}.html`);

    // Clean up temp entry file
    try {
      await fs.unlink(entryPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    return true;
  } catch (error) {
    console.error(`✗ Failed to build ${name}:`, error);
    return false;
  }
}

/**
 * Discover components in the components directory
 * Looks for ComponentName/ComponentName.tsx pattern
 */
async function discoverComponents() {
  const components = [];

  try {
    const entries = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const componentName = entry.name;
        const componentFile = path.join(
          COMPONENTS_DIR,
          componentName,
          `${componentName}.tsx`
        );

        try {
          await fs.access(componentFile);
          components.push({
            name: componentName,
            path: componentFile,
          });
        } catch (error) {
          console.warn(`Component file not found: ${componentFile}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading components directory: ${error.message}`);
  }

  return components;
}

/**
 * Update manifest.json with component mappings
 */
async function updateManifest(components) {
  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  const manifest = {};

  for (const component of components) {
    manifest[component.name] = {
      file: `${component.name}.html`,
      timestamp: new Date().toISOString(),
    };
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log("✓ Updated manifest.json");
}

/**
 * Main build function
 */
async function buildAll() {
  console.log("Discovering components...");
  const components = await discoverComponents();

  if (components.length === 0) {
    console.warn("No components found");
    return;
  }

  console.log(
    `Found ${components.length} component(s): ${components
      .map((c) => c.name)
      .join(", ")}`
  );

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Build each component
  const results = await Promise.all(
    components.map((component) => buildComponent(component))
  );

  const successCount = results.filter((r) => r).length;
  const failCount = results.filter((r) => !r).length;

  console.log(
    `\nBuild complete: ${successCount} succeeded, ${failCount} failed`
  );

  if (successCount > 0) {
    await updateManifest(components.filter((_, i) => results[i]));
  }
}

/**
 * Watch mode
 */
async function watch() {
  console.log("Starting watch mode...\n");

  const components = await discoverComponents();
  if (components.length === 0) {
    console.warn("No components found");
    return;
  }

  // Build all components first
  await buildAll();

  console.log("\n👁  Watching for changes...");
  console.log("Press Ctrl+C to stop\n");

  // Track watched files to avoid duplicates
  const watchedFiles = new Set();

  async function watchFile(filePath, description) {
    if (watchedFiles.has(filePath)) return;
    watchedFiles.add(filePath);

    try {
      await fs.access(filePath);
      fs.watch(filePath, async () => {
        console.log(
          `\n📝 File changed: ${
            description || path.relative(__dirname, filePath)
          }`
        );
        // Rebuild all components when any file changes
        await buildAll();
        console.log("\n👁  Watching for changes...");
      });
    } catch (error) {
      // File might not exist yet
    }
  }

  // Watch all component files
  for (const component of components) {
    await watchFile(component.path, `${component.name}/${component.name}.tsx`);

    // Watch styles file if it exists
    const stylesPath = path.join(
      path.dirname(component.path),
      `${component.name}.styles.ts`
    );
    await watchFile(
      stylesPath,
      `${component.name}/${component.name}.styles.ts`
    );
  }

  // Watch hooks directory
  const hooksDir = path.join(SOURCE_DIR, "hooks");
  try {
    const hookFiles = await fs.readdir(hooksDir);
    for (const file of hookFiles) {
      await watchFile(path.join(hooksDir, file), `hooks/${file}`);
    }
  } catch (error) {
    // Hooks directory might not exist
  }

  // Watch entry template
  await watchFile(ENTRY_TEMPLATE_PATH, "component-entry-template.tsx");
}

// CLI
const isWatch = process.argv.includes("--watch");

if (isWatch) {
  watch().catch((error) => {
    console.error("Watch error:", error);
    process.exit(1);
  });
} else {
  buildAll().catch((error) => {
    console.error("Build error:", error);
    process.exit(1);
  });
}
