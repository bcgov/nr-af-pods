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
    value = value?.replace(/[^\d]/g, '');
    if (value && parseInt(value) > this.maxValue) {
      value = '100';
    }
    if (this.inputElement) this.inputElement.value = value ?? '';
    this.inputValue = value ?? '';
    this.emitEvent();
  }

  // Add this function to handle the `beforeinput` event
  handleBeforeInput(event: InputEvent) {
    const keyPressed = event.data;

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

  render() {
    return html`
      <style>
        .percentage-input {
          position: relative;
          display: inline-flex;
          align-items: stretch;
          width: 100%;
          ${!this.readOnly
          ? css``
          : css`
              cursor: not-allowed;
            `}
        }

        .percentage-input input {
          padding-right: 5px; /* Remove extra padding for % */
          height: 100%; /* Ensure input height matches the container */
        }

        .percentage-input:after {
          content: "%";
          color: #000;
          background-color: whitesmoke; /* Add background color */
          height: auto; /* Allow :after to stretch to the parent's height */
          display: flex;
          align-items: center; /* Center the % symbol vertically */
          border: 1px solid #949494; /* Border around the % symbol */
          padding: 0 8px; /* Adjust padding for better alignment */
          box-sizing: border-box; /* Ensure padding doesn’t affect size */
          pointer-events: none;
          border-left: 0px;
        }

        .form-control {
          width: 100%;
          line-height: 1.42857;
          padding: 6px 12px;
          background-color: #fff;
          border: 1px solid #949494;
          border-radius: 0px;
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
          placeholder="0"
          class="form-control"
          ?disabled=${this.readOnly}
          .value=${this.inputValue}
          @input=${this.handleInputChange}
          @beforeinput=${this.handleBeforeInput}
        />
      </div>
    `;
  }
}
