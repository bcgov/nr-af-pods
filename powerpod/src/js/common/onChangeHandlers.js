import store from '../store/index.js';
import { HtmlElementType, POWERPOD } from './constants.js';
import { formatCurrencyOnBlur } from './currency.js';
import { getFieldConfig } from './fields.js';
import {
  copyFromFieldAToFieldB,
  hideAllStepSections,
  hideFieldRow,
  isHiddenRow,
  observeChanges,
  setFieldNameLabel,
  setFieldValue,
  showAllStepSections,
  showFieldRow,
  showSection,
} from './html.js';
import { Logger } from './logger.js';
import { isScriptFullyLoaded } from './scripts.js';

POWERPOD.onChangeHandlers = {
  populateBusinessNameOnChangeFirstOrLastNameVLB,
  setBusinessOrPersonalStateForVLB,
  populatePhoneNumberEmailAndCityOnChangeVLB,
  setBusinessOrPersonalAddressLabels,
  populateTotalPercent,
  calculateAndPopulateRequestedClaimAmountForVLB,
  checkAndSetTFCREligbilityNotice,
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
        message: `observe changes on file input element, setOnChangeHandler: ${fieldName}`,
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
        message: `Configuring onChangeHandler for datepicker element, setOnChangeHandler: ${fieldName}`,
      });
      const datePickerElement = $(
        `input[id=${fieldName}_datepicker_description]`
      ).parent()[0];
      logger.info({
        fn: setOnChangeHandler,
        message: `observe changes on datepicker element, setOnChangeHandler: ${fieldName}`,
        data: { datePickerElement },
      });
      observeChanges(datePickerElement);
      $(`#${fieldName}_datepicker_description`).on('blur input', () => {
        onChangeHandler();
      });
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      logger.info({
        fn: setOnChangeHandler,
        message: `Configuring onChangeHandler for Single/MultiOptionSet, setOnChangeHandler: ${fieldName}`,
      });
      $(`input[id*='${fieldName}']`).on('change', function () {
        onChangeHandler();
        logger.info({
          fn: setOnChangeHandler,
          message: 'Q3 updated... validateRequiredFields...',
        });
      });
      break;
    case HtmlElementType.DropdownSelect:
      logger.info({
        fn: setOnChangeHandler,
        message: `Configuring onChangeHandler for DropdownSelect, setOnChangeHandler: ${fieldName}`,
      });
      $(`select[id*='${fieldName}']`).on('change', function () {
        onChangeHandler();
      });
      break;
    default: // HtmlElementTypeEnum.Input
      logger.info({
        fn: setOnChangeHandler,
        message: `Configuring onChangeHandler for default input, setOnChangeHandler: ${fieldName}`,
      });
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

