/**
 * Arguments passed to transform functions
 */
export type TransformArgs = {
  /** The SVG content as a string */
  svg: string;

  /** The icon set (e.g., 'heroicons') */
  iconSet: string;

  /** The icon name (e.g., 'arrow-up-circle') */
  iconName: string;
}

/**
 * SVG transformation function type
 */
export type TransformFunction = (args: TransformArgs) => Promise<string> | string;

/**
 * Configuration options for the add-icon CLI
 */
export type Config = {
  /** Directory to output icons */
  outputDir: string;

  /** Array of transform functions to apply to icons */
  transforms?: TransformFunction[];
}
