// TypeScript test of imports
import { transforms, downloadIcon, TransformArgs } from 'iconify-cli';

// Create a custom transform function with proper typing
const myTransform = (args: TransformArgs): string => {
  console.log(`Processing icon: ${args.iconName}`);
  return args.svg.replace('currentColor', '#ff0000');
};

// Use builtin transforms
const transformPipeline = [transforms.removeSize, transforms.optimizeSvg, myTransform];

// This is just a type test, no need to run
console.log('Type check successful');
