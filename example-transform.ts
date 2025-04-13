import type { TransformArgs } from 'iconify-cli';

/**
 * Example transform that adds a custom data attribute
 * @param args - Transform arguments containing SVG content and icon information
 * @returns The transformed SVG
 */
export default function addCustomDataAttribute(args: TransformArgs): string {
  // Add data attribute with the icon name
  return args.svg.replace(/<svg/, `<svg data-icon="${args.iconName}"`);
}
