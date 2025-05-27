import shoelace from '../../assets/css/shoelace.css';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('dropdown-multiselect')
class DropdownMultiselect extends LitElement {
  @query('#selectElement') selectElement: HTMLSelectElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: Array }) options: string[] = [];
  @property({ type: String }) selectedValues: string = '';
  @property({ type: String }) additionalTextBelowField: string = '';
  @property({ type: String }) fieldLabel: string = '';
  @property({ type: Array }) slimmedOptions: string[] = [];
  @property({ type: Object }) lookupMap: Map<string, string> = new Map();
  @property({ type: String }) selectedOptions: string[] = [];
  @property({ type: String }) errorMessage: string = '';
  @property({ type: Boolean }) readOnly = false;

  static styles = css`
    sl-select::part(tag__base) {
      font-size: 15px;
    }
    sl-option::part(base) {
      font-size: 15px;
    }
    ${unsafeCSS(shoelace)}
  `;

  private slimOption(option: string): string {
    // Normalize option by:
    // - Removing non-alpha characters, except for hyphens and spaces.
    // - Replacing spaces with hyphens.
    return option
      .toLowerCase()
      .replace(/[^a-z-\s]/g, '') // Remove non-alphabetic characters, except hyphens and spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/,/g, ''); // Remove commas completely (or replace if needed)
  }

  private createLookupMap(options: string[]): Map<string, string> {
    const lookupMap = new Map<string, string>();
    options.forEach((option) => {
      lookupMap.set(this.slimOption(option), option);
    });
    return lookupMap;
  }

  private restoreOption(slimmedOption: string): string | null {
    return this.lookupMap.get(slimmedOption) || null;
  }

  private mapToOriginalString(slimmedArray: string[]): string {
    return slimmedArray
      .map((slimmedOption) => this.restoreOption(slimmedOption)) // Call restoreOption with each slimmed option
      .filter((option) => option !== null) // Remove any null values
      .join(', '); // Join the original values back into a single string
  }

  generateOption(value: string) {
    return html` <sl-option value=${this.slimOption(value)}>${value}</option> `;
  }

  // select elements behave funny, so we have to set the value ourselves
  // on the very first load of the component
  firstUpdated(props: Map<string, string>) {
    if (props.has('selectedOptions') && this.selectElement) {
      // this.selectElement.value = this.selectedOptions;
    }
    if (props.has('options') && this.selectElement) {
      this.lookupMap = this.createLookupMap(this.options);
    }
  }

  emitEvent() {
    const customEvent = new CustomEvent('onChangeDropdownMultiselectValues', {
      detail: {
        id: this.id,
        message: 'Dropdown multiselect value has changed',
        value: this.mapToOriginalString(this.selectedOptions),
        selectedOptions: this.selectedOptions,
        errorMessage: this.errorMessage,
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
          position:absolute;
          color: #e23636;
          padding: 0px;
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
            ? html`<span>
                ${this.fieldLabel}${this.required
                  ? html`<span style="color: red;">*</span>`
                  : ''}
              </span>`
            : html``}
        </div>
        ${!this.readOnly
          ? html`
              <sl-select
                id="selectElement"
                size="large"
                style="flex-grow: 0;"
                .value=${this.selectedOptions}
                @sl-change=${(event: Event) => {
                  const { target } = event;
                  if (target) {
                    const val = Array.isArray(
                      (target as HTMLSelectElement).value
                    )
                      ? (target as HTMLSelectElement).value
                      : ((target as HTMLSelectElement).value as string)?.split(
                          ','
                        ) ?? [];
                    if (Array.isArray(val)) {
                      this.selectedOptions = val;
                    }
                  }
                  this.emitEvent();
                }}
                multiple
                clearable
              >
                ${this.options
                  ?.sort((a, b) => {
                    if (a === 'Other Costs') return 1; // Push "Other Costs" to the end
                    if (b === 'Other Costs') return -1; // Push "Other Costs" to the end
                    return a.localeCompare(b); // Sort alphabetically
                  })
                  .map((option) => this.generateOption(option))}
              </sl-select>
            `
          : html`
              <sl-select
                disabled
                id="selectElement"
                size="large"
                style="flex-grow: 0;"
                .value=${this.selectedOptions}
                multiple
                clearable
              >
                ${this.options
                  ?.sort((a, b) => {
                    if (a === 'Other Costs') return 1; // Push "Other Costs" to the end
                    if (b === 'Other Costs') return -1; // Push "Other Costs" to the end
                    return a.localeCompare(b); // Sort alphabetically
                  })
                  .map((option) => this.generateOption(option))}
              </sl-select>
            `}
        <div>
          ${this.errorMessage && !this.readOnly
            ? html`
                <p id="errorMessage" class="error-message">
                  ${this.errorMessage || ''}
                </p>
              `
            : html``}
          ${this.additionalTextBelowField?.length
            ? html`<span>${this.additionalTextBelowField}</span>`
            : html``}
        </div>
      </div>
    `;
  }
}
