import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import store from '../store';

@customElement('percentage-input')
class PercentageInput extends LitElement {
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @property({ type: String, reflect: true }) id: string = crypto.randomUUID();
  @property({ type: String }) inputValue: string = '0.00';
  @property({ type: Boolean }) allowNegatives: boolean = true;
  @property({ type: Number }) maxValue: number = 100;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: String }) mappedFieldId: string = '';

  firstUpdated(props: Map<string, string>): void {
    if (props.has('inputValue') && this.inputElement) {
      this.inputElement?.dispatchEvent(new Event('blur'));
    }
    if (props.has('mappedFieldId') && this.id) {
      store.dispatch('addFieldData', {
        name: this.mappedFieldId,
        id: this.id,
      });
    }
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    super.attributeChangedCallback(name, oldval, newval);
    if (name === 'inputvalue' && this.inputElement && newval) {
      this.inputElement.value = newval;
      this.inputElement.dispatchEvent(new Event('blur'));
    }
  }

  emitEvent() {
    let event = new CustomEvent('onChangePercentageInput', {
      detail: {
        message: 'Percentage input value has changed',
        // @ts-ignore
        id: this.id,
        value: this.inputValue,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  handleInputChange(event: InputEvent) {
    let value = this.inputElement?.value;
    if (
      (event.inputType === 'deleteContentBackward' ||
        event.inputType === 'deleteContentForward') &&
      value === '%'
    ) {
      console.log('handleInputChange');
      if (this.inputElement) this.inputElement.value = '0%';
      this.inputValue = '0%';
      this.emitEvent();
      this.inputElement?.setSelectionRange(1, 1);
      return;
    }
    value = value?.replace(/[^\d]/g, '');
    if (value && parseInt(value) > this.maxValue) {
      value = '100';
    }
    console.log(`value: ${value}`);
    if (value) {
      value = `${parseInt(value)}%`;
      this.inputValue = value;
      if (this.inputElement) this.inputElement.value = value;
      this.inputElement?.setSelectionRange(value.length - 1, value.length - 1);
    }
    this.emitEvent();
  }

  // Add this function to handle the `beforeinput` event
  handleBeforeInput(event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    const keyPressed = event.data;

    // Get the current value and cursor position
    const cursorPosition = inputElement.selectionStart ?? 0;
    console.log(`cursorPosition: ${cursorPosition}`);
    const percentIndex = inputElement.value.indexOf('%');
    console.log(`percentIndex: ${percentIndex}`);
    console.log(`event.inputType: ${event.inputType}`);

    if (
      event.inputType === 'deleteContentBackward' &&
      cursorPosition > percentIndex
    ) {
      console.log('handleBeforeInput');
      this.inputElement?.setSelectionRange(percentIndex, percentIndex);
    }

    // 1. Block Delete key only if the cursor is to the left of the '%' symbol
    if (
      event.inputType === 'deleteContentForward' &&
      cursorPosition >= percentIndex
    ) {
      event.preventDefault();
      return false;
    }

    // 2. Allow only numeric characters (0-9)
    const allowedCharacters = '0123456789';
    if (
      event.inputType === 'insertText' &&
      keyPressed &&
      !allowedCharacters.includes(keyPressed)
    ) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  // Add this function to handle the `input` event
  handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart ?? 0;
    const percentIndex = inputElement.value.indexOf('%');

    // Ensure the cursor never moves past the '%' symbol
    if (percentIndex !== -1 && cursorPosition > percentIndex) {
      inputElement.setSelectionRange(percentIndex, percentIndex);
    }
  }

  handleInputFocus(event: Event) {
    if (this.inputElement?.value) {
      // Use setTimeout to ensure cursor placement occurs after focus event handling
      setTimeout(() => {
        // Remove % temporarily for correct length calculation
        const valueWithoutSymbol = this.inputElement.value.replace('%', '');

        // Restore % symbol to the end and set the cursor just before it
        this.inputElement.value = valueWithoutSymbol + '%';
        this.inputElement.setSelectionRange(
          valueWithoutSymbol.length,
          valueWithoutSymbol.length
        );
      }, 0); // Delay by 0ms to execute after focus processing
    }
  }

  render() {
    return html`
      <style>
        .percentage-input {
          position: relative;
          display: inline-block;
          width: 98%;
          ${!this.readOnly
          ? css``
          : css`
              cursor: not-allowed;
            `}
        }

        .form-control {
          width: 97%;
          line-height: 1.42857;
          padding: 6px 12px;
          background-color: #fff;
          border: 1px solid #caced1;
          border-radius: 0.25rem;
          color: #000;
          font-size: 15px;
          ${!this.readOnly
          ? css``
          : css`
              pointer-events: none;
              background-color: #f0f0f0;
            `}
        }
      </style>
      <div class="percentage-input">
        <input
          id="inputElement"
          type="text"
          placeholder="0%"
          class="form-control"
          .value=${this.inputValue}
          @input=${this.handleInputChange}
          @beforeinput=${this.handleBeforeInput}
          @focus=${this.handleInputFocus}
          @blur=${this.handleInputChange}
        />
      </div>
    `;
  }
}
