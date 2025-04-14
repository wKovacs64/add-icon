import fs from 'node:fs/promises';
import path from 'node:path';
import * as esbuild from 'esbuild';

/**
 * Imports a module file (JavaScript or TypeScript) by processing it with esbuild
 * @param filePath - Path to module file (JS or TS)
 * @returns Module exports
 */
export async function importModule(filePath: string): Promise<any> {
  const absolutePath = path.resolve(filePath);
  try {
    // Read the module file content
    const code = await fs.readFile(absolutePath, "utf-8");

    // Determine the appropriate loader based on file extension
    const loader = absolutePath.endsWith('.ts') ? 'ts' : 'js';

    // Use esbuild to transform the code to ESM JS
    const result = await esbuild.transform(code, {
      loader, // Automatically use the appropriate loader
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
    console.error(`Error importing module ${filePath} with esbuild:`, error);
    throw error;
  }
}