import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import './DateField.ts';

const meta: Meta = {
  component: 'date-field',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    inputValue: 'Mar-21-2025',
  },
  render: function Render(args) {
    const [{ inputValue }, updateArgs] = useArgs();
    return html`<date-field
      .inputValue=${inputValue}
      @onChangeDateField=${(e: CustomEvent) => {
        action('onChangeDateField')(e);
        updateArgs({ inputValue: e.detail.value });
      }}
      primary
    ></date-field>`;
  },
};
