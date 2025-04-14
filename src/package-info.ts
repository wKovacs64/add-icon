import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Loads package info from package.json
 * @returns Package info with name, version, and description
 */
export async function getPackageInfo(): Promise<{
  name: string;
  version: string;
  description: string;
}> {
  // Get the directory of the current module
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = path.dirname(currentFilePath);
  
  // Go up one level from src/ to the package root
  const packageJsonPath = path.resolve(currentDir, '..', 'package.json');
  
  try {
    // Read and parse package.json
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    return {
      name: packageJson.name || 'add-icon',
      version: packageJson.version || '0.0.0',
      description: packageJson.description || 'Download and transform icons from Iconify',
    };
  } catch (error) {
    console.warn('Failed to read package.json:', error);
    
    // Fallback values
    return {
      name: 'add-icon',
      version: '0.0.0',
      description: 'Download and transform icons from Iconify',
    };
  }
}