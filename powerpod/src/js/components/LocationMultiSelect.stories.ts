import type { Meta, StoryObj } from '@storybook/web-components';
import './LocationMultiSelect.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'location-multiselect',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  render: () => html`<location-multiselect primary></location-multiselect>`,
};