export function checkAndSetTFCREligbilityNotice() {
  logger.info({
    fn: checkAndSetTFCREligbilityNotice,
    message: `checkAndSetTFCREligbilityNotice called, start calculating...`,
  });
  const existingTreeFruit = document.getElementById(
    'quartech_areyouanexistingtreefruit'
  )?.value;

  const ownerOrLesseeOfTheLand = document.getElementById(
    'quartech_areyouanownerorlesseeoftheland'
  )?.value;

  const taxableEntity = document.getElementById(
    'quartech_areyouataxableentity'
  )?.value;

  const fileFarmIncomeTaxUnderTaxActInBC = document.getElementById(
    'quartech_doyoufilefarmincometaxundertaxactinbc'
  )?.value;

  const commitToMaintainingTheProperty = document.getElementById(
    'quartech_doyoucommittomaintainingtheproperty'
  )?.value;

  logger.info({
    fn: checkAndSetTFCREligbilityNotice,
    message: `founds the following values...`,
    data: {
      existingTreeFruit,
      ownerOrLesseeOfTheLand,
      taxableEntity,
      fileFarmIncomeTaxUnderTaxActInBC,
      commitToMaintainingTheProperty,
    },
  });

  const areAnyValuesNo =
    existingTreeFruit === '0' ||
    ownerOrLesseeOfTheLand === '0' ||
    taxableEntity === '0' ||
    fileFarmIncomeTaxUnderTaxActInBC === '0' ||
    commitToMaintainingTheProperty === '0';

  const areAllValuesYes = existingTreeFruit === '1' &&
    ownerOrLesseeOfTheLand === '1' &&
    taxableEntity === '1' &&
    fileFarmIncomeTaxUnderTaxActInBC === '1' &&
    commitToMaintainingTheProperty === '1';

  const noticeElement = document.getElementById(
    'doesNotMeetTFCREligibilityRequirements'
  );
  // this means that one value is NO
  if (areAnyValuesNo && noticeElement?.style?.display) {
    noticeElement.style.display = '';
    hideAllStepSections();
    $('fieldset[aria-label="Eligibility"] > table').parent().css('display', '');
    const errMsgDiv = document.getElementById('error_messages_div');
    if (errMsgDiv) {
      errMsgDiv.style.display = 'none';
    }
    $('#NextButton').prop('disabled', true);
  } else if (areAllValuesYes && noticeElement) {
    noticeElement.style.display = 'none';
    $('fieldset[aria-label="Eligibility"] > table').parent().css('display', '');
    $('fieldset[aria-label="Business Information"] > table').parent().css('display', '');
    $('fieldset[aria-label="Indigenous Applicants"] > table').parent().css('display', '');
    $('fieldset[aria-label="Application Contact"] > table').parent().css('display', '');
    $('fieldset[aria-label="Applicant Information"] > table').parent().css('display', '');
    const errMsgDiv = document.getElementById('error_messages_div');
    if (errMsgDiv) {
      errMsgDiv.style.display = 'block';
    }
    $('#NextButton').prop('disabled', false);
  }
}

export function calculateAndPopulateRequestedClaimAmountForVLB() {
  logger.info({
    fn: calculateAndPopulateRequestedClaimAmountForVLB,
    message: `calculateAndPopulateRequestedClaimAmountForVLB called, start calculating...`,
  });
  // Get input values from the elements
  const totalDaysAsAVet =
    document.getElementById('quartech_numberoffulldaysworkedasaveterinarian')
      ?.value || 0;
  const totalDaysAsAnRVT =
    document.getElementById('quartech_numberoffulldaysworkedasanrvt')?.value ||
    0;
  const totalDaysAsTelemedicineSupport =
    document.getElementById('quartech_numberofdaysprovidingtelemedicinesupport')
      ?.value || 0;
  const totalExpensesForCVBCAndBCVTA =
    document.getElementById('quartech_totalsumofreportedexpenses')?.value || 0;

  logger.info({
    fn: calculateAndPopulateRequestedClaimAmountForVLB,
    message: `calculateAndPopulateRequestedClaimAmountForVLB returned ${totalExpensesForCVBCAndBCVTA} for totalExpensesForCVBCAndBCVTA`,
  });

  // Convert input values to numbers (fallback to 0 if invalid)
  const vetDays = parseFloat(totalDaysAsAVet) || 0;
  const rvtDays = parseFloat(totalDaysAsAnRVT) || 0;
  const telemedicineDays = parseFloat(totalDaysAsTelemedicineSupport) || 0;
  const expenses =
    parseFloat(totalExpensesForCVBCAndBCVTA.replace(',', '')) || 0;

  logger.info({
    fn: calculateAndPopulateRequestedClaimAmountForVLB,
    message: `calculateAndPopulateRequestedClaimAmountForVLB returned ${expenses} for expenses`,
  });

  // Perform the calculation
  const result =
    300 * vetDays + 150 * rvtDays + 50 * telemedicineDays + expenses;

  const formattedResult = formatCurrencyOnBlur(`${result}`);

  // @ts-ignore
  setFieldValue({ name: 'quartech_totalfees', value: formattedResult });
  logger.info({
    fn: calculateAndPopulateRequestedClaimAmountForVLB,
    message: `Successfuly set field tag: quartech_totalfees to value: ${result}`,
  });
}

