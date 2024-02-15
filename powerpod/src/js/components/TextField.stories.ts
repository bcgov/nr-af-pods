import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import './TextField.ts';

const meta: Meta = {
  component: 'text-field',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    inputValue: 'Hello, world!',
  },
  render: function Render(args) {
    const [{ inputValue }, updateArgs] = useArgs();
    return html`<text-field
      .inputValue=${inputValue}
      @onChangeTextField=${(e: CustomEvent) => {
        action('onChangeTextField')(e);
        updateArgs({ inputValue: e.detail.value });
      }}
      primary
    ></text-field>`;
  },
};
