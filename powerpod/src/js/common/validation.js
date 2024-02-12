import {
  validateDemographicInfoRequiredFields,
  validateIsConsultantEitherBciaOrCpa,
} from '../application/validation.js';
import { Form, FormStep, HtmlElementType } from './constants.js';
import {
  getFieldsBySection,
  getFieldsBySectionNew,
  // getFieldsBySectionOld,
} from './fields.js';
import { Logger } from './logger.js';
import { getOptions } from './options.js';
import { getCurrentStep, getProgramAbbreviation } from './program.ts';

const logger = Logger('common/validation');

export function validateRequiredFields() {
  const currentStep = getCurrentStep();
  if (currentStep === FormStep.DemographicInfo) {
    validateDemographicInfoRequiredFields();
    return;
  }
  validateStepFields(currentStep);
}

export function validateStepFields(stepName, returnString) {
  if (!stepName) {
    stepName = getCurrentStep();
  }

  let validationErrorHtml = '';

  // TODO: Remove this old func usage
  let fields;
  if (getOptions().form === Form.Application) {
    // fields = getFieldsBySectionOld(stepName);
    fields = getFieldsBySectionNew(stepName);
  } else {
    fields = getFieldsBySection(stepName);
  }

  if (!fields) return '';

  for (let i = 0; i < fields.length; i++) {
    const { name, required, elementType, validation } = fields[i];
    if (required) {
      let errorMsg = '';
      if (elementType) {
        errorMsg = validateRequiredField(name, elementType);
      } else {
        errorMsg = validateRequiredField(name);
      }
      validationErrorHtml = validationErrorHtml.concat(errorMsg);
    }
    if (validation?.type === 'numeric') {
      const { value, comparison } = validation;
      const errorMsg = validateNumericFieldValue(name, value, comparison);
      validationErrorHtml = validationErrorHtml.concat(errorMsg);
    }
    if (validation?.type === 'length') {
      const {
        value,
        comparison,
        forceRequired,
        postfix,
        overrideDisplayValue,
      } = validation;
      const errorMsg = validateFieldLength(
        name,
        value,
        comparison,
        forceRequired,
        postfix,
        overrideDisplayValue
      );
      // Display instant feedback on field input
      if (errorMsg && errorMsg.length > 0) {
        $(`#${name}_error_message`).html(errorMsg);
        $(`#${name}`).on('focusout', function () {
          $(`#${name}_error_message`).css({ display: '' });
          $(`#${name}`).css({ border: '1px solid #e5636c' });
        });
        const fieldLabelText = $(`#${name}_label`).text();
        const errorMsgPrefix = `<span>"${fieldLabelText}"</span>`;
        validationErrorHtml = validationErrorHtml.concat(
          `<div>${errorMsgPrefix}${errorMsg}</div>`
        );
      } else {
        $(`#${name}`).off('focusout');
        $(`#${name}_error_message`).css({ display: 'none' });
        $(`#${name}`).css({ border: '' });
      }
    }
  }

  // check which fields we are dynamically requiring validation
  Object.keys(localStorage)
    .filter((x) => x.startsWith('shouldRequire_'))
    .forEach((x) => {
      const fieldId = x.replace('shouldRequire_', '');
      const fieldDefinition = fields.find((field) => field.name === fieldId);

      // if the field has already been required via JSON, no need to generate another error msg
      if (fieldDefinition && fieldDefinition.required) return;

      let errorMsg = '';
      if (fieldDefinition && fieldDefinition.elementType) {
        errorMsg = validateRequiredField(fieldId, fieldDefinition.elementType);
      } else {
        errorMsg = validateRequiredField(fieldId);
      }
      validationErrorHtml = validationErrorHtml.concat(errorMsg);
    });

  if (returnString) {
    return validationErrorHtml;
  }
  if (stepName === 'ProjectStep') {
    const programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation && programAbbreviation === 'NEFBA') {
      const consultantBciaOrCpaErrorMsg = validateIsConsultantEitherBciaOrCpa();
      validationErrorHtml = validationErrorHtml.concat(
        consultantBciaOrCpaErrorMsg
      );
    }
  }
  displayValidationErrors(validationErrorHtml);
}

