import type { Meta, StoryObj } from '@storybook/web-components';
import './PercentageInput.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'percentage-input',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    inputValue: '55',
  },
  render: function Render(args) {
    const [{ inputValue, formattedValue }, updateArgs] = useArgs();
    return html`<percentage-input
      inputValue=${inputValue}
      @onChangePercentageInput=${(e: CustomEvent) => {
        action('onChangePercentageInput')(e);
        updateArgs({ inputValue: e.detail.value });
      }}
      primary
    ></percentage-input>`;
  },
};
