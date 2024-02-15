import { useArgs } from '@storybook/client-api';
import type { Meta, StoryObj } from '@storybook/web-components';
import './LocationMultiSelect.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'location-multiselect',
};
export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    selectedValues: 'Metchosin, North Saanich, Oak Bay',
  },
  render: function Render(args) {
    const [{ selectedValues }, updateArgs] = useArgs();
    return html`<location-multiselect
      selectedvalues=${selectedValues}
      @onChangeSelectedValues=${(e: CustomEvent) =>
        updateArgs({ selectedValues: e.detail.selectedValues })}
      primary
    ></location-multiselect>`;
  },
};