export function setBusinessOrPersonalAddressLabels() {
  const noCraNumberCheckbox = document.getElementById(
    'quartech_nocragstnumber'
  );

  if (!noCraNumberCheckbox) {
    logger.error({
      fn: setBusinessOrPersonalAddressLabels,
      message: `Could not find element by id 'quartech_nocragstnumber'`,
    });
    return;
  }

  const noCraNumberCheckboxChecked = noCraNumberCheckbox.checked;

  logger.info({
    fn: setBusinessOrPersonalAddressLabels,
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
    'Business - Street Number',
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
    'Street Number',
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
  } else {
    // if "Do you have a Canada Revenue Agency (CRA) Business Number?" IS checked:
    // BUSINESS:
    addressFieldNames.forEach((fName, index) => {
      setFieldNameLabel(fName, businessAddressFieldLabels[index]);
    });
  }

  logger.info({
    fn: setBusinessOrPersonalAddressLabels,
    message: `Successfully set labels for address fields based on quartech_nocragstnumber`,
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
    'Business - Street Number',
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
    'Street Number',
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
      // @ts-ignore
      setFieldValue({ name: 'quartech_businessphonenumber', value: '' });
      // @ts-ignore
      setFieldValue({ name: 'quartech_businessemailaddress', value: '' });
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

export function populateTotalPercent() {
  const fieldsToSum = [
    'quartech_animalspeciestypesserved_beefcattle',
    'quartech_animalspeciestypesserved_dairycattle',
    'quartech_animalspeciestypesserved_farmedfish',
    'quartech_animalspeciestypesservedpoultrycommercial',
    'quartech_animalspeciestypesserved_poultrysmalllot',
    'quartech_animalspeciestypesserved_sheepandgoats',
    'quartech_animalspeciestypesserved_swinecommercial',
    'quartech_animalspeciestypesserved_swinesmalllot',
    'quartech_animalspeciestypesserved_companionanimals',
    'quartech_animalspeciestypesserved_horses',
    'quartech_animalspeciestypesserved_other',
  ];

  let total = 0;

  fieldsToSum.forEach((field) => {
    // Get the field value by ID using jQuery
    const fieldValue = $(`#${field}`).val();

    if (fieldValue) {
      const numericValue = parseInt(fieldValue, 10);
      if (!isNaN(numericValue)) {
        total += numericValue;
      }
    }
  });

  logger.info({
    fn: populateTotalPercent,
    message: `Setting total percent to total: ${total}`,
  });
  // @ts-ignore
  setFieldValue({
    name: 'quartech_totalpercentageofpracticeserved',
    value: `${total}`,
  });

  const fieldConfig = getFieldConfig(
    'quartech_totalpercentageofpracticeserved'
  );

  logger.info({
    fn: populateTotalPercent,
    message: `Got fieldConfig for quartech_totalpercentageofpracticeserved:`,
    data: { fieldConfig },
  });

  if (
    fieldConfig?.id &&
    document.getElementById(fieldConfig.id) &&
    // @ts-ignore
    document.getElementById(fieldConfig.id)?.getAttribute('inputvalue')
  ) {
    // @ts-ignore
    document
      .getElementById(fieldConfig.id)
      ?.setAttribute('inputvalue', `${total}`);
    document.getElementById(fieldConfig.id)?.dispatchEvent(new Event('change'));
  }
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

  // @ts-ignore
  setFieldValue({ name: legalBusinessOrgNameTag, value: newValue });
  logger.info({
    fn: populateBusinessNameOnChangeFirstOrLastNameVLB,
    message: `Successfuly set field tag: quartech_legalbusinessororganizationname to value: ${newValue}`,
  });
}
