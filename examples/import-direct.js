// ESM test for importing directly from dist files
import { TransformArgs, VERSION } from '../dist/types.js';
import { transforms } from '../dist/index.js';

console.log('Imported transforms:', Object.keys(transforms));
console.log('TransformArgs type imported successfully');
console.log('Version:', VERSION);
