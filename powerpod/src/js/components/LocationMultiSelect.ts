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
  @property({ type: String, reflect: true }) selectedvalues: string = '';
  @property({ type: Boolean }) loaded: boolean = false;
  @property() onSelect = () => {};

  attributeChangedCallback(name, oldval, newval) {
    console.log('attribute change: ', name, newval);
    super.attributeChangedCallback(name, oldval, newval);
  }

  createRenderRoot() {
    return this;
  }
  updated(props: Map<string, string>) {
    console.log(this.onSelect);
    if (!this.loaded) {
      useScript('chosen', () => {
        this.municipals && this.generateOptions(this.municipals);
        // @ts-ignore
        $(`#${this.id}`).chosen();

        if (props.has('selectedvalues')) {
          $(`#${this.id}`).val(this.selectedvalues.split(', '));
          $(`#${this.id}`).trigger('chosen:updated');
        }
        // update dynamics field value on change of chosen field
        $(`#${this.id}`).on('change', function () {
          const newSelectedLocations = $(`#${this.id}`).val();
          // @ts-ignore
          const selectedLocationsString = newSelectedLocations?.join(', ');
          // @ts-ignore
          this.selectedValues = selectedLocationsString || '';
          // @ts-ignore
          this.onSelect(this.selectedValues);
        });
      });
      this.loaded = true;
    } else if (props.has('selectedvalues')) {
      $(`#${this.id}`).val(this.selectedvalues.split(', '));
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
    console.log('generating options');
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
    console.log('rendering');
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
