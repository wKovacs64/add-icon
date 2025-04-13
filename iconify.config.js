import { transforms } from './dist/index.js';

/**
 * Sample custom transform
 */
function addCustomAttribute(args) {
  return args.svg.replace(/<svg/, `<svg data-icon="${args.iconName}"`);
}

export default {
  outputDir: './downloaded-icons',
  transforms: [transforms.removeSize, transforms.optimizeSvg, addCustomAttribute],
};
