import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task, TaskStatus } from '@lit/task';
import { getMunicipalData } from '../common/fetch';
import { Municipals, processLocationData } from '../common/locations';
import { useScript } from '../common/scripts';

@customElement('location-multiselect')
class LocationMultiSelect extends LitElement {
  @property({ type: String }) id: string = crypto.randomUUID();
  @property({ type: Object }) municipals?: Municipals;
  @property({ type: String, reflect: true }) selectedValues: string = '';
  @property({ type: Boolean }) loaded: boolean = false;

  createRenderRoot() {
    return this;
  }
  updated(props: Map<string, string>) {
    if (!this.loaded) {
      useScript('chosen', () => {
        this.municipals && this.generateOptions(this.municipals);
        // @ts-ignore
        $(`#${this.id}`).chosen();

        if (props.has('selectedValues')) {
          $(`#${this.id}`).val(this.selectedValues.split(', '));
          $(`#${this.id}`).trigger('chosen:updated');
        }
        // update dynamics field value on change of chosen field
        $(`#${this.id}`).on('change', function () {
          const newSelectedLocations = $(`#${this.id}`).val();
          // @ts-ignore
          const selectedLocationsString = newSelectedLocations?.join(', ');
          // @ts-ignore
          this.selectedValues = selectedLocationsString || '';
          let event = new CustomEvent('onChangeSelectedValues', {
            detail: {
              message: 'Selected values have changed',
              // @ts-ignore
              selectedValues: this.selectedValues,
            },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        });
      });
      this.loaded = true;
    } else if (props.has('selectedValues')) {
      $(`#${this.id}`).val(this.selectedValues.split(', '));
      $(`#${this.id}`).trigger('chosen:updated');
    }
  }
  private _municipalsTask = new Task(this, {
    task: async ([]) => {
      const data = await getMunicipalData({ async: true, returnData: true });
      if (!data) {
        throw new Error('Locations task failed');
      }
      this.municipals = processLocationData(data);
    },
    args: () => [],
  });
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
  render() {
    return this._municipalsTask.render({
      pending: () => html` <div>Loading...</div> `,
      complete: () => {
        return html`
          <select
            id=${this.id}
            data-placeholder="Select locations"
            class="chosen-select"
            multiple
            tabindex="6"
          />
        `;
      },
    });
  }
}