export function validateRequiredField(
  fieldName,
  elemType = HtmlElementType.Input,
  errorMessage = 'IS REQUIRED'
) {
  let isVisible = $(`#${fieldName}_label`).is(':visible');

  let skipValidationAsNotVisible = !isVisible;
  if (skipValidationAsNotVisible) return '';

  let validationErrorHtml = '';

  var isEmptyField = true;
  switch (elemType) {
    case HtmlElementType.FileInput:
      isEmptyField =
        // @ts-ignore
        $(`#${fieldName}_AttachFile`)?.val().length === 0 &&
        // @ts-ignore
        $(`#${fieldName}`)?.val().length === 0;
      break;
    case HtmlElementType.MultiOptionSet:
      isEmptyField = $(`li[id*='${fieldName}-selected-item-']`).length == 0;
      break;
    case HtmlElementType.DropdownSelect:
      isEmptyField =
        // @ts-ignore
        document.querySelector(`#${fieldName}`).value.length == 0;
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.DatePicker:
    default: // HtmlElementTypeEnum.Input
      isEmptyField = $(`#${fieldName}`).val() == '';
      break;
  }

  if (isEmptyField) {
    const fieldLabelText = $(`#${fieldName}_label`).text();
    validationErrorHtml = `<div><span>"${fieldLabelText}"</span><span style="color:red;"> ${errorMessage}</span></div>`;
    // $(`#${fieldName}`).on("focusout", function () {
    //   $(`#${fieldName}_error_message`).css({ display: "" });
    //   $(`#${fieldName}`).css({ border: "1px solid #e5636c" });
    // });
    // Display the field's validation error div here?
  }
  // else {
  //   $(`#${fieldName}`).off("focusout");
  //   $(`#${fieldName}_error_message`).css({ display: "none" });
  //   $(`#${fieldName}`).css({ border: "" });
  // }

  return validationErrorHtml;
}

