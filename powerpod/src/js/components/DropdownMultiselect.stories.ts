import shoelace from '../../assets/css/shoelace.css';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import type { Meta, StoryObj } from '@storybook/web-components';
import './DropdownMultiselect.ts';

import { html } from 'lit';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

const meta: Meta = {
  component: 'dropdown-multiselect',
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    selectedValues: 'other-costs',
    options: [
      'sme-fee',
      'facilitator-fee',
      'sme-facilitator-travel',
      'facility-equipment-technology-rental',
      'advertising-communications',
      'administration-costs',
      'other-costs',
    ],
  },
  render: function Render(args) {
    const [{ options, selectedValues }, updateArgs] = useArgs();
    return html`
      <sl-select
        label="Select a Few"
        value="option-1 option-2 option-3"
        multiple
        clearable
      >
        <sl-option value="option-1">Option 1</sl-option>
        <sl-option value="option-2">Option 2</sl-option>
        <sl-option value="option-3">Option 3</sl-option>
        <sl-option value="option-4">Option 4</sl-option>
        <sl-option value="option-5">Option 5</sl-option>
        <sl-option value="option-6">Option 6</sl-option>
      </sl-select>
    `;
    // return html`<dropdown-multiselect
    //   .options=${options}
    //   .selectedValues=${selectedValues}
    //   @onChangeDropdownMultiselectValues=${(e: CustomEvent) => {
    //     action('onChangeDropdownMultiselectValues')(e);
    //     updateArgs({ selectedValues: e.detail.value });
    //   }}
    //   primary
    // ></dropdown-multiselect>`;
  },
};
