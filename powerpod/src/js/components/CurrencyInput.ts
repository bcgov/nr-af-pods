import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('currency-input')
class CurrencyInput extends LitElement {
  static styles = css`
    .input-icon {
      position: relative;
    }

    .input-icon > i {
      position: absolute;
      display: block;
      transform: translate(0, -50%);
      top: 50%;
      pointer-events: none;
      width: 25px;
      text-align: center;
      font-style: normal;
    }

    .input-icon > input {
      padding-left: 25px;
      padding-right: 0;
    }

    .input-icon-right > i {
      right: 0;
    }

    .input-icon-right > input {
      padding-left: 0;
      padding-right: 25px;
      text-align: right;
    }
  `;

  @query('#inputElement') inputElement: HTMLInputElement;
  @property({ type: String }) inputValue: string = '0.00';
  @property({ type: Boolean }) allowNegatives: boolean = true;
  @property({ type: Number }) maxValue: number | null = null;
  private cursorPosition: number = 0;
  private previousInputValue: string = '';

  firstUpdated(props): void {
    console.log(props);
    console.log(this.inputValue);
    console.log(this.inputElement.value);
    if (this.inputValue) {
      const event = new Event('blur', { bubbles: true, composed: true });
      this.inputElement.dispatchEvent(event);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    console.log('attribute change: ', name, newVal);
    super.attributeChangedCallback(name, oldVal, newVal);
  }

  // Method to format currency input for real-time input
  private formatCurrencyInput(inputValue: string): string {
    // Remove non-numeric characters
    const numericValue = inputValue.replace(/[^\d.-]/g, '');

    // Check if there are more than 2 decimal places
    const decimalIndex = numericValue.indexOf('.');
    if (decimalIndex !== -1) {
      const numDecimalPlaces = numericValue.length - decimalIndex - 1;
      if (numDecimalPlaces > 2) {
        // If more than 2 decimal places, keep only 2 decimal places
        return numericValue.slice(0, decimalIndex + 3);
      }
    }

    return numericValue;
  }

  // Method to format currency input for blur event
  private formatCurrencyOnBlur(inputValue: string): string {
    // Remove any non-numeric characters except for decimals and negative signs
    let cleanedValue = inputValue.replace(/[^0-9.-]/g, '');

    // If negative values are not allowed, remove all negative signs
    if (!this.allowNegatives) {
      cleanedValue = cleanedValue.replace(/-/g, '');
    }

    // Convert to float and format with 2 decimal places
    const floatValue = parseFloat(cleanedValue || '0');
    const formattedValue = floatValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formattedValue;
  }

  handleInputChange(event: InputEvent) {
    if (event.inputType !== 'insertText') {
      return;
    }
    const inputElement = event.target as HTMLInputElement;
    this.cursorPosition = inputElement.selectionStart || 0;

    let formattedValue = this.formatCurrencyInput(inputElement.value);

    // Handle replacing the first decimal place without affecting the second one
    if (formattedValue.includes('.')) {
      const secondDecimalPosition = formattedValue.indexOf('.') + 2;
      if (this.cursorPosition === secondDecimalPosition) {
        const prevSecondDecimalValue = this.previousInputValue.charAt(
          secondDecimalPosition
        );
        formattedValue =
          formattedValue.substring(0, secondDecimalPosition) +
          prevSecondDecimalValue;
      }
    }

    this.previousInputValue = formattedValue;
    inputElement.value = formattedValue;
    this.inputValue = formattedValue;

    // Adjust cursor position after input change
    inputElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
  }

  handleInputFocus(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.cursorPosition = inputElement.selectionStart || 0;

    // Remove comma separators for editing
    inputElement.value = inputElement.value.replace(/,/g, '');

    // Calculate the new cursor position after removing commas
    const commasRemoved = (
      inputElement.value.substring(0, this.cursorPosition).match(/,/g) || []
    ).length;
    this.cursorPosition -= commasRemoved;

    // Adjust cursor position after removing commas
    inputElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
  }

  handleInputBlur(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const formattedValue = this.formatCurrencyOnBlur(inputElement.value);
    inputElement.value = formattedValue;
    this.inputValue = formattedValue;
  }

  handleBeforeInput(event: InputEvent) {
    if (event.inputType !== 'insertText') {
      return true;
    }

    const keyPressed = event.data;

    const allowedCharacters = `0123456789.${this.allowNegatives ? '-' : ''}`;

    if (keyPressed && !allowedCharacters.includes(keyPressed)) {
      event.preventDefault();
      return false;
    }

    const inputElement = event.target as HTMLInputElement;
    this.cursorPosition = inputElement.selectionStart || 0;

    // If entire input is selected, allow input to proceed as it wil be overwritten
    if (
      inputElement.selectionStart === 0 &&
      inputElement.selectionEnd === inputElement.value.length
    ) {
      return true;
    }

    // If there's an existing '-' and it's to the right of the cursor
    // simply move the cursor over to the right, as well as prevent input
    if (
      keyPressed === '-' &&
      (this.cursorPosition !== 0 || inputElement.value.includes('-'))
    ) {
      const negativeSignIndex = inputElement.value.indexOf('-');
      if (this.cursorPosition === negativeSignIndex) {
        inputElement.setSelectionRange(
          this.cursorPosition + 1,
          this.cursorPosition + 1
        );
      }
      event.preventDefault();
      return false;
    }

    // If there's an existing '.' point and it's to the right of the cursor
    // simply move the cursor over to the right, as well as prevent input
    if (keyPressed === '.' && inputElement.value.includes('.')) {
      const decimalIndex = inputElement.value.indexOf('.');
      if (this.cursorPosition === decimalIndex) {
        inputElement.setSelectionRange(
          this.cursorPosition + 1,
          this.cursorPosition + 1
        );
      }
      event.preventDefault();
      return false;
    }
  }

  render() {
    return html`
      <div class="input-icon">
        <input
          id="inputElement"
          type="text"
          class="form-control"
          .value=${this.inputValue}
          @input=${this.handleInputChange}
          @focus=${this.handleInputFocus}
          @blur=${this.handleInputBlur}
          @beforeinput=${this.handleBeforeInput}
        />
        <i>$</i>
      </div>
    `;
  }
}
