import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('text-field')
class TextField extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: String }) inputValue: string = '';
  @property() customStyle = '';
  @property({ type: Boolean }) readOnly = false;
  @property({ type: String }) fieldLabel: string = '';
  @property({ type: Number }) maxLength: number | undefined;

  emitEvent() {
    let event = new CustomEvent('onChangeTextField', {
      detail: {
        message: 'Text field value has changed',
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
        class="text-field"
        style=${unsafeCSS(this.customStyle)}
        id="inputElement"
        type="text"
        .value=${this.inputValue || ''}
        maxlength=${this.maxLength ?? ''}
        @change=${this.handleEmitEvent}
      />
    `;
  }
}
