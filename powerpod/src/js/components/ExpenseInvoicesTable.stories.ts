import type { Meta, StoryObj } from '@storybook/web-components';
import './ExpenseInvoicesTable.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'expense-invoices-table',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    columns: [
      {
        id: 'invoiceNum',
        name: 'Invoice #',
        width: '15%',
      },
      {
        id: 'invoiceDate',
        name: 'Invoice Date',
        width: '15%',
      },
      {
        id: 'purchasedFrom',
        name: 'Purchased from',
        width: '15%',
      },
      {
        id: 'description',
        name: 'Description',
        width: '40%',
      },
      {
        id: 'subtotal',
        name: 'Subtotal (before tax)',
        width: '15%',
      },
    ],
    rows: [
      {
        invoiceNum: '#1234',
        invoiceDate: 'Jan-10-2025',
        purchasedFrom: 'GMP Metal Works',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium.',
        subtotal: '50.00',
      },
      {
        invoiceNum: '#1234',
        invoiceDate: 'Jan-10-2025',
        purchasedFrom: 'GMP Metal Works',
        description: 'This is for our contractor',
        subtotal: '50.00',
      },
    ],
  },
  render: function Render(args) {
    const [{ rows, headings, columns }, updateArgs] = useArgs();
    return html`<expense-invoices-table
      columns=${JSON.stringify(columns)}
      rows=${JSON.stringify(rows)}
      @onChangeExpenseInvoicesData=${(e: CustomEvent) => {
        action('onChangeExpenseInvoicesData')(e);
        updateArgs({ rows: JSON.parse(e.detail.value) });
      }}
      primary
    ></expense-invoices-table>`;
  },
};
