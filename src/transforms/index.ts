import { optimize } from 'svgo';
import type { IconTransform, TransformArgs } from '../types.js';

/**
 * Removes width and height attributes from SVG
 */
export const removeSize: IconTransform = (args: TransformArgs): string => {
  const { svg } = args;
  return svg.replace(/\s+width="[^"]+"/g, '').replace(/\s+height="[^"]+"/g, '');
};

/**
 * Optimizes SVG with SVGO
 */
export const optimizeSvg: IconTransform = (args: TransformArgs): string => {
  const { svg } = args;
  const result = optimize(svg, {
    plugins: [
      'preset-default',
      'removeXMLNS',
      {
        name: 'removeAttrs',
        params: {
          attrs: '(data-name)',
        },
      },
    ],
  });

  return result.data;
};

/**
 * Minifies SVG by removing whitespace
 */
export const minifySvg: IconTransform = (args: TransformArgs): string => {
  const { svg } = args;
  return svg
    .replace(/>[\s\r\n]+</g, '><') // Remove whitespace between tags
    .replace(/\s{2,}/g, ' ') // Reduce multiple spaces to single space
    .trim();
};
