import path from 'node:path';
import { Command } from 'commander';
import { downloadIcon } from './iconify.js';
import { loadConfig } from './config.js';
import { importModule } from './import-module.js';
import { getPackageInfo } from './package-info.js';
import type { TransformFunction, TransformArgs, Config } from './types.js';

// Re-export types for easy importing by users
export type { TransformFunction, TransformArgs, Config };
// Re-export other useful functions
export { downloadIcon, parseIconReference } from './iconify.js';
export { loadConfig, defaultConfig } from './config.js';
// Create CLI program
const program = new Command();

// Set up the program with package info
const setupProgram = async (): Promise<Command> => {
  const { name, version, description } = await getPackageInfo();

  return program
    .name(name.split('/').pop() || name)
    .description(description)
    .option('--init', 'Generate a config file in the current directory')
    .option('-o, --output-dir <dir>', 'Directory to save icons')
    .option('-c, --config <path>', 'Path to config file')
    .option('-t, --transform <path>', 'Path to custom transform module (.js or .ts)')
    .version(version, '-v, --version', 'Output the current version')
    .argument('[icons...]', 'Icon references (e.g., heroicons:arrow-up-circle mdi:home)');
};

// Initialize the program
const initializedProgram = await setupProgram();

initializedProgram.action(
  async (
    icons: string[],
    options: {
      init?: boolean;
      outputDir?: string;
      config?: string;
      transform?: string;
    },
  ) => {
    try {
      // Validate that icons are provided when not using --init
      if (!options.init && (!icons || icons.length === 0)) {
        console.error('Error: At least one icon reference is required.');
        program.help();
        return;
      }

      // Handle --init flag to generate a config file
      if (options.init) {
        const fs = await import('node:fs/promises');
        const configFileContent = `import type { Config } from '@wkovacs64/add-icon';

const config = {
  outputDir: 'app/assets/svg-icons',
} satisfies Config;

export default config;
`;
        try {
          const configFilePath = path.resolve(process.cwd(), 'add-icon.config.ts');
          await fs.writeFile(configFilePath, configFileContent, 'utf-8');
          console.log(`✓ Configuration file created at: ${configFilePath}`);
          process.exit(0);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error creating config file: ${errorMessage}`);
          process.exit(1);
        }
      }

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

      // Download all icons
      const results = [];
      for (const icon of icons) {
        console.log(`Downloading icon: ${icon}...`);
        try {
          const savedPath = await downloadIcon(icon, config);
          console.log(`✓ Icon saved to: ${savedPath}`);
          results.push({ icon, path: savedPath, success: true });
        } catch (iconError: unknown) {
          const errorMessage = iconError instanceof Error ? iconError.message : String(iconError);
          console.error(`Error downloading ${icon}: ${errorMessage}`);
          results.push({ icon, error: errorMessage, success: false });
        }
      }

      // Report summary if multiple icons
      if (icons.length > 1) {
        const successful = results.filter((r) => r.success).length;
        console.log(`\nSummary: Downloaded ${successful}/${icons.length} icons`);

        // If any failed, exit with error
        if (successful < icons.length) {
          process.exit(1);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  },
);

// Parse command line arguments if called directly
export function runCli(): void {
  program.parse(process.argv);
}
