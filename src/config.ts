import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { IconifyConfig } from './types.js';
import { importTsModule } from './import-ts-module.js';

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
  try {
    // If a specific config path is provided, use it
    if (configPath) {
      // Choose loader based on file extension
      if (configPath.endsWith('.ts')) {
        const config = await importTsModule(configPath);
        return { ...defaultConfig, ...config.default };
      } else {
        // For JS files, use standard dynamic import
        const fileUrl = pathToFileURL(path.resolve(configPath)).toString();
        const config = await import(fileUrl);
        return { ...defaultConfig, ...config.default };
      }
    }

    // Try to find a config file in the current directory, checking both JS and TS
    const jsConfigPath = path.resolve(process.cwd(), 'add-icon.config.js');
    const tsConfigPath = path.resolve(process.cwd(), 'add-icon.config.ts');

    // Check for TypeScript config first
    if (existsSync(tsConfigPath)) {
      try {
        const config = await importTsModule(tsConfigPath);
        return { ...defaultConfig, ...config.default };
      } catch (err) {
        console.error('Error loading TypeScript config, falling back to default config:', err);
        return defaultConfig;
      }
    }

    // Then check for JavaScript config
    if (existsSync(jsConfigPath)) {
      try {
        const fileUrl = pathToFileURL(path.resolve(jsConfigPath)).toString();
        const config = await import(fileUrl);
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
