import type { Meta, StoryObj } from '@storybook/web-components';
import './ExpenseReportTable.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'expense-report-table',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  render: () => html`<expense-report-table primary></expense-report-table>`,
};
