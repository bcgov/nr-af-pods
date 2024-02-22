import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('dropdown-search')
class DropdownSearch extends LitElement {
  @query('#selectElement') selectElement: HTMLSelectElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Array }) options: string[] = [];
  @property({ type: String }) selectedValue: string = '';

  static styles = css`
    .dropdown-search {
      min-width: 350px;
      position: relative;
    }

    select {
      appearance: none;
      /*  safari  */
      -webkit-appearance: none;
      /*  other styles for aesthetics */
      width: 100%;
      padding: 0.675em 6em 0.675em 1em;
      background-color: #fff;
      border: 1px solid #caced1;
      border-radius: 0.25rem;
      color: #000;
      cursor: pointer;
    }

    .dropdown-search::before,
    .dropdown-search::after {
      --size: 0.3rem;
      content: '';
      position: absolute;
      right: 1rem;
      pointer-events: none;
    }

    .dropdown-search::before {
      border-left: var(--size) solid transparent;
      border-right: var(--size) solid transparent;
      border-bottom: var(--size) solid black;
      top: 40%;
    }

    .dropdown-search::after {
      border-left: var(--size) solid transparent;
      border-right: var(--size) solid transparent;
      border-top: var(--size) solid black;
      top: 55%;
    }

    span {
      position: absolute;
      padding-top: 2px;
    }
  `;

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
      <div class="dropdown-search">
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
      </div>
      <span>See program guide for eligible expenses</span>
    `;
  }
}
