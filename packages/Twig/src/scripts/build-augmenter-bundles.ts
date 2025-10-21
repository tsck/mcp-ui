import * as esbuild from "esbuild";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import stdLibBrowser from "node-stdlib-browser";
import {
  generateEntries,
  cleanupGeneratedEntries,
} from "../utils/entry-generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface EntryPoint {
  name: string;
  entryPath: string;
  outputDir: string;
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
  const microUIsDir = join(__dirname, "../microUIs");

  console.log("Generating entry points from components...\n");

  const entryPoints = generateEntries(microUIsDir);

  if (entryPoints.length === 0) {
    console.log("No components found. Nothing to build.");
    return;
  }

  console.log(`Found ${entryPoints.length} component(s):`);
  entryPoints.forEach((ep) => console.log(`  - ${ep.name}`));
  console.log("");

  const results = await Promise.all(
    entryPoints.map((entry) => buildBundle(entry))
  );

  const successCount = results.filter((r) => r).length;
  const failCount = results.length - successCount;

  console.log("\n" + "=".repeat(50));
  console.log(`Build complete: ${successCount} succeeded, ${failCount} failed`);

  // Clean up generated entry files
  console.log("\nCleaning up generated entry files...");
  cleanupGeneratedEntries(microUIsDir);

  if (failCount > 0) {
    process.exit(1);
  }
}

buildAllBundles();
