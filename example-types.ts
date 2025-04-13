// Example showing how to import types from the package
import type { TransformArgs } from './dist/types.js';

/**
 * A custom transform function
 */
export default function myTransform(args: TransformArgs): string {
  console.log(`Processing icon: ${args.iconName}`);
  console.log(`Icon prefix: ${args.prefix}`);
  console.log(`Icon name: ${args.name}`);

  return args.svg.replace('currentColor', '#00ff00');
}
