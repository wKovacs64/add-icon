import fs from 'node:fs';
import path from 'node:path';
import type { IconifyConfig } from './types.js';

/**
 * Default configuration
 */
export const defaultConfig: IconifyConfig = {
  outputDir: '.', // Current directory
};

/**
 * Loads configuration from file if it exists
 * @param configPath - Path to config file
 * @returns Configuration object
 */
export async function loadConfig(configPath?: string): Promise<IconifyConfig> {
  // If a specific config path is provided, use it
  if (configPath) {
    return await loadConfigFile(configPath);
  }

  // Try to find a config file in the current directory, checking both JS and TS
  const jsConfigPath = path.resolve(process.cwd(), 'add-icon.config.js');
  const tsConfigPath = path.resolve(process.cwd(), 'add-icon.config.ts');

  // Check for TypeScript config first
  if (fs.existsSync(tsConfigPath)) {
    return await loadTSConfigFile(tsConfigPath);
  }

  // Then check for JavaScript config
  if (fs.existsSync(jsConfigPath)) {
    return await loadConfigFile(jsConfigPath);
  }

  // Fall back to default config
  return defaultConfig;
}

/**
 * Loads a JavaScript config file
 * @param configPath - Path to JS config file
 * @returns Configuration object
 */
async function loadConfigFile(configPath: string): Promise<IconifyConfig> {
  try {
    // For ESM, we need to use dynamic import with file:// protocol
    const fileUrl = `file://${configPath}`;
    const config = await import(fileUrl);
    return { ...defaultConfig, ...config.default };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading config file: ${errorMessage}`);
    return defaultConfig;
  }
}

/**
 * Loads a TypeScript config file by transpiling it first
 * @param configPath - Path to TS config file
 * @returns Configuration object
 */
async function loadTSConfigFile(configPath: string): Promise<IconifyConfig> {
  try {
    // Create a temporary JS file for the TypeScript config
    const jsPath = configPath.replace(/\.ts$/, '.js');

    try {
      // Use TypeScript to compile the config file
      const { execSync } = await import('node:child_process');
      
      execSync(
        `npx tsc "${configPath}" --outDir "${path.dirname(configPath)}" --target es2020 --module NodeNext --moduleResolution NodeNext --esModuleInterop`,
        { stdio: 'ignore' }
      );

      // Load the compiled JS config
      const result = await loadConfigFile(jsPath);

      // Clean up the temporary JS file
      if (process.env.NODE_ENV !== 'development') {
        fs.unlinkSync(jsPath);
      }

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error transpiling TypeScript config: ${errorMessage}`);
      console.error('Make sure TypeScript is installed or use a JavaScript (.js) config file.');
      return defaultConfig;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading TypeScript config file: ${errorMessage}`);
    return defaultConfig;
  }
}
