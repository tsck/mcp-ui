import * as esbuild from "esbuild";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync, existsSync } from "fs";
import stdLibBrowser from "node-stdlib-browser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface EntryPoint {
  name: string;
  entryPath: string;
  outputDir: string;
  cssPath?: string;
}

function discoverEntryPoints(): EntryPoint[] {
  const augmentersDir = join(__dirname, "../augmenters");
  const entryPoints: EntryPoint[] = [];

  try {
    const augmenters = readdirSync(augmentersDir);

    for (const augmenter of augmenters) {
      const augmenterPath = join(augmentersDir, augmenter);

      // Skip if not a directory
      if (!statSync(augmenterPath).isDirectory()) {
        continue;
      }

      // Look for *-entry.tsx file
      const entryFile = `${augmenter}-entry.tsx`;
      const entryPath = join(augmenterPath, entryFile);

      if (existsSync(entryPath)) {
        const outputDir = join(augmenterPath, "bundles");
        const cssPath = join(augmenterPath, `${augmenter}-entry.css`);

        entryPoints.push({
          name: augmenter,
          entryPath,
          outputDir,
          cssPath: existsSync(cssPath) ? cssPath : undefined,
        });
      }
    }
  } catch (error) {
    console.error("Error discovering entry points:", error);
  }

  return entryPoints;
}

async function buildBundle(entry: EntryPoint) {
  try {
    console.log(`Building ${entry.name} bundle...`);

    const result = await esbuild.build({
      entryPoints: [entry.entryPath],
      bundle: true,
      outfile: join(entry.outputDir, `${entry.name}-bundle.js`),
      format: "iife",
      platform: "browser",
      target: "es2020",
      minify: true,
      jsx: "automatic",
      loader: {
        ".tsx": "tsx",
        ".ts": "ts",
        ".css": "css",
      },
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "globalThis",
      },
      inject: [join(__dirname, "polyfills.js")],
      alias: stdLibBrowser,
    });

    console.log(`✓ ${entry.name}-bundle.js built successfully`);

    if (result.warnings.length > 0) {
      console.warn(`Warnings for ${entry.name}:`, result.warnings);
    }

    return true;
  } catch (error) {
    console.error(`Failed to build ${entry.name} bundle:`, error);
    return false;
  }
}

async function buildAllBundles() {
  console.log("Discovering augmenter entry points...\n");

  const entryPoints = discoverEntryPoints();

  if (entryPoints.length === 0) {
    console.log("No entry points found. Nothing to build.");
    return;
  }

  console.log(`Found ${entryPoints.length} entry point(s):`);
  entryPoints.forEach((ep) => console.log(`  - ${ep.name}`));
  console.log("");

  const results = await Promise.all(
    entryPoints.map((entry) => buildBundle(entry))
  );

  const successCount = results.filter((r) => r).length;
  const failCount = results.length - successCount;

  console.log("\n" + "=".repeat(50));
  console.log(`Build complete: ${successCount} succeeded, ${failCount} failed`);

  if (failCount > 0) {
    process.exit(1);
  }
}

buildAllBundles();
