#!/usr/bin/env node

import path from 'node:path';
import url from 'node:url';
import os from 'node:os';
import { Command } from 'commander';
import { downloadIcon } from './iconify.js';
import { loadConfig } from './config.js';
import { importModule } from './import-module.js';
import { getPackageInfo } from './package-info.js';
import type { IconTransform, TransformArgs } from './types.js';

// Re-export types for easy importing by users
export type { IconTransform, TransformArgs };
// Re-export other useful functions
export { downloadIcon, parseIconReference } from './iconify.js';
// Create CLI program
const program = new Command();

// Set up the program with package info
const setupProgram = async (): Promise<Command> => {
  const { name, version, description } = await getPackageInfo();
  
  return program
    .name(name.split('/').pop() || 'add-icon') // Remove scope from name if present
    .description(description)
    .version(version)
    .argument('<icon>', 'Icon reference (e.g., heroicons:arrow-up-circle)')
    .option('-o, --output-dir <dir>', 'Directory to save icon')
    .option('-c, --config <path>', 'Path to config file')
    .option('-t, --transform <path>', 'Path to custom transform module (.js or .ts)');
};

// Initialize the program
const initializedProgram = await setupProgram();

initializedProgram.action(async (icon: string, options: { 
  outputDir?: string; 
  config?: string; 
  transform?: string;
}) => {
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

          try {
            // Use unified import method for both JS and TS files
            customTransform = await importModule(transformPath);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`Error loading transform: ${errorMessage}`);
            process.exit(1);
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
  program.parse(process.argv);
}
