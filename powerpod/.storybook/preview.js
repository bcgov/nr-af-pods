import jquery from 'jquery';
global.$ = jquery;
global.jQuery = jquery;

import '../src/assets/css/bootstrap.css';

/** @type { import('@storybook/web-components').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
