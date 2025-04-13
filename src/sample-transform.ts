/**
 * Sample custom transform that adds a title element to SVG
 * @param svg - SVG content
 * @param iconName - Icon name
 * @returns Transformed SVG
 */
export default function addTitle(svg: string, iconName: string): string {
  const titleElement = `<title>${iconName}</title>`;
  return svg.replace(/<svg([^>]*)>/, `<svg$1>${titleElement}`);
}
