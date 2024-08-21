import store from '../store/index.js';
import { HtmlElementType, POWERPOD } from './constants.js';
import {
  copyFromFieldAToFieldB,
  hideFieldByFieldName,
  hideFieldRow,
  isHiddenRow,
  observeChanges,
  setFieldNameLabel,
  setFieldValue,
  showFieldRow,
} from './html.js';
import { Logger } from './logger.js';
import { isScriptFullyLoaded } from './scripts.js';

POWERPOD.onChangeHandlers = {
  populateBusinessNameOnChangeFirstOrLastNameVLB,
  setBusinessOrPersonalStateForVLB,
  populatePhoneNumberEmailAndCityOnChangeVLB,
};

const logger = Logger('common/onChangeHandlers');

export function setOnChangeHandler(fieldName, elemType, onChangeHandlerName) {
  const onChangeHandler = POWERPOD.onChangeHandlers[onChangeHandlerName];

  if (!onChangeHandler || typeof onChangeHandler !== 'function') {
    logger.error({
      fn: setOnChangeHandler,
      message: `Could not set onChangeHandler for fieldName: ${fieldName} with onChangeHandlerName: ${onChangeHandlerName}`,
    });
    return;
  }

  switch (elemType) {
    case HtmlElementType.FileInput:
      const textareaField = $(`#${fieldName}`);
      const attachFileField = $(`input[id=${fieldName}_AttachFile]`);
      logger.info({
        fn: setOnChangeHandler,
        message: 'observe changes on file input element',
        data: { attachFileField, textareaField, fieldName },
      });
      observeChanges(attachFileField);
      attachFileField?.on('blur input', () => {
        onChangeHandler();
      });
      textareaField?.on('change', function () {
        onChangeHandler();
      });
      break;
    case HtmlElementType.DatePicker:
      logger.info({
        fn: setOnChangeHandler,
        message: `Configuring onChangeHandler for datepicker element with fieldName: ${fieldName}`,
      });
      const datePickerElement = $(
        `input[id=${fieldName}_datepicker_description]`
      ).parent()[0];
      logger.info({
        fn: setOnChangeHandler,
        message: 'observe changes on datepicker element',
        data: { datePickerElement },
      });
      observeChanges(datePickerElement);
      $(`#${fieldName}_datepicker_description`).on('blur input', () => {
        onChangeHandler();
      });
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      $(`input[id*='${fieldName}']`).on('change', function () {
        onChangeHandler();
        logger.info({
          fn: setOnChangeHandler,
          message: 'Q3 updated... validateRequiredFields...',
        });
      });
      break;
    case HtmlElementType.DropdownSelect:
      $(`select[id*='${fieldName}']`).on('change', function () {
        onChangeHandler();
      });
      break;
    default: // HtmlElementTypeEnum.Input
      $(`#${fieldName}`).on('change keyup', function (event) {
        onChangeHandler();
      });
      break;
  }

  logger.info({
    fn: setOnChangeHandler,
    message: `Successfully set onChangeHandler for fieldName: ${fieldName}, elemType: ${elemType}, onChangeHandlerName: ${onChangeHandlerName}`,
  });
  store.dispatch('addFieldData', {
    name: fieldName,
    onChangeHandlerSet: true,
  });
}

// Sets address labels to "Business" if "I do not have a Canada Revenue Agency (CRA) Business Number" is NOT checked
// Sets address labels to normal if "I do not have a Canada Revenue Agency (CRA) Business Number" IS checked
export function setBusinessOrPersonalStateForVLB() {
  const noCraNumberCheckbox = document.getElementById(
    'quartech_nocragstnumber'
  );

  if (!noCraNumberCheckbox) {
    logger.error({
      fn: setBusinessOrPersonalStateForVLB,
      message: `Could not find element by id 'quartech_nocragstnumber'`,
    });
    return;
  }

  const noCraNumberCheckboxChecked = noCraNumberCheckbox.checked;

  logger.info({
    fn: setBusinessOrPersonalStateForVLB,
    message: `Successfully found quartech_nocragstnumber with checked: ${noCraNumberCheckboxChecked}`,
  });

  const addressFieldNames = [
    'quartech_businesssuitenumberoptional',
    'quartech_businessstreetnumber',
    'quartech_businessstreet',
    'quartech_businesscity',
    'quartech_businessprovinceterritory',
    'quartech_businesspostalcode',
    'quartech_businessphonenumber',
    'quartech_businessemailaddress',
  ];

  // labels if "Do you have a Canada Revenue Agency (CRA) Business Number?" IS checked
  const businessAddressFieldLabels = [
    'Business - Suite Number (optional)',
    'Business - Street number',
    'Business - Street',
    'Business City',
    'Business Province/Territory',
    'Business Postal Code',
    'Business Phone Number',
    'Business Email Address',
  ];

  // labels if "Do you have a Canada Revenue Agency (CRA) Business Number?" is NOT checked
  const addressFieldLabels = [
    'Suite Number (optional)',
    'Street number',
    'Street',
    'City',
    'Province/Territory',
    'Postal Code',
    'Phone Number',
    'Email Address',
  ];

  // if "Do you have a Canada Revenue Agency (CRA) Business Number?" is NOT checked:
  // PERSON:
  if (noCraNumberCheckboxChecked) {
    addressFieldNames.forEach((fName, index) => {
      setFieldNameLabel(fName, addressFieldLabels[index]);
    });

    copyFromFieldAToFieldB('quartech_email', 'quartech_businessemailaddress');
    copyFromFieldAToFieldB(
      'quartech_telephone',
      'quartech_businessphonenumber'
    );

    // Note: in this case Business City field label is actually just "City" since it's for a person NOT a business
    copyFromFieldAToFieldB('quartech_businesscity', 'quartech_city');

    // hide rows and DO NOT blank them
    hideFieldRow({
      fieldName: 'quartech_businessphonenumber',
      doNotBlank: true,
    });
    hideFieldRow({
      fieldName: 'quartech_businessemailaddress',
      doNotBlank: true,
    });

    populateBusinessNameOnChangeFirstOrLastNameVLB();
  } else {
    // if "Do you have a Canada Revenue Agency (CRA) Business Number?" IS checked:
    // BUSINESS:
    addressFieldNames.forEach((fName, index) => {
      setFieldNameLabel(fName, businessAddressFieldLabels[index]);
    });

    const isScriptLoaded = isScriptFullyLoaded('jquerymask');

    logger.info({
      fn: setBusinessOrPersonalStateForVLB,
      message: `Decide whether to empty fields: quartech_businessphonenumber, quartech_businessemailaddress, quartech_city, isScriptLoaded: ${isScriptLoaded}`,
    });

    // if jquerymask is not loaded yet, it's safe to assume it's the initial load, so do nothing
    if (isScriptLoaded) {
      setFieldValue('quartech_businessphonenumber', '');
      setFieldValue('quartech_businessemailaddress', '');
      copyFromFieldAToFieldB('quartech_businesscity', 'quartech_city');
    } else {
      logger.info({
        fn: setBusinessOrPersonalStateForVLB,
        message: `Skip emptying fields since scripts are still loading... quartech_businessphonenumber, quartech_businessemailaddress, quartech_city, isScriptLoaded: ${isScriptLoaded}`,
      });
    }

    showFieldRow('quartech_businessphonenumber');
    showFieldRow('quartech_businessemailaddress');
  }

  logger.info({
    fn: setBusinessOrPersonalStateForVLB,
    message: `Successfully set labels for address fields based on quartech_nocragstnumber`,
  });
}

