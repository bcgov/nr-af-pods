import flatpickr from 'flatpickr';
import shoelace from '../../assets/css/shoelace.css';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('date-multiselect')
class DateMultiSelect extends LitElement {
  @query('#selectElement') selectElement: HTMLSelectElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: String }) errorMessage: string = '';
  @property({ type: String, reflect: true }) inputValue: string = '';
  @property({ type: Array, reflect: true }) selectedOptions: string[] = [];
  @property({ type: Array, reflect: true }) options: string[] = [];
  @property({ type: String }) additionalTextBelowField: string = '';
  @property({ type: String }) fieldLabel: string = '';
  @property({ type: Object }) lookupMap: Map<string, string> = new Map();
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Function }) validation?: (value: string) => string;
  // @property({ type: Function }) validation?: (value: string) => string = (
  //   inputValue
  // ) => {
  //   if (inputValue === '' || !inputValue?.length) {
  //     return 'This field is required.';
  //   }
  //   return '';
  // };

  emitEvent() {
    this.inputValue = this.mapToOriginalString(this.selectedOptions);
    if (this.validation && typeof this.validation === 'function') {
      this.errorMessage = this.validation(this.inputValue);
    }
    const customEvent = new CustomEvent('onChangeDateMultiSelectValues', {
      detail: {
        id: this.id,
        message: 'Date multiselect value has changed',
        value: this.inputValue,
        selectedOptions: this.selectedOptions,
        options: this.options,
        errorMessage: this.errorMessage,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(customEvent);
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    super.attributeChangedCallback(name, oldval, newval);
    if (name === 'inputvalue' && this.selectElement && newval) {
      this.parseAndSelectDates(this.inputValue);
    }
  }

  static styles = css`
    sl-select::part(tag__base) {
      font-size: 15px;
    }
    sl-option::part(base) {
      font-size: 15px;
    }
    sl-dropdown::part(popup) {
      display: none !important;
    }
    sl-select::part(listbox) {
      display: none !important;
    }
    sl-select::part(expand-icon) {
      display: none !important;
    }
    ${unsafeCSS(shoelace)}
  `;

  private addAndSelectOption(option: string) {
    // Validate format: n/j/Y (e.g., 5/2/2025)
    const datePattern = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!datePattern.test(option)) {
      console.warn(`Invalid date format: ${option}`);
      return;
    }

    // Add to options if new
    if (!this.options.includes(option)) {
      // console.log('Option is new, updating options');
      this.options = [...this.options, option];
      this.lookupMap.set(option, option);
      this.generateOption(option); // Only generates template, doesn't attach
    }

    // Add to selectedOptions if not already selected
    if (!this.selectedOptions.includes(option)) {
      this.selectedOptions = [...this.selectedOptions, option];
      // console.log('Added to selectedOptions:', this.selectedOptions);
    } else {
      // console.log('Already selected, doing nothing.');
    }
  }

  private mapToOriginalString(slimmedArray: string[]): string {
    return slimmedArray
      .filter((option) => option !== null) // Remove any null values
      .join(', '); // Join the original values back into a single string
  }

  private parseAndSelectDates(dateString: string) {
    this.selectedOptions = [];
    const parsedDates = dateString
      .split(',')
      .map((date) => date.trim())
      .filter((date) => date.length > 0); // Ensures no empty strings

    parsedDates.forEach((date) => {
      this.addAndSelectOption(date);
    });

    // Force the update in the <sl-select> element
    if (this.selectElement) {
      (this.selectElement as any).value = [...this.selectedOptions];
    }
  }

  generateOption(value: string) {
    return html` <sl-option value=${value}>${value}</option> `;
  }

  // select elements behave funny, so we have to set the value ourselves
  // on the very first load of the component
  firstUpdated(props: Map<string, string>) {
    if (this.validation && typeof this.validation === 'function') {
      this.errorMessage = this.validation(this.inputValue);
    }
    if (this.selectElement) {
      flatpickr(this.selectElement, {
        dateFormat: 'n/j/Y',
        onChange: (selectedDates, dateStr) => {
          if (this.selectedOptions.includes(dateStr)) {
            // @ts-ignore
            this.selectElement.value = this.selectedOptions; // needed otherwise the selected values reset
            return;
          } else {
            this.addAndSelectOption(dateStr);
            this.emitEvent();
          }
        },
      });
    }
    if (props.has('inputValue') && this.selectElement) {
      this.parseAndSelectDates(this.inputValue);
    }
    this.emitEvent();
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
          ${!this.errorMessage && !this.errorMessage?.length
          ? css`
              display: none;
            `
          : css`
              display: block;
            `}
        }
      </style>
      <div>
        <div>
          ${this.fieldLabel?.length
            ? html`<span>
                ${this.fieldLabel}${this.required
                  ? html`<span style="color: red;">*</span>`
                  : ''}
              </span>`
            : html``}
        </div>
        <sl-select
          id="selectElement"
          size="large"
          placeholder="Click to select date(s)"
          style="flex-grow: 0;"
          max-options-visible="0"
          .value=${this.selectedOptions}
          @sl-change=${(event: Event) => {
            const { target } = event;
            if (target) {
              const val = Array.isArray((target as HTMLSelectElement).value)
                ? (target as HTMLSelectElement).value
                : ((target as HTMLSelectElement).value as string)?.split(',') ??
                  [];
              console.log(val);
              if (Array.isArray(val)) {
                this.selectedOptions = val;
              }
            }
            this.emitEvent();
          }}
          multiple
          clearable
        >
          ${this.options.map((option) => this.generateOption(option))}
        </sl-select>
        <p id="errorMessage" class="error-message">
          ${this.errorMessage || ''}
        </p>
        <div>
          ${this.additionalTextBelowField?.length
            ? html`<span>${this.additionalTextBelowField}</span>`
            : html``}
        </div>
      </div>
    `;
  }
}
