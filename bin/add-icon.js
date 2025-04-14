#!/usr/bin/env node

import url from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { runCli } from '../dist/index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This logic ensures we only run the CLI when this file is called directly
// and not when it's imported as a module
if (
  os.platform() === 'win32'
    ? process.argv[1] === __filename
    : process.argv[1] === __filename || process.argv[1] === __dirname
) {
  runCli();
}