import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import './Checkbox.ts';

const meta: Meta = {
  component: 'quartech-checkbox',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    inputValue: false,
  },
  render: function Render(args) {
    const [{ inputValue }, updateArgs] = useArgs();
    return html`<quartech-checkbox
      inputValue=${inputValue}
      @onChangeCheckbox=${(e: CustomEvent) => {
        action('onChangeCheckbox')(e);
        updateArgs({ inputValue: e.detail.value });
      }}
      primary
    ></quartech-checkbox>`;
  },
};
