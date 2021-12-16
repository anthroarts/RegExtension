'use strict';

import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATHS = {
  src: resolve(__dirname, '../src'),
  build: resolve(__dirname, '../build'),
};

export default PATHS;
