import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getCommoditiesData } from '../common/fetch';
import { Commodities, processCommoditiesData } from '../common/commodities';
import { useScript } from '../common/scripts';

interface HTMLChosenElement extends JQuery<HTMLElement> {
  chosen: () => void;
}

@customElement('commodities-multiselect')
class CommoditiesMultiSelect extends LitElement {
  // unique identifier so no 2 components have the same id in the DOM
  @property({ type: String }) id: string = crypto.randomUUID();
  @property({ type: Object }) commodities?: Commodities;
  @property({ type: String, reflect: true }) selectedValues: string = '';
  @property({ type: Boolean }) loaded: boolean = false;

  // needed for jQuery
  createRenderRoot() {
    return this;
  }

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();
    this.getCommodities();
  }

  // only update the elements once chosen is loaded
  updated(props: Map<string, string>) {
    if (this.loaded && props.has('selectedValues')) {
      this.updateChosen();
    }
  }

  async getCommodities() {
    const { data } = await getCommoditiesData();
    if (!data) {
      throw new Error('Commodities task failed');
    }
    console.log(data);
    this.commodities = processCommoditiesData(data);
    console.log(this.commodities);
    this.generateOptions(this.commodities);
    useScript('chosen', this.setupChosen(this));
  }

  generateOptions(commodities: Commodities) {
    Object.keys(commodities).forEach((categoryName) => {
      const group = $('<optgroup label="' + categoryName + '" />');
      commodities[categoryName].forEach((commodity) => {
        $(`<option value="${commodity.name}"/>`)
          .html(commodity.name)
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
      const newSelectedCommodities = $(`#${this.id}`).val();
      const selectedCommoditiesString = (
        newSelectedCommodities as string[]
      )?.join(', ');
      context.selectedValues = selectedCommoditiesString || '';
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
        data-placeholder="Select commodities"
        class="chosen-select"
        style="display:none;"
        multiple
        tabindex="6"
      />
    `;
  }
}
