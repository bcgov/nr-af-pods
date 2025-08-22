import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('dropdown-search')
class DropdownSearch extends LitElement {
  @query('#selectElement') selectElement: HTMLSelectElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Array, reflect: true }) options: string[] = [];
  @property({ type: String }) selectedValue: string = '';
  @property({ type: String }) additionalTextBelowField: string = '';
  @property({ type: String }) fieldLabel: string = '';
  @property({ type: String }) placeholder: string = 'Select an option';
  @property({ type: String }) errorMessage: string = '';
  @property({ type: Boolean }) disabled: boolean = false;

  static styles = css`
    .dropdown-search {
      position: relative;
      margin-top: 18px;
    }

    select {
      line-height: 1.42857;
      font-size: 15px;
      appearance: none;
      /*  safari  */
      -webkit-appearance: none;
      /*  other styles for aesthetics */
      width: 100%;
      padding: 6px 20px 6px 12px;
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

    .placeholder-option {
      color: #999; /* Light gray */
    }

    select.placeholder {
      color: #999; /* Light gray when placeholder is shown */
    }

    option {
      color: #000; /* Ensure actual options show as black */
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
      <style>
        #errorMessage {
          margin: 0px;
          font-size: 13px;
          color: #e23636;
          padding: 0px;
          position: absolute;
          ${!this.errorMessage && !this.errorMessage.length
          ? css`
              display: none;
            `
          : css`
              display: block;
            `}
        }
      </style>
      <div style="display:flex; flex-direction:column;">
        <div>
          ${this.fieldLabel?.length
            ? html`<span>${this.fieldLabel}</span>`
            : html``}
        </div>
        <div class="dropdown-search">
          <select
            id="selectElement"
            .disabled=${this.disabled}
            .value=${this.selectedValue}
            @change=${(event: Event) => {
              const { target } = event;
              if (target)
                this.selectedValue = (target as HTMLSelectElement).value ?? '';
              this.emitEvent();
            }}
          >
            ${this.options
              ?.sort((a, b) => {
                if (a === 'Other Costs') return 1; // Push "Other Costs" to the end
                if (b === 'Other Costs') return -1; // Push "Other Costs" to the end
                return a.localeCompare(b); // Sort alphabetically
              })
              .map((option) => this.generateOption(option))}
            <option
              value=""
              disabled
              selected
              hidden
              class="placeholder-option"
            >
              ${this.placeholder}
            </option>
          </select>
        </div>
        <div>
          ${this.additionalTextBelowField?.length
            ? html`<span style="font-size:13px;"
                >${this.additionalTextBelowField}${this.errorMessage.length
                  ? html`<p id="errorMessage" class="error-message">
                      ${this.errorMessage}
                    </p>`
                  : ''}</span
              >`
            : html``}
        </div>
      </div>
    `;
  }
}
