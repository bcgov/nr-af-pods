import type { Meta, StoryObj } from '@storybook/web-components';
import './CurrencyInput.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'currency-input',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    inputValue: '5432.32',
  },
  render: function Render(args) {
    const [{ inputValue, formattedValue }, updateArgs] = useArgs();
    return html`<currency-input
      inputValue=${inputValue}
      @onChangeCurrencyInput=${(e: CustomEvent) => {
        action('onChangeCurrencyInput')(e);
        updateArgs({ inputValue: e.detail.value });
      }}
      primary
    ></currency-input>`;
  },
};
