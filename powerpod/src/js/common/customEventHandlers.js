import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';
import { HtmlElementType } from './constants.js';
import { setFieldValue } from './html.js';
import store from '../store/index.js';
import { getFormId } from './form.js';
import { getApplicationData } from './fetch.js';

POWERPOD.customEventHandlers = {
  genericEventHandler,
  hasCraNumberCheckboxEventHandler,
  customFieldEventHandler,
  handleIsBusinessContactInfoDropdownChangeHandler,
};

const logger = Logger('common/customEventHandlers');

export function genericEventHandler(name) {
  return (event, customElement) => {
    logger.info({
      fn: genericEventHandler,
      message: `Detected generic event handler for name: ${name}`,
      data: { name, event, customElement },
    });
    const value = event.detail.value;
    logger.info({
      fn: hasCraNumberCheckboxEventHandler,
      message: `Setting attribute for name: ${name}, inputvalue: ${value}`,
      data: { name, event, customElement },
    });
    // @ts-ignore
    setFieldValue({
      name,
      value: `${value}`,
    });
  };
}

export function customFieldEventHandler(name) {
  return (event, customElement) => {
    logger.info({
      fn: customFieldEventHandler,
      message: `Detected generic event handler for name: ${name}`,
      data: { name, event, customElement },
    });
    const value = event.detail.value;
    logger.info({
      fn: customFieldEventHandler,
      message: `Setting attribute for name: ${name}, inputvalue: ${value}`,
      data: { name, event, customElement },
    });
    store.dispatch('addFieldData', {
      name,
      value,
    });
  };
}

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
    // @ts-ignore
    setFieldValue({
      name,
      value: !checked,
      elementType: HtmlElementType.Checkbox,
    });
  };
}

export function handleIsBusinessContactInfoDropdownChangeHandler(name) {
  return async (event, customElement) => {
    logger.info({
      fn: handleIsBusinessContactInfoDropdownChangeHandler,
      message: `Detected generic event handler for name: ${name}`,
      data: { name, event, customElement },
    });
    const value = event.detail.value;
    logger.info({
      fn: handleIsBusinessContactInfoDropdownChangeHandler,
      message: `Setting attribute for name: ${name}, inputvalue: ${value}`,
      data: { name, event, customElement },
    });
    store.dispatch('addFieldData', {
      name,
      value,
    });

    if (value === 'Yes') {
      const formId = getFormId();
      const applicationDataRes = await getApplicationData({ id: formId });

      if (!applicationDataRes?.data?.value?.[0]) {
        logger.error({
          fn: handleIsBusinessContactInfoDropdownChangeHandler,
          message: `Could not get application data result to determine whether individual or business`,
        });
      }

      const {
        quartech_businesssuitenumberoptional,
        quartech_businessstreetnumber,
        quartech_businessstreet,
        quartech_businesscity,
        quartech_businessprovinceterritory,
        quartech_businesspostalcode,
        quartech_email,
      } = applicationDataRes?.data?.value?.[0];

      logger.info({
        fn: handleIsBusinessContactInfoDropdownChangeHandler,
        message: `received the following data`,
        data: {
          quartech_businesssuitenumberoptional,
          quartech_businessstreetnumber,
          quartech_businessstreet,
          quartech_businesscity,
          quartech_businessprovinceterritory,
          quartech_businesspostalcode,
          quartech_email,
        },
      });

      // Mapping from personal to business field names
      const fieldMapping = {
        quartech_suitenumberoptional: 'quartech_businesssuitenumberoptional',
        quartech_streetnumber: 'quartech_businessstreetnumber',
        quartech_street: 'quartech_businessstreet',
        quartech_city2: 'quartech_businesscity',
        quartech_provinceterritory: 'quartech_businessprovinceterritory',
        quartech_postalcode: 'quartech_businesspostalcode',
        quartech_notificationemailaddress: 'quartech_email',
      };

      const values = {
        quartech_businesssuitenumberoptional,
        quartech_businessstreetnumber,
        quartech_businessstreet,
        quartech_businesscity,
        quartech_businessprovinceterritory,
        quartech_businesspostalcode,
        quartech_email,
      };

      // Loop and set personal field values using corresponding business values
      Object.entries(fieldMapping).forEach(
        ([personalFieldName, businessFieldName]) => {
          // @ts-ignore
          const value = values[businessFieldName];
          // @ts-ignore
          setFieldValue({ name: personalFieldName, value });
        }
      );
    } else if (value === 'No') {
      const personalFields = [
        'quartech_suitenumberoptional',
        'quartech_streetnumber',
        'quartech_street',
        'quartech_city2',
        'quartech_provinceterritory',
        'quartech_postalcode',
        'quartech_notificationemailaddress',
      ];

      // As per BUG 7058, do not clear these fields
      // personalFields.forEach((name) => {
      //   // @ts-ignore
      //   setFieldValue({ name, value: '' });
      // });
    }
  };
}
