import * as esbuild from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import stdLibBrowser from 'node-stdlib-browser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildChartBundle() {
  try {
    console.log('Building chart bundle...');
    
    const result = await esbuild.build({
      entryPoints: [join(__dirname, '../Twig/bundles/chart-entry.tsx')],
      bundle: true,
      outfile: join(__dirname, '../Twig/bundles/chart-bundle.js'),
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      jsx: 'automatic',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.css': 'css',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'global': 'globalThis',
      },
      inject: [join(__dirname, 'polyfills.js')],
      alias: stdLibBrowser,
    });

    console.log('✓ Chart bundle built successfully');
    
    if (result.warnings.length > 0) {
      console.warn('Warnings:', result.warnings);
    }
  } catch (error) {
    console.error('Failed to build chart bundle:', error);
    process.exit(1);
  }
}

buildChartBundle();

