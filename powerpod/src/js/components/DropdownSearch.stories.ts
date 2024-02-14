import type { Meta, StoryObj } from '@storybook/web-components';
import './DropdownSearch.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'dropdown-search',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  render: () => html`<dropdown-search primary></dropdown-search>`,
};
