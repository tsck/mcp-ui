import {
  readdirSync,
  statSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from "fs";
import { join, dirname, basename } from "path";

interface ComponentInfo {
  name: string;
  componentPath: string;
}

interface GeneratedEntry {
  name: string;
  entryPath: string;
  outputDir: string;
}

/**
 * Converts component name to bundle name format
 * e.g., ClusterMetrics -> clusterMetrics, HelloWorld -> helloWorld
 */
function componentNameToBundleName(componentName: string): string {
  return componentName.charAt(0).toLowerCase() + componentName.slice(1);
}

/**
 * Discover component files in the augmenters directory (searches subdirectories)
 */
export function discoverComponents(augmentersDir: string): ComponentInfo[] {
  const components: ComponentInfo[] = [];

  try {
    const entries = readdirSync(augmentersDir);

    for (const entry of entries) {
      const entryPath = join(augmentersDir, entry);
      const stat = statSync(entryPath);

      // Skip non-directories and the bundles directory
      if (!stat.isDirectory() || entry === "bundles") {
        continue;
      }

      // Look for a component file matching the directory name
      const componentFile = `${entry}.tsx`;
      const componentPath = join(entryPath, componentFile);

      if (existsSync(componentPath)) {
        // Component name is PascalCase version of directory name
        const componentName = entry.charAt(0).toUpperCase() + entry.slice(1);

        components.push({
          name: componentName,
          componentPath,
        });
      }
    }
  } catch (error) {
    console.error("Error discovering components:", error);
  }

  return components;
}

/**
 * Generate entry file for a component
 */
export function generateEntryFile(
  component: ComponentInfo,
  outputPath: string
): void {
  const bundleName = componentNameToBundleName(component.name);
  const renderFunctionName = `render${component.name}`;

  // Get the relative path from the generated entry to the component
  const componentDir = dirname(component.componentPath);
  const componentFileName = basename(component.componentPath, ".tsx");

  // Generate the entry file content
  const content = `import React from "react";
import { createRoot } from "react-dom/client";
import { ${component.name} } from "${componentDir}/${componentFileName}";

// Expose a global function to render the component
declare global {
  interface Window {
    ${renderFunctionName}: (containerId: string, props?: any) => void;
  }
}

window.${renderFunctionName} = (containerId: string, props?: any) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(\`Container with id "\${containerId}" not found\`);
    return;
  }

  const root = createRoot(container);
  root.render(<${component.name} {...props} />);
};
`;

  writeFileSync(outputPath, content, "utf-8");
}

/**
 * Generate all entry files and return entry points for building
 */
export function generateEntries(augmentersDir: string): GeneratedEntry[] {
  const components = discoverComponents(augmentersDir);
  const entries: GeneratedEntry[] = [];

  // Create bundles directory if it doesn't exist
  const bundlesDir = join(augmentersDir, "bundles");
  if (!existsSync(bundlesDir)) {
    mkdirSync(bundlesDir, { recursive: true });
  }

  for (const component of components) {
    const bundleName = componentNameToBundleName(component.name);
    const entryPath = join(augmentersDir, `${bundleName}-entry.generated.tsx`);

    // Generate the entry file
    generateEntryFile(component, entryPath);

    entries.push({
      name: bundleName,
      entryPath,
      outputDir: bundlesDir,
    });
  }

  return entries;
}

/**
 * Clean up generated entry files
 */
export function cleanupGeneratedEntries(augmentersDir: string): void {
  try {
    const files = readdirSync(augmentersDir);

    for (const file of files) {
      if (file.endsWith("-entry.generated.tsx")) {
        const filePath = join(augmentersDir, file);
        try {
          unlinkSync(filePath);
        } catch (error) {
          console.warn(`Failed to delete ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error cleaning up generated entries:", error);
  }
}
