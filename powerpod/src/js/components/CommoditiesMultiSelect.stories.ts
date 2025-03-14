import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import './CommoditiesMultiSelect.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'commodities-multiselect',
};
export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    selectedValues: '',
  },
  render: function Render(args) {
    const [{ selectedValues }, updateArgs] = useArgs();
    return html`<commodities-multiselect
      selectedvalues=${selectedValues}
      @onChangeSelectedValues=${(e: CustomEvent) => {
        action('onChangeSelectedValues')(e);
        updateArgs({ selectedValues: e.detail.value });
      }}
      primary
    ></commodities-multiselect>`;
  },
};
