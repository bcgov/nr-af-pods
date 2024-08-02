import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';
import { HtmlElementType } from './constants.js';
import { setFieldValue } from './html.js';

POWERPOD.customEventHandlers = {
  hasCraNumberCheckboxEventHandler,
};

const logger = Logger('common/customEventHandlers');

export function hasCraNumberCheckboxEventHandler(name) {
  return (event, customElement) => {
    logger.info({
      fn: hasCraNumberCheckboxEventHandler,
      message: `Detected custom event handler for name: ${name}`,
      data: { name, event, customElement },
    });
    const checked = event.detail.value;
    logger.info({
      fn: hasCraNumberCheckboxEventHandler,
      message: `Setting attribute for name: ${name}, checked: ${checked}`,
      data: { name, event, customElement },
    });
    customElement.setAttribute('inputvalue', checked);
    // set reverse value for dynamics field
    setFieldValue(name, !checked, HtmlElementType.Checkbox);
  };
}
