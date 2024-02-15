import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('dropdown-search')
class DropdownSearch extends LitElement {
  @query('#selectElement') selectElement: HTMLSelectElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Array }) options: string[] = [];
  @property({ type: String }) selectedValue: string = '';

  generateOption(value: string) {
    return html` <option value=${value}>${value}</option> `;
  }

  // select elements behave funny, so we have to set the value ourselves
  // on the very first load of the component
  firstUpdated(props: Map<string, string>) {
    if (props.has('selectedValue') && this.selectElement) {
      this.selectElement.value = this.selectedValue || '';
    }
  }

  emitEvent() {
    const customEvent = new CustomEvent('onChangeDropdownValue', {
      detail: {
        id: this.id,
        message: 'Dropdown value has changed',
        value: this.selectedValue,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  render() {
    return html`
      <select
        id="selectElement"
        .value=${this.selectedValue}
        @change=${(event: Event) => {
          const { target } = event;
          if (target)
            this.selectedValue = (target as HTMLSelectElement).value ?? '';
          this.emitEvent();
        }}
      >
        ${this.options?.map((option) => this.generateOption(option))}
      </select>
    `;
  }
}
