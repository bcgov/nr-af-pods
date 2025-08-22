import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';
import { HtmlElementType } from './constants.js';
import { setFieldValue } from './html.js';

POWERPOD.initValuesFns = {
  initCraNumberCheckbox,
};

const logger = Logger('common/initValuesFn');

export function initCraNumberCheckbox(
  mappedValueKey,
  existingValue,
  customElement
) {
  customElement.setAttribute(`${mappedValueKey}`, !existingValue);
  logger.info({
    fn: initCraNumberCheckbox,
    message: `Successfully set custom Checkbox value for mappedValueKey: ${mappedValueKey}, existingValue: ${existingValue}, final value: ${!existingValue}`,
    data: { mappedValueKey, existingValue, customElement },
  });
}
