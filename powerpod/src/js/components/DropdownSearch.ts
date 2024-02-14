import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type Option = string;

@customElement('dropdown-search')
class DropdownSearch extends LitElement {
  @property()
  id: string = crypto.randomUUID();
  options?: Option[];

  createRenderRoot() {
    return this;
  }

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
