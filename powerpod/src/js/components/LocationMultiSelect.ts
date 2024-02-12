import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task, TaskStatus } from '@lit/task';
import { getMunicipalData } from '../common/fetch';
import { Municipals, processLocationData } from '../common/locations';
import { useScript } from '../common/scripts';

@customElement('location-multiselect')
class LocationMultiSelect extends LitElement {
  @property()
  municipals?: Municipals;

  createRenderRoot() {
    return this;
  }
  updated() {
    useScript('chosen', () => {
      this.municipals && this.generateOptions(this.municipals);
      // @ts-ignore
      $('.chosen-select').chosen();
    });
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
      group.appendTo($('#additionalLocationControl'));
    });
  }
  render() {
    return this._municipalsTask.render({
      pending: () => html` <div>Loading...</div> `,
      complete: () => {
        return html`
          <select
            id="additionalLocationControl"
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