// If "I do not have a Canada Revenue Agency (CRA) Business Number" (IS A BUSINESS) is NOT checked, DO NOTHING
// If "I do not have a Canada Revenue Agency (CRA) Business Number" (IS A PERSON) IS checked:
//  populate "quartech_businessphonenumber" field with "quartech_telephone" value
export function populatePhoneNumberEmailAndCityOnChangeVLB() {
  const noCraNumberCheckbox = document.getElementById(
    'quartech_nocragstnumber'
  );

  if (!noCraNumberCheckbox) {
    logger.error({
      fn: populatePhoneNumberEmailAndCityOnChangeVLB,
      message: `Could not find element by id 'quartech_nocragstnumber'`,
    });
    return;
  }

  const isIndividual = noCraNumberCheckbox.checked;

  if (!isIndividual) {
    copyFromFieldAToFieldB('quartech_businesscity', 'quartech_city');
    logger.info({
      fn: populatePhoneNumberEmailAndCityOnChangeVLB,
      message: `"I do not have a Canada Revenue Agency (CRA) Business Number" is not checked, isIndividual: ${isIndividual}`,
    });
    return;
  }

  // ELSE if it's an INDIVIDUAL:

  copyFromFieldAToFieldB('quartech_email', 'quartech_businessemailaddress');
  copyFromFieldAToFieldB('quartech_telephone', 'quartech_businessphonenumber');

  // Note: in this case Business City field label is actually just "City" since it's for a person NOT a business
  copyFromFieldAToFieldB('quartech_businesscity', 'quartech_city');

  logger.info({
    fn: populatePhoneNumberEmailAndCityOnChangeVLB,
    message: `Successfully ran onChangeHandler populateBusinessPhoneNumberOnChange, isIndividual: ${isIndividual},`,
  });
}

export function populateBusinessNameOnChangeFirstOrLastNameVLB() {
  const legalBusinessOrgNameTag = 'quartech_legalbusinessororganizationname';
  const legalBusinessOrgNameTagElement = document.querySelector(
    `#${legalBusinessOrgNameTag}`
  );

  if (!legalBusinessOrgNameTagElement) {
    logger.error({
      fn: populateBusinessNameOnChangeFirstOrLastNameVLB,
      message: `Could not find Legal Business or Organization Name field tag: ${legalBusinessOrgNameTag}`,
    });
    return;
  }

  const tr = legalBusinessOrgNameTagElement.closest('tr');

  if (!isHiddenRow(tr)) {
    logger.info({
      fn: populateBusinessNameOnChangeFirstOrLastNameVLB,
      message: `Only populate when hidden. Legal Business or Organization Name field tag: ${legalBusinessOrgNameTag}`,
      data: { legalBusinessOrgNameTag, legalBusinessOrgNameTagElement, tr },
    });
    return;
  }

  const fieldsToCombine = ['quartech_legalnamefirst', 'quartech_legalnamelast'];

  let fieldValues = [];

  fieldsToCombine.forEach((fName) => {
    const inputValue = document.getElementById(fName)?.value;
    fieldValues.push(inputValue);
  });

  const newValue = fieldValues.join(' ');

  setFieldValue(legalBusinessOrgNameTag, newValue);
  logger.info({
    fn: populateBusinessNameOnChangeFirstOrLastNameVLB,
    message: `Successfuly set field tag: quartech_legalbusinessororganizationname to value: ${newValue}`,
  });
}
