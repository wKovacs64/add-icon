import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import type { IconifyConfig } from './types.js';

/**
 * Default configuration
 */
export const defaultConfig: IconifyConfig = {
  outputDir: '.', // Current directory
};

/**
 * Imports a TypeScript module by transpiling it in-memory with esbuild
 * @param filePath - Path to TypeScript file
 * @returns Module exports
 */
async function importTsModuleWithEsbuild(filePath: string): Promise<any> {
  const absolutePath = path.resolve(filePath);
  try {
    // Read the TypeScript file content
    const tsCode = await fs.readFile(absolutePath, "utf-8");

    // Use esbuild to transform TS to ESM JS
    const result = await esbuild.transform(tsCode, {
      loader: "ts", // Specify the loader (ts, tsx, js, jsx)
      format: "esm", // Output format
      sourcemap: false, // Disable source maps for data URI
      sourcefile: absolutePath, // Helps with error messages
      target: 'esnext',
    });

    const jsCode = result.code;

    // Create data URI and import
    const base64Code = Buffer.from(jsCode).toString("base64");
    const dataUri = `data:text/javascript;base64,${base64Code}`;
    
    // Import the transformed code as a module
    const importOptions = {
      assert: { type: "javascript" } as any,
    };
    
    const module = await import(dataUri, importOptions);
    return module;
  } catch (error) {
    console.error(`Error importing TS module ${filePath} with esbuild:`, error);
    throw error;
  }
}

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
        const config = await importTsModuleWithEsbuild(configPath);
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
        const config = await importTsModuleWithEsbuild(tsConfigPath);
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
