import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMunicipalData } from '../common/fetch';
import { Municipals, processLocationData } from '../common/locations';
import { useScript } from '../common/scripts';

interface HTMLChosenElement extends JQuery<HTMLElement> {
  chosen: () => void;
}

@customElement('location-multiselect')
class LocationMultiSelect extends LitElement {
  // unique identifier so no 2 components have the same id in the DOM
  @property({ type: String }) id: string = crypto.randomUUID();
  @property({ type: Object }) municipals?: Municipals;
  @property({ type: String, reflect: true }) selectedValues: string = '';
  @property({ type: Boolean }) loaded: boolean = false;

  // needed for jQuery
  createRenderRoot() {
    return this;
  }

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();
    this.getMunicipals();
  }

  // only update the elements once chosen is loaded
  updated(props: Map<string, string>) {
    if (this.loaded && props.has('selectedValues')) {
      this.updateChosen();
    }
  }

  async getMunicipals() {
    const data = await getMunicipalData({ async: true, returnData: true });
    if (!data) {
      throw new Error('Locations task failed');
    }
    this.municipals = processLocationData(data);
    this.generateOptions(this.municipals);
    useScript('chosen', this.setupChosen(this));
  }

  generateOptions(municipals: Municipals) {
    Object.keys(municipals).forEach((regionalDistrictName) => {
      const group = $('<optgroup label="' + regionalDistrictName + '" />');
      municipals[regionalDistrictName].forEach((municipalName) => {
        $(`<option value="${municipalName}"/>`)
          .html(municipalName)
          .appendTo(group);
      });
      group.appendTo($(`#${this.id}`));
    });
  }

  setupChosen(context: this) {
    return () => {
      ($(`#${context.id}`) as HTMLChosenElement).chosen();

      // set initial chosen values, if any
      context.updateChosen();

      // update dynamics field value on change of chosen field
      $(`#${context.id}`).on('change', context.handleOnChange(this));

      context.loaded = true;
    };
  }

  updateChosen() {
    $(`#${this.id}`).val(this.selectedValues.split(', '));
    $(`#${this.id}`).trigger('chosen:updated');
  }

  handleOnChange(context: this) {
    return () => {
      const newSelectedLocations = $(`#${this.id}`).val();
      const selectedLocationsString = (newSelectedLocations as string[])?.join(
        ', '
      );
      context.selectedValues = selectedLocationsString || '';
      context.emitEvent();
    };
  }

  // so we can listen for changes outside of this component
  emitEvent() {
    let event = new CustomEvent('onChangeSelectedValues', {
      detail: {
        message: 'Selected values have changed',
        id: this.id,
        value: this.selectedValues,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <select
        id=${this.id}
        data-placeholder="Select locations"
        class="chosen-select"
        style="display:none;"
        multiple
        tabindex="6"
      />
    `;
  }
}
