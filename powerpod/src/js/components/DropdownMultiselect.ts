import shoelace from '../../assets/css/shoelace.css';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { useScript } from '../common/scripts';

@customElement('dropdown-multiselect')
class DropdownMultiselect extends LitElement {
  @query('#selectElement') selectElement: HTMLSelectElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Array }) options: string[] = [];
  @property({ type: String }) selectedValues: string = '';
  @property({ type: String }) additionalTextBelowField: string = '';
  @property({ type: String }) fieldLabel: string = '';

  static styles = css`
    ${unsafeCSS(shoelace)}
  `;

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();
    useScript('shoelace');
  }

  private formatSlOptionValueStr(input) {
    return input
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters except spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim(); // Trim leading/trailing spaces for safety
  }

  generateOption(value: string) {
    return html` <sl-option value="${this.formatSlOptionValueStr(
      value
    )}">${value}</option> `;
  }

  // select elements behave funny, so we have to set the value ourselves
  // on the very first load of the component
  firstUpdated(props: Map<string, string>) {
    if (props.has('selectedValues') && this.selectElement) {
      this.selectElement.value = this.selectedValues || '';
    }
  }

  emitEvent() {
    const customEvent = new CustomEvent('onChangeDropdownMultiselectValues', {
      detail: {
        id: this.id,
        message: 'Dropdown value has changed',
        value: this.selectedValues,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  private toggleSubstring(mainString, substring) {
    // Convert to an array of words
    let parts = mainString.split(' ');

    if (parts.includes(substring)) {
      // Remove the substring if it exists
      parts = parts.filter((word) => word !== substring);
    } else {
      // Add the substring if it doesn't exist
      parts.push(substring);
    }

    // Return the updated string
    return parts.join(' ');
  }

  render() {
    return html`
      <sl-select
        label="Select a Few"
        size="large"
        value=${this.selectedValues}
        multiple
        clearable
      >
        ${this.options?.map((option) => this.generateOption(option))}
      </sl-select>
    `;
  }
}
