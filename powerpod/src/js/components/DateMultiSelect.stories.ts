import type { Meta, StoryObj } from '@storybook/web-components';
import './DateMultiSelect.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'date-multiselect',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    inputValue: '5/22/2025, 5/30/2025, 5/24/2025',
  },
  render: function Render(args) {
    const [{ options, selectedOptions, inputValue }, updateArgs] = useArgs();
    return html`<date-multiselect
      .inputValue=${inputValue}
      @onChangeDateMultiSelectValues=${(e: CustomEvent) => {
        console.log(e.detail.value);
        action('onChangeDateMultiSelectValues')(e);
        updateArgs({
          inputValue: e.detail.value,
        });
      }}
      primary
    ></date-multiselect>`;
  },
};
