import { useArgs } from '@storybook/client-api';
import type { Meta, StoryObj } from '@storybook/web-components';
import './LocationMultiSelect.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'location-multiselect',
};
export default meta;
type Story = StoryObj;

export const Primary: Story = () => {
  const [{ selectedvalues }, updateArgs] = useArgs();
  return html`<location-multiselect
    selectedvalues=${selectedvalues}
    onSelect=${(values: string) => updateArgs({ selectedvalues: values })}
    primary
  ></location-multiselect>`;
};

Primary.args = {
  selectedvalues: 'Metchosin, North Saanich, Oak Bay',
};
