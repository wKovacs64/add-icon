// ESM test for importing from iconify-cli
import { transforms } from 'iconify-cli';
import { TransformArgs, VERSION } from 'iconify-cli/types';

console.log('Imported transforms:', Object.keys(transforms));
console.log('TransformArgs type imported successfully');
console.log('Version:', VERSION);
