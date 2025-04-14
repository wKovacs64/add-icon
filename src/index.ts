#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { downloadIcon } from './iconify.js';
import { loadConfig } from './config.js';
import { importTsModule } from './import-ts-module.js';
import type { IconTransform, TransformArgs } from './types.js';

// Re-export types for easy importing by users
export type { IconTransform, TransformArgs };
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
  .option('-t, --transform <path>', 'Path to custom transform module (.js or .ts)')
  .action(async (icon, options) => {
    try {
      // Load config (first from config file, then override with CLI options)
      const config = await loadConfig(options.config);

      // Override output directory if specified in CLI
      if (options.outputDir) {
        config.outputDir = options.outputDir;
      }

      // Load custom transform if specified
      if (options.transform) {
        try {
          const transformPath = path.resolve(process.cwd(), options.transform);
          let customTransform;

          if (transformPath.endsWith('.ts')) {
            try {
              // For TypeScript files, use in-memory transpilation with esbuild
              customTransform = await importTsModule(transformPath);
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              console.error(`Error loading TypeScript transform: ${errorMessage}`);
              process.exit(1);
            }
          } else {
            // For JavaScript files, use standard dynamic import
            const fileUrl = pathToFileURL(path.resolve(transformPath)).toString();
            customTransform = await import(fileUrl);
          }

          if (customTransform && typeof customTransform.default === 'function') {
            config.transforms = [customTransform.default];
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

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This logic only runs when executed directly as CLI, not when imported as a library
if (
  os.platform() === 'win32'
    ? process.argv[1] === __filename
    : process.argv[1] === __filename || process.argv[1] === __dirname
) {
  // Parse command line arguments
  program.parse();
}
