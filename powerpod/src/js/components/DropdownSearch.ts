import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type Option = string;

@customElement('dropdown-search')
class DropdownSearch extends LitElement {
  @property({ type: String }) id: string = crypto.randomUUID();
  @property({ type: Array }) options: Option[] = [];
  @property({ type: String }) selectedValue: string = '';

  render() {
    return html`
      <select>
        <option value="SME Fee">SME Fee</option>
        <option value="Facilitator Fee">Facilitator Fee</option>
        <option value="SME/Facilitator Travel"/>SME/Facilitator Travel</option>
      </select>
    `;
  }
}
