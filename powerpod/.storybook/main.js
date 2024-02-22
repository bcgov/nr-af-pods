/** @type { import('@storybook/web-components-vite').StorybookConfig } */
import { mergeConfig } from 'vite';
import path from 'path';
const config = {
  staticDirs: ['../src/assets'],
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          '../common/fetch': path.resolve(
            __dirname,
            '../__mocks__/common/fetch.js'
          ),
          '../../assets/css/bootstrap.css': path.resolve(
            __dirname,
            '../src/assets/css/bootstrap.css?inline'
          ),
        },
      },
    }),
  babel: async (options) => {
    return {
      ...options,
      assumptions: {
        setPublicClassFields: true,
      },
      plugins: [
        [
          '@babel/plugin-transform-typescript',
          {
            allowDeclareFields: true,
          },
        ],
        [
          '@babel/plugin-proposal-decorators',
          {
            decoratorsBeforeExport: true,
            version: '2018-09',
          },
        ],
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        ['@babel/plugin-proposal-private-methods', { loose: false }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: false }],
      ],
    };
  },
};
export default config;
