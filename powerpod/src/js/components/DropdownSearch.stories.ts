import type { Meta, StoryObj } from '@storybook/web-components';
import './DropdownSearch.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'dropdown-search',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    selectedValue: 'Other Costs',
    options: [
      'SME Fee',
      'Facilitator Fee',
      'SME/Facilitator Travel',
      'Facility, equipment, technology rental',
      'Advertising/communications',
      'Administration Costs',
      'Other Costs',
    ],
  },
  render: function Render(args) {
    const [{ options, selectedValue }, updateArgs] = useArgs();
    return html`<dropdown-search
      .options=${options}
      .selectedValue=${selectedValue}
      @onChangeDropdownValue=${(e: CustomEvent) => {
        action('onChangeDropdownValue')(e);
        updateArgs({ selectedValue: e.detail.value });
      }}
      primary
    ></dropdown-search>`;
  },
};
