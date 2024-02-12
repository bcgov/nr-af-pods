import type { Meta, StoryObj } from '@storybook/web-components';
import './CurrencyInput.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'currency-input',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  render: () => html`<currency-input primary></currency-input>`,
};
