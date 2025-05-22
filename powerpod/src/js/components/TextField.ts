import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('text-field')
class TextField extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: String }) inputValue: string = '';
  @property({ type: String }) errorMessage: string = '';
  @property() customStyle = '';
  @property({ type: Boolean }) readOnly = false;
  @property({ type: String }) fieldLabel: string = '';
  @property({ type: Number }) maxLength: number | undefined;
  @property({ type: Function }) validation?: (value: string) => string;

  firstUpdated() {
    if (this.validation && typeof this.validation === 'function') {
      this.errorMessage = this.validation(this.inputValue);
    }
  }

  emitEvent() {
    let event = new CustomEvent('onChangeTextField', {
      detail: {
        message: 'Text field value has changed',
        // @ts-ignore
        id: this.id,
        value: this.inputValue,
        errorMessage: this.errorMessage,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  handleEmitEvent(event: Event) {
    const { target } = event;
    if (target) {
      this.inputValue = (target as HTMLSelectElement).value ?? '';

      if (this.validation && typeof this.validation === 'function') {
        this.errorMessage = this.validation(this.inputValue);
      }
    }
    this.emitEvent();
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
          ${!this.readOnly
          ? css`
              font-size: 15px;
            `
          : css`
              pointer-events: none;
            `}
        }
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
        <input
          class="text-field"
          style=${unsafeCSS(this.customStyle)}
          id="inputElement"
          type="text"
          .value=${this.inputValue || ''}
          maxlength=${this.maxLength ?? ''}
          @change=${this.handleEmitEvent}
        />
        <p id="errorMessage" class="error-message">
          ${this.errorMessage || ''}
        </p>
      </div>
    `;
  }
}
