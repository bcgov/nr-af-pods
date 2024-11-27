import type { Meta, StoryObj } from '@storybook/web-components';
import './DropdownMultiselect.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'dropdown-multiselect',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    selectedOptions: ['facility-equipment-technology-rental', 'sme-fee', 'smefacilitator-travel', 'other-costs'], 
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
    const [{ options, selectedOptions }, updateArgs] = useArgs();
    return html`<dropdown-multiselect
      .options=${options}
      .selectedOptions=${selectedOptions}
      @onChangeDropdownMultiselectValues=${(e: CustomEvent) => {
        action('onChangeDropdownMultiselectValues')(e);
        updateArgs({ selectedOptions: e.detail.selectedOptions });
      }}
      primary
    ></dropdown-multiselect>`;
  },
};
