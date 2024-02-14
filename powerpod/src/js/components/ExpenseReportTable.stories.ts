import type { Meta, StoryObj } from '@storybook/web-components';
import './ExpenseReportTable.ts';

import { html } from 'lit';

const meta: Meta = {
  component: 'expense-report-table',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  render: ({ headings, rows }) => html`<expense-report-table
    primary
    headings=${JSON.stringify(headings)}
    rows=${JSON.stringify(rows)}
  ></expense-report-table>`,
  args: {
    headings: {
      type: 'Expense Type',
      description: 'Description',
      amount: 'Amount ($CAD)',
    },
    rows: [
      {
        type: 'SME Fee',
        description: 'This is for our contractor',
        amount: '50.00',
      },
      {
        type: 'Facilitator Fee',
        description: 'Agriculture fees for facilitating resources',
        amount: '65.00',
      },
    ],
  },
};
