import type { Meta, StoryObj } from '@storybook/web-components';
import './ClaimInfoGridVLB.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'claim-info-grid-vlb',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    readOnly: true,
    header: {
      title: 'Practice(s) Where Locum Services Were Delivered',
    },
    columns: [
      {
        id: 'name',
        name: 'Name',
        width: '20%',
      },
      {
        id: 'city',
        name: 'Location City',
        width: '60%',
      },
      {
        id: 'email',
        name: 'Email',
        width: '20%',
      },
      {
        id: 'staffNumber',
        name: 'Staff Number(s)',
        width: '0%',
      },
      {
        id: 'typeOfFood',
        name: 'Types of food animals serviced',
        width: '0%',
      },
      {
        id: 'dates',
        name: 'Date(s)',
        width: '0%',
      },
    ],
    rows: [
      {
        name: 'Practice A',
        city: 'Victoria',
        email: 'rauber@farm.ca',
        staffNumber: '2',
        typeOfFood: ['beef-cattle'],
        dates: '12/13/24,23/5/24',
      },
      {
        name: 'Practice B',
        city: 'Vancouver',
        email: 'rauber@gov.bc.ca',
        staffNumber: '2',
        typeOfFood: ['beef-cattle'],
        dates: '12/13/24,05/23/24',
      },
      {
        name: 'Practice C',
        city: 'Kelowna',
        email: 'rauber@gov.bc.ca',
        staffNumber: '1',
        typeOfFood: ['beef-cattle'],
        dates: '12/13/24,05/23/24',
      },
    ],
  },
  render: function Render(args) {
    const [{ readOnly, rows, header, columns }, updateArgs] = useArgs();
    console.log(`readOnly: ${readOnly}`);
    return html`<claim-info-grid-vlb
      columns=${JSON.stringify(columns)}
      rows=${JSON.stringify(rows)}
      .readOnly=${readOnly ?? false}
      header=${JSON.stringify(header)}
      @onChangeClaimInfoGridVLBData=${(e: CustomEvent) => {
        action('onChangeClaimInfoGridVLBData')(e);
        updateArgs({ rows: JSON.parse(e.detail.value) });
      }}
      primary
    ></claim-info-grid-vlb>`;
  },
};
