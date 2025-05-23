import type { Meta, StoryObj } from '@storybook/web-components';
import './ExpenseReportTableKTTP.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'expense-report-table-kttp',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    columns: [
      {
        id: 'type',
        name: 'Expense Type',
        width: '35%',
      },
      {
        id: 'description',
        name: 'Description',
        width: '50%',
      },
      {
        id: 'amount',
        name: 'Amount ($CAD)',
        width: '15%',
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
      {
        type: 'Administration Costs',
        description: 'Agriculture fees for facilitating resources',
        amount: '65.00',
      },
    ],
    expenseTypes: [
      'Administration Costs',
      'Advertising / Communications Costs',
      'Facility, equipment, technology rental',
      'Cost share contribution (cash or in-kind)',
      'SME / Facilitator Fee',
      'SME / Facilitator Travel (airfare, parking, etc.)',
      'SME / Facilitator Accommodation',
      'Other Costs',
    ],
  },
  render: function Render(args) {
    const [{ rows, headings, columns, expenseTypes }, updateArgs] = useArgs();
    return html`<expense-report-table-kttp
      columns=${JSON.stringify(columns)}
      rows=${JSON.stringify(rows)}
      expenseTypes=${JSON.stringify(expenseTypes)}
      @onChangeExpenseReportData=${(e: CustomEvent) => {
        action('onChangeExpenseReportData')(e);
        updateArgs({ rows: JSON.parse(e.detail.value) });
      }}
      primary
    ></expense-report-table-kttp>`;
  },
};
