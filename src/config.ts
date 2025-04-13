import fs from 'node:fs';
import path from 'node:path';
import type { IconifyConfig } from './types.js';

/**
 * Default configuration
 */
export const defaultConfig: IconifyConfig = {
  outputDir: './icons',
};

/**
 * Loads configuration from file if it exists
 * @param configPath - Path to config file
 * @returns Configuration object
 */
export async function loadConfig(configPath?: string): Promise<IconifyConfig> {
  // Use provided config path or look for default config file
  const configFile = configPath || path.resolve(process.cwd(), 'iconify.config.js');

  try {
    if (fs.existsSync(configFile)) {
      // For ESM, we need to use dynamic import with file:// protocol
      const fileUrl = `file://${configFile}`;
      const config = await import(fileUrl);
      return { ...defaultConfig, ...config.default };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading config file: ${errorMessage}`);
  }

  return defaultConfig;
}
