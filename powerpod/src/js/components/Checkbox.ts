import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('quartech-checkbox')
class Checkbox extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: String }) inputValue: string = 'false';
  @property() customStyle = '';
  @property({ type: Boolean }) readOnly = false;

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    super.attributeChangedCallback(name, oldval, newval);
    if (name === 'inputvalue' && this.inputElement) {
      if (newval === 'false') {
        this.inputElement.removeAttribute('checked');
        this.inputValue = 'false';
      } else if (newval === 'true') {
        this.inputElement.setAttribute('checked', 'true');
        this.inputValue = 'true';
      }
      this.requestUpdate();
    }
  }

  emitEvent() {
    let event = new CustomEvent('onChangeCheckbox', {
      detail: {
        message: 'Checkbox value has changed',
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
    if (target) {
      this.inputValue = (target as HTMLSelectElement).checked;
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
          font-size: 15px;
        }
      </style>
      ${this.inputValue === 'true'
        ? html`<input
            class="quartech-checkbox"
            style=${unsafeCSS(this.customStyle)}
            id="inputElement"
            type="checkbox"
            @click=${this.handleEmitEvent}
            checked="true"
          />`
        : html`<input
            class="quartech-checkbox"
            style=${unsafeCSS(this.customStyle)}
            id="inputElement"
            type="checkbox"
            @click=${this.handleEmitEvent}
          />`}
    `;
  }
}