export function validateNumericFieldValue(
  fieldName,
  comparisonValue,
  operator,
  forceRequired
) {
  const element = document.querySelector(`#${fieldName}`);

  if (!element) return;

  // @ts-ignore
  if (element.value === '' && !forceRequired) {
    return '';
  }

  const value = parseFloat(
    // @ts-ignore
    element.value.replace(/,/g, '').replace('$', '')
  );
  const fieldLabelText = $(`#${fieldName}_label`).text();
  const genericErrorMsg = `<div><span>"${fieldLabelText}"</span><span style="color:red;"> Please enter a valid number`;
  switch (operator) {
    case 'greaterThan':
      // @ts-ignore
      return !(value > comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be greater than ${comparisonValue}.</span></div>`
        : '';
    case 'lessThan':
      // @ts-ignore
      return !(value < comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be less than ${comparisonValue}.</span></div>`
        : '';
    case 'equalTo':
      // @ts-ignore
      return !(value === comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be equal to ${comparisonValue}.</span></div>`
        : '';
    case 'greaterThanOrEqualTo':
      // @ts-ignore
      return !(value >= comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be greater than or equal to ${comparisonValue}.</span></div>`
        : '';
    case 'lessThanOrEqualTo':
      // @ts-ignore
      return !(value <= comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be less than or equal to ${comparisonValue}.</span></div>`
        : '';
    default:
      return 'Invalid operator';
  }
}

export function validateFieldLength(
  fieldName,
  comparisonValue,
  operator,
  forceRequired = true,
  postfix = undefined,
  overrideDisplayValue = undefined
) {
  let isVisible = $(`#${fieldName}_label`).is(':visible');

  let skipValidationAsNotVisible = !isVisible;
  if (skipValidationAsNotVisible) return '';

  const element = document.querySelector(`#${fieldName}`);

  if (!element) return;

  // @ts-ignore
  if (element.value === '' && !forceRequired) {
    return '';
  }

  // @ts-ignore
  const value = element.value.length;
  const genericErrorMsg = `<span style="color:red;"> Please enter a valid length`;
  switch (operator) {
    case 'greaterThan':
      return !(value > comparisonValue) || value === ''
        ? `${genericErrorMsg}. The length must be greater than ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'lessThan':
      return !(value < comparisonValue) || value === ''
        ? `${genericErrorMsg}. The length must be less than ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'equalTo':
      return !(value === comparisonValue) || value === ''
        ? `${genericErrorMsg}. The length must be equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'greaterThanOrEqualTo':
      return !(value >= comparisonValue) || value === ''
        ? `${genericErrorMsg}. The length must be greater than or equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'lessThanOrEqualTo':
      return !(value <= comparisonValue) || value === ''
        ? `${genericErrorMsg}. The length must be less than or equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    default:
      return 'Invalid operator';
  }
}

export function validateEmailAddressField(fieldName) {
  const fieldElement = document.querySelector(`#${fieldName}`);
  let errorMessageElement = document.querySelector(
    `#${fieldName}_error_message`
  );

  if (!fieldElement) return;
  if (!errorMessageElement) {
    let div = document.createElement('div');
    div.id = `${fieldName}_error_message`;
    div.className = 'error_message';
    // @ts-ignore
    div.style = 'display:none;';
    $(`#${fieldName}`).parent().append(div);

    errorMessageElement = document.querySelector(`#${fieldName}_error_message`);

    if (!errorMessageElement) return;
  }

  const pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

  $(fieldElement).on('keyup keydown', () => {
    // @ts-ignore
    const input = fieldElement.value;
    if (!input || !pattern.test(input)) {
      $(fieldElement).css({ border: '1px solid #e5636c' });
      $(errorMessageElement).html('<span>Email: must be a valid email.</span>');
      $(errorMessageElement).css({ display: '' });
    } else {
      $(fieldElement).css({ border: '' });
      $(errorMessageElement).css({ display: 'none' });
    }
  });
}

export function displayValidationErrors(validationErrorHtml) {
  let validationErrorsDiv = $('#error_messages_div');

  logger.info({
    fn: displayValidationErrors,
    message: 'displaying validation errors',
  });

  if (validationErrorsDiv.length == 0) {
    // @ts-ignore
    validationErrorsDiv = document.createElement('div');
    // @ts-ignore
    validationErrorsDiv.id = `error_messages_div`;

    const actionsDiv = $(`#NextButton`).parent().parent();
    actionsDiv.prepend(validationErrorsDiv);

    actionsDiv.attr('id', 'actions_div');
  } else {
    // @ts-ignore
    validationErrorsDiv = validationErrorsDiv[0];
  }

  if (validationErrorHtml == '') {
    // @ts-ignore
    validationErrorsDiv.innerHTML = '';
    // @ts-ignore
    validationErrorsDiv.style = 'display:none;';
    $('#NextButton').prop('disabled', false);
  } else {
    // @ts-ignore
    validationErrorsDiv.innerHTML = validationErrorHtml + '</br>';
    // @ts-ignore
    validationErrorsDiv.style = 'display:block;';
    $('#NextButton').prop('disabled', true);
  }
}

export function addValidationCheck(fieldName, validation) {
  if (validation?.intervalBased) {
    setInterval(() => validateStepFields(), 100);
  } else {
    $(`input[id*='${fieldName}']`).on(validation?.event ?? 'onchange', function () {
      validateStepFields();
    });
  }
}

export function setInputMaxLength(fieldName, maxLength) {
  $(`#${fieldName}`).attr('maxlength', maxLength);
}

export function setFieldReadOnly(fieldName) {
  // @ts-ignore
  $(`#${fieldName}`).attr('readonly', true);
  $(`#${fieldName}`).on('mousedown', function (e) {
    e.preventDefault();
    this.blur();
    window.focus();
  });
  $(`#${fieldName}`).attr('style', 'background-color: #eee !important');
}
