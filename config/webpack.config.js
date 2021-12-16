'use strict';

import { merge } from 'webpack-merge';

import common from './webpack.common.js';
import PATHS from './paths.js';

// Merge webpack configuration files
const config = (env, argv) => merge(common, {
  entry: {
    content_script: PATHS.src + '/content_script.js',
    event_page: PATHS.src + '/event_page.js',
    popup: PATHS.src + '/popup.js',
    disable_auto_logout: PATHS.src + '/disable_auto_logout.js',
  },
  devtool: argv.mode === 'production' ? false : 'source-map'
});

export default config;
