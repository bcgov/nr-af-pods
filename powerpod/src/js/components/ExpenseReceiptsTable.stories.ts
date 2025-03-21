import type { Meta, StoryObj } from '@storybook/web-components';
import './ExpenseReceiptsTable.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'expense-receipts-table',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    columns: [
      {
        id: 'receiptNum',
        name: 'Receipt #',
        width: '15%',
      },
      {
        id: 'receiptDate',
        name: 'Receipt date',
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
        name: 'Subtotal (no GST)',
        width: '15%',
      },
    ],
    rows: [
      {
        receiptNum: '#1234',
        receiptDate: 'Jan-10-2025',
        purchasedFrom: 'GMP Metal Works',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium.',
        subtotal: '50.00',
      },
      {
        receiptNum: '#1234',
        receiptDate: 'Jan-10-2025',
        purchasedFrom: 'GMP Metal Works',
        description: 'This is for our contractor',
        subtotal: '50.00',
      },
    ],
  },
  render: function Render(args) {
    const [{ rows, headings, columns }, updateArgs] = useArgs();
    return html`<expense-receipts-table
      columns=${JSON.stringify(columns)}
      rows=${JSON.stringify(rows)}
      @onChangeExpenseReceiptsData=${(e: CustomEvent) => {
        action('onChangeExpenseReceiptsData')(e);
        updateArgs({ rows: JSON.parse(e.detail.value) });
      }}
      primary
    ></expense-receipts-table>`;
  },
};
