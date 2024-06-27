import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('text-field')
class TextField extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: String }) inputValue: string = '';
  @property() customStyle = '';
  @property({ type: Boolean }) readOnly = false;

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
      <input
        class="text-field"
        style=${unsafeCSS(this.customStyle)}
        id="inputElement"
        type="text"
        .value=${this.inputValue || ''}
        @change=${this.handleEmitEvent}
      />
    `;
  }
}
