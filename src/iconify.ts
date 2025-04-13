import fs from 'node:fs';
import path from 'node:path';
import { iconToSVG, type IconifyIcon } from '@iconify/utils';
import type { IconifyConfig, TransformArgs } from './types.js';

/**
 * Parses an icon reference into prefix and name
 * @param iconReference - Reference in format 'prefix:name'
 * @returns Object with prefix and name
 */
export function parseIconReference(iconReference: string): { prefix: string; name: string } {
  const parts = iconReference.split(':');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid icon reference: ${iconReference}. Expected format: prefix:name`);
  }

  return {
    prefix: parts[0],
    name: parts[1],
  };
}

/**
 * Fetches icon data from Iconify API
 * @param prefix - Icon set prefix
 * @param name - Icon name
 * @returns Promise with icon data
 */
async function fetchIconData(prefix: string, name: string): Promise<IconifyIcon> {
  const apiUrl = `https://api.iconify.design/${prefix}.json?icons=${name}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.icons || !data.icons[name]) {
      throw new Error(`Icon '${name}' not found in '${prefix}' icon set`);
    }

    return data.icons[name] as IconifyIcon;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch icon data: ${errorMessage}`);
  }
}

/**
 * Downloads an icon and applies transforms
 * @param iconReference - Icon reference (e.g., 'heroicons:arrow-up-circle')
 * @param config - Configuration options
 * @returns Path to saved icon file
 */
export async function downloadIcon(iconReference: string, config: IconifyConfig): Promise<string> {
  try {
    const { prefix, name } = parseIconReference(iconReference);

    // Ensure the output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Load the icon data
    const iconData = await fetchIconData(prefix, name);

    // Convert icon data to SVG
    const renderData = iconToSVG(iconData as IconifyIcon, {
      height: 'auto',
    });

    // Create SVG string
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${renderData.attributes.width}" height="${renderData.attributes.height}" viewBox="${renderData.attributes.viewBox}">${renderData.body}</svg>`;

    // Apply transforms if specified
    if (config.transforms && config.transforms.length > 0) {
      for (const transform of config.transforms) {
        // Create transform arguments object
        const transformArgs: TransformArgs = {
          svg,
          iconName: iconReference,
          prefix,
          name,
        };

        // Apply transform
        svg = await Promise.resolve(transform(transformArgs));
      }
    }

    // Create file name
    const fileName = `${prefix}-${name}.svg`;
    const filePath = path.join(config.outputDir, fileName);

    // Write the SVG file
    fs.writeFileSync(filePath, svg, 'utf8');

    return filePath;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to download icon: ${errorMessage}`);
  }
}
