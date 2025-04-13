/**
 * Arguments passed to transform functions
 */
export interface TransformArgs {
  /** The SVG content as a string */
  svg: string;

  /** The full icon name (e.g., 'heroicons:arrow-up-circle') */
  iconName: string;

  /** The icon set prefix (e.g., 'heroicons') */
  prefix: string;

  /** The specific icon name (e.g., 'arrow-up-circle') */
  name: string;
}

/**
 * SVG transformation function type
 */
export type IconTransform = (args: TransformArgs) => Promise<string> | string;

/**
 * Configuration options for the Iconify CLI
 */
export interface IconifyConfig {
  /** Directory to output icons */
  outputDir: string;

  /** Array of transform functions to apply to icons */
  transforms?: IconTransform[];
}

// Export a dummy value to ensure the module isn't just a type module
export const VERSION = '1.0.0';
