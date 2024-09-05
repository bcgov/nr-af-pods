import { doc, POWERPOD } from './constants';
import { getControlType, getControlValue } from './html';
import { Logger } from './logger';

const logger = Logger('common/components');

POWERPOD.components = {
  renderCustomComponent,
};

// this accepts an id of an existing dynamics field
// and re-renders a custom component in its place
// the custom component will update the dynamics field
// via the listener available from the component
// 1. Hide existing field
// 2. Insert custom component (reading initial value from existing field)
// 3. Configure event listener to set existing field value
export function renderCustomComponent(params) {
  const {
    fieldId,
    customElementTag,
    attributes = {},
    customEvent,
    customEventHandler = () => {},
    mappedValueKey, // internal element property that should map to the dynamics field, e.g. in this case "rows" maps to quartech_eligibleexpenses
    initValuesFn, // additional function to load initial values
    customSetupFn,
  } = params;
  logger.info({
    fn: renderCustomComponent,
    message: `Start adding custom component: ${customElementTag}`,
    data: { params },
  });
  if (!$(`#${fieldId}`)) {
    logger.error({
      fn: renderCustomComponent,
      message: `Failed to add custom element, could not find fieldId: ${fieldId}`,
    });
    return;
  }

  const fieldControlDiv = $(`#${fieldId}`).closest('div');

  const customElement = doc.createElement(customElementTag);

  Object.keys(attributes).forEach((key) => {
    const val = attributes[key];
    customElement.setAttribute(key, val);
  });

  $(fieldControlDiv)?.before(customElement);

  // hide dynamics field
  $(`#${fieldId}`).css({ display: 'none' });

  customElement.addEventListener(customEvent, (event) => {
    logger.info({
      fn: renderCustomComponent,
      message: `Detected event from custom element: ${customElementTag}`,
      data: { event, customElement, params },
    });
    customEventHandler(event, customElement);
  });

  logger.info({
    fn: renderCustomComponent,
    message: `Successfully added custom component: ${customElementTag}`,
    data: { params },
  });

  let existingValue = null;
  const tr = document.getElementById(fieldId)?.closest('tr');
  existingValue = getControlValue({
    controlId: fieldId,
    tr,
    raw: true,
  });

  logger.info({
    fn: renderCustomComponent,
    message: `For fieldId: ${fieldId}, found existingValue: ${existingValue}`,
    data: { params, existingValue, tr },
  });

  if (existingValue !== null && existingValue !== '[]') {
    logger.info({
      fn: renderCustomComponent,
      message: `Setting existing value for mappedValueKey: ${mappedValueKey} to existingValue: ${existingValue}`,
      data: { params },
    });
    customElement.setAttribute(`${mappedValueKey}`, existingValue);
    if (initValuesFn) {
      initValuesFn(mappedValueKey, existingValue, customElement);
    }
  }

  if (customSetupFn) {
    customSetupFn();
  }

  return customElement;
}
