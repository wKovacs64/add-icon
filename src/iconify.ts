import fs from 'node:fs';
import path from 'node:path';
import type { Config, TransformArgs } from './types.js';
import { defaultConfig } from './config.js';

/**
 * Parses an icon reference into iconSet and iconName
 * @param iconReference - Reference in format 'iconSet:iconName'
 * @returns Object with iconSet and iconName
 */
export function parseIconReference(iconReference: string): { iconSet: string; iconName: string } {
  const parts = iconReference.split(':');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid icon reference: ${iconReference}. Expected format: iconSet:iconName`);
  }

  return {
    iconSet: parts[0],
    iconName: parts[1],
  };
}

/**
 * Fetches icon SVG directly from Iconify API
 * @param iconSet - Icon set name
 * @param iconName - Icon name
 * @returns Promise with SVG string
 */
async function fetchIconSvg(iconSet: string, iconName: string): Promise<string> {
  // Using width=unset parameter to remove width/height attributes automatically
  const apiUrl = `https://api.iconify.design/${iconSet}/${iconName}.svg?width=unset`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.text();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch icon SVG: ${errorMessage}`);
  }
}

/**
 * Downloads an icon and applies transforms
 * @param iconReference - Icon reference (e.g., 'heroicons:arrow-up-circle')
 * @param config - Configuration options
 * @returns Path to saved icon file
 */
export async function downloadIcon(iconReference: string, config: Config): Promise<string> {
  try {
    const { iconSet, iconName } = parseIconReference(iconReference);

    // Use default output directory if not specified
    const outputDir = config.outputDir || defaultConfig.outputDir;

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Fetch SVG directly with width=unset parameter to remove width/height attributes
    let svg = await fetchIconSvg(iconSet, iconName);

    // Apply custom transforms if specified
    if (config.transforms && config.transforms.length > 0) {
      for (const transform of config.transforms) {
        // Create transform arguments object
        const transformArgs: TransformArgs = {
          svg,
          iconSet,
          iconName,
        };

        // Apply transform
        svg = await Promise.resolve(transform(transformArgs));
      }
    }

    // Create file name
    const fileName = `${iconSet}-${iconName}.svg`;
    const filePath = path.join(outputDir, fileName);

    // Write the SVG file
    fs.writeFileSync(filePath, svg, 'utf8');

    return filePath;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to download icon: ${errorMessage}`);
  }
}
