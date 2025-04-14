import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
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
 * Loads a TypeScript config file
 * @param configPath - Path to TS config file
 * @returns Configuration object
 */
async function loadTSConfigFile(configPath: string): Promise<IconifyConfig> {
  try {
    // Create a message to explain TS usage
    console.log('Loading TypeScript config file...');
    
    // Compile the file first - this approach doesn't rely on runtime transpilation
    try {
      // Use the tsx command line tool to compile the TypeScript file
      const jsPath = configPath.replace(/\.ts$/, '.js');
      
      // Execute tsx to transform the TS file to JS
      const { execSync } = await import('node:child_process');
      execSync(`npx tsx ${configPath} --out-file ${jsPath}`);
      
      // Now we can safely import the compiled JS file
      const absolutePath = path.resolve(jsPath);
      const fileUrl = pathToFileURL(absolutePath).toString();
      
      // Import the compiled JS
      const config = await import(fileUrl);
      
      // Clean up temporary file
      fs.unlinkSync(jsPath);
      
      return { ...defaultConfig, ...config.default };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error compiling TypeScript config: ${errorMessage}`);
      console.error('Make sure tsx is installed correctly or use a JavaScript (.js) config file.');
      return defaultConfig;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading TypeScript config file: ${errorMessage}`);
    return defaultConfig;
  }
}
