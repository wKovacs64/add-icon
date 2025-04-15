import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Config } from './types.js';
import { importModule } from './import-module.js';

/**
 * Default configuration
 */
export const defaultConfig: Config = {
  outputDir: '.', // Current directory
};

/**
 * Loads configuration from file if it exists
 * @param configPath - Path to config file
 * @returns Configuration object
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  try {
    // If a specific config path is provided, use it
    if (configPath) {
      // Use the unified import method for both JS and TS files
      const config = await importModule(configPath);
      return { ...defaultConfig, ...config.default };
    }

    // Try to find a config file in the current directory, checking both JS and TS
    const jsConfigPath = path.resolve(process.cwd(), 'add-icon.config.js');
    const tsConfigPath = path.resolve(process.cwd(), 'add-icon.config.ts');

    // Check for TypeScript config first
    if (existsSync(tsConfigPath)) {
      try {
        const config = await importModule(tsConfigPath);
        return { ...defaultConfig, ...config.default };
      } catch (err) {
        console.error('Error loading TypeScript config, falling back to default config:', err);
        return defaultConfig;
      }
    }

    // Then check for JavaScript config
    if (existsSync(jsConfigPath)) {
      try {
        const config = await importModule(jsConfigPath);
        return { ...defaultConfig, ...config.default };
      } catch (err) {
        console.error('Error loading JavaScript config, falling back to default config:', err);
        return defaultConfig;
      }
    }

    // Fall back to default config
    return defaultConfig;
  } catch (error) {
    console.error('Error loading config, using default config:', error);
    return defaultConfig;
  }
}
