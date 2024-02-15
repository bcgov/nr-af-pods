import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('text-field')
class TextField extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: String }) inputValue: string = '';

  firstUpdated(props: Map<string, string>): void {
    if (props.has('selectedValue') && this.inputElement) {
      this.inputElement.value = this.inputValue || '';
    }
  }

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

  render() {
    return html`
      <input
        style="width: 100%;"
        id="inputElement"
        type="text"
        .value=${this.inputValue}
        @change=${(event: Event) => {
          const { target } = event;
          if (target)
            this.inputValue = (target as HTMLSelectElement).value ?? '';
          this.emitEvent();
        }}
      />
    `;
  }
}
