import type { Meta, StoryObj } from '@storybook/web-components';
import './ExpenseReportTable.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'expense-report-table',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    columns: [
      {
        id: 'type',
        name: 'Expense Type',
        width: '20%',
      },
      {
        id: 'description',
        name: 'Description',
        width: '70%',
      },
      {
        id: 'amount',
        name: 'Amount',
        width: '10%'
      },
    ],
    rows: [
      {
        type: 'Facility, equipment, technology rental',
        description: 'This is for our contractor',
        amount: '50.00',
      },
      {
        type: 'Administration Costs',
        description: 'Agriculture fees for facilitating resources',
        amount: '65.00',
      },
    ],
  },
  render: function Render(args) {
    const [{ rows, headings, columns }, updateArgs] = useArgs();
    return html`<expense-report-table
      .columns=${columns}
      .rows=${rows}
      @onChangeExpenseReportData=${(e: CustomEvent) => {
        action('onChangeExpenseReportData')(e);
        updateArgs({ rows: JSON.parse(e.detail.value) });
      }}
      primary
    ></expense-report-table>`;
  },
};
