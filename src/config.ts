import { existsSync } from "node:fs";
import path from "node:path";
import type { Config } from "./types.js";
import { importModule, type ModuleNamespace } from "./import-module.js";

/**
 * Default configuration
 */
export const defaultConfig = {
  outputDir: ".", // Current directory
} as const satisfies Config;

/**
 * Checks that a config module's default export is an object. Its fields are trusted, not validated.
 */
function isConfig(value: unknown): value is Config {
  return typeof value === "object" && value !== null;
}

/**
 * Merges a config module's default export over the default config
 * @param configModule - Imported config module
 * @returns Configuration object
 */
function mergeConfigModule(configModule: ModuleNamespace): Config {
  if (!isConfig(configModule.default)) {
    return { ...defaultConfig };
  }

  return { ...defaultConfig, ...configModule.default };
}

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
      return mergeConfigModule(await importModule(configPath));
    }

    // Try to find a config file in the current directory, checking both JS and TS
    const jsConfigPath = path.resolve(process.cwd(), "add-icon.config.js");
    const tsConfigPath = path.resolve(process.cwd(), "add-icon.config.ts");

    // Check for TypeScript config first
    if (existsSync(tsConfigPath)) {
      try {
        return mergeConfigModule(await importModule(tsConfigPath));
      } catch (err) {
        console.error("Error loading TypeScript config, falling back to default config:", err);

        return defaultConfig;
      }
    }

    // Then check for JavaScript config
    if (existsSync(jsConfigPath)) {
      try {
        return mergeConfigModule(await importModule(jsConfigPath));
      } catch (err) {
        console.error("Error loading JavaScript config, falling back to default config:", err);

        return defaultConfig;
      }
    }

    // Fall back to default config
    return defaultConfig;
  } catch (error) {
    console.error("Error loading config, using default config:", error);

    return defaultConfig;
  }
}
