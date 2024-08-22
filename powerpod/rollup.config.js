import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

const licenseContent = `/*!
* powerpod 2.0.7
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
  },
};

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
      json(),
      typescript({
        tsconfig: 'src/tsconfig.json',
        noEmit: true, // Already set in tsconfig.json, but this makes it explicit
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
