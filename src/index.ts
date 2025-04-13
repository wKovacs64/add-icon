#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { Command } from 'commander';
import { downloadIcon } from './iconify.js';
import { loadConfig } from './config.js';
import type { IconTransform, TransformArgs } from './types.js';
import * as defaultTransforms from './transforms.js';

// Re-export types for easy importing by users
export type { IconTransform, TransformArgs };
// Re-export transforms for easy importing by users
export { defaultTransforms as transforms };
// Re-export other useful functions
export { downloadIcon, parseIconReference } from './iconify.js';

// Create CLI program
const program = new Command();

program
  .name('add-icon')
  .description('Download and transform icons from Iconify')
  .version('1.0.0')
  .argument('<icon>', 'Icon reference (e.g., heroicons:arrow-up-circle)')
  .option('-o, --output-dir <dir>', 'Directory to save icon')
  .option('-c, --config <path>', 'Path to config file')
  .option('--remove-size', 'Remove width and height attributes')
  .option('--optimize', 'Optimize SVG with SVGO')
  .option('--minify', 'Minify SVG by removing whitespace')
  .option('-t, --transform <path>', 'Path to custom transform module (.js or .ts)')
  .action(async (icon, options) => {
    try {
      // Load config (first from config file, then override with CLI options)
      const config = await loadConfig(options.config);

      // Override output directory if specified in CLI
      if (options.outputDir) {
        config.outputDir = options.outputDir;
      }

      // Prepare transforms array
      const transforms: IconTransform[] = [];

      // Add requested built-in transforms
      if (options.removeSize) {
        transforms.push(defaultTransforms.removeSize);
      }

      if (options.optimize) {
        transforms.push(defaultTransforms.optimizeSvg);
      }

      if (options.minify) {
        transforms.push(defaultTransforms.minifySvg);
      }

      // Load custom transform if specified
      if (options.transform) {
        try {
          const transformPath = path.resolve(process.cwd(), options.transform);
          let customTransform;

          // Handle TypeScript files
          if (transformPath.endsWith('.ts')) {
            // Create a temporary JS file for the transform
            const jsPath = transformPath.replace(/\.ts$/, '.js');

            try {
              // Use tsc to compile the TypeScript file
              execSync(
                `npx tsc "${transformPath}" --outDir "${path.dirname(transformPath)}" --target es2020 --module NodeNext --moduleResolution NodeNext --esModuleInterop`,
              );

              // Import the compiled JS file
              customTransform = await import(`file://${jsPath}`);

              // Clean up temporary JS file if not in dev mode
              if (process.env.NODE_ENV !== 'development') {
                fs.unlinkSync(jsPath);
              }
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              console.error(`Error transpiling TypeScript transform: ${errorMessage}`);
              console.error(
                'Make sure TypeScript is installed or use a JavaScript (.js) transform file.',
              );
              process.exit(1);
            }
          } else {
            // For JavaScript files, use dynamic import
            customTransform = await import(`file://${transformPath}`);
          }

          if (customTransform && typeof customTransform.default === 'function') {
            transforms.push(customTransform.default);
          } else {
            console.error('Custom transform must export a default function');
            process.exit(1);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Failed to load custom transform: ${errorMessage}`);
          process.exit(1);
        }
      }

      // Add transforms to config
      if (transforms.length > 0) {
        config.transforms = transforms;
      }

      // Download the icon
      console.log(`Downloading icon: ${icon}...`);
      const savedPath = await downloadIcon(icon, config);
      console.log(`✓ Icon saved to: ${savedPath}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// This logic only runs when executed directly as CLI,
// not when imported as a library
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments
  program.parse();
}
