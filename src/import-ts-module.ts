import fs from 'node:fs/promises';
import path from 'node:path';
import * as esbuild from 'esbuild';

/**
 * Imports a TypeScript module by transpiling it in-memory with esbuild
 * @param filePath - Path to TypeScript file
 * @returns Module exports
 */
export async function importTsModule(filePath: string): Promise<any> {
  const absolutePath = path.resolve(filePath);
  try {
    // Read the TypeScript file content
    const tsCode = await fs.readFile(absolutePath, "utf-8");

    // Use esbuild to transform TS to ESM JS
    const result = await esbuild.transform(tsCode, {
      loader: "ts", // Specify the loader for TypeScript
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
    return await import(dataUri);
  } catch (error) {
    console.error(`Error importing TS module ${filePath} with esbuild:`, error);
    throw error;
  }
}