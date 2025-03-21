import flatpickr from 'flatpickr';
import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('date-field')
class DateField extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: String }) inputValue: string = '';
  @property() customStyle = '';
  @property({ type: String }) fieldLabel: string = '';

  emitEvent() {
    let event = new CustomEvent('onChangeDateField', {
      detail: {
        message: 'Date field value has changed',
        // @ts-ignore
        id: this.id,
        value: this.inputValue,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  handleEmitEvent(event: Event) {
    const { target } = event;
    if (target) this.inputValue = (target as HTMLSelectElement).value ?? '';
    this.emitEvent();
  }

  firstUpdated() {
    flatpickr(this.inputElement, {
      dateFormat: 'M-d-Y',
      onChange: (selectedDates, dateStr) => {
        console.log('Selected:', dateStr);
        this.dispatchEvent(
          new CustomEvent('date-change', {
            detail: { date: dateStr },
            bubbles: true,
            composed: true,
          })
        );
      },
    });
  }

  render() {
    return html`
      <style>
        input {
          line-height: 1.42857;
          padding: 6px 12px;
          background-color: #fff;
          border: 1px solid #caced1;
          border-radius: 0.25rem;
          color: #000;
          font-size: 15px;
        }
      </style>
      <div>
        ${this.fieldLabel?.length
          ? html`<span>
              ${this.fieldLabel}${this.required
                ? html`<span style="color: red;">*</span>`
                : ''}
            </span>`
          : html``}
      </div>
      <input
        class="date-field"
        style=${unsafeCSS(this.customStyle)}
        id="inputElement"
        type="text"
        placeholder="Select date"
        .value=${this.inputValue || ''}
        @change=${this.handleEmitEvent}
      />
    `;
  }
}
