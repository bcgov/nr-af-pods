import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';

const licenseContent = `/*!
* powerpod 0.8.3
* https://github.com/bcgov/nr-af-pods/powerpod
*
* @license GPLv3 for open source use only
*
* Copyright (C) 2024 https://github.com/bcgov/nr-af-pods/powerpod - A project by Mihai Listov
*/
`;

const terserOptions = {
  compress: {
    passes: 2,
    drop_console: true,
  },
  keep_fnames: true,
  mangle: {
    properties: false,
    // properties: {
    //   // regex: /_$/,
    //   keep_quoted: true,
    //   reserved: [
    //     'powerpod',
    //     'jQuery',
    //     '$',
    //     'fn',

    //     'observer',

    //     // Public API
    //     'version',
    //     'test',
    //     'shared',
    //     'powerpod',
    //     'useScript',
    //     'fetch',
    //     'getProgramData',
    //     'getMunicipalData',
    //     'getOrgbookAutocomplete',
    //     'getOrgbookTopic',
    //     'getOrgbookCredentials',
    //   ],
    // },
  },
};

// ([a-zA-Z0-9]+\.)+(\w+)
// https://jsfiddle.net/kut3oh5j/
module.exports = [
  {
    input: 'src/js/app.js',
    external: ['powerpod', 'window', 'document'],
    globals: {
      document: 'document',
      window: 'window',
    },

    output: [
      {
        file: 'dist/powerpod.js',
        name: 'powerpod',
        format: 'umd',
        banner: licenseContent,
        globals: {
          document: 'document',
          window: 'window',
        },
      },
      {
        file: 'dist/powerpod.min.js',
        name: 'powerpod',
        format: 'umd',
        banner: licenseContent,
        plugins: [terser(terserOptions)],
        globals: {
          document: 'document',
          window: 'window',
        },
      },
    ],
    plugins: [
      resolve(),
      typescript({
        tsconfig: 'src/tsconfig.json',
      }),
      css(),
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                ie: '11',
              },
            },
          ],
        ],
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
    ],
  },
];
