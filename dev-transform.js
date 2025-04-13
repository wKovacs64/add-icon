/**
 * Example JS transform that changes the SVG colors
 * @param {Object} args - Transform arguments
 * @param {string} args.svg - SVG content
 * @param {string} args.iconName - Icon name (e.g., 'heroicons:arrow-up-circle')
 * @param {string} args.prefix - Icon set prefix (e.g., 'heroicons')
 * @param {string} args.name - Icon name without prefix (e.g., 'arrow-up-circle')
 * @returns {string} - Transformed SVG
 */
export default function changeColor(args) {
  // Replace currentColor with a fixed color
  return args.svg.replace(/currentColor/g, '#ff5500');
}
