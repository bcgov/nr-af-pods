import {
  validateDemographicInfoRequiredFields,
  validateIsConsultantEitherBciaOrCpa,
} from '../application/validation.js';
import store from '../store/index.js';
import {
  Environment,
  Form,
  FormStep,
  HtmlElementType,
  POWERPOD,
} from './constants.js';
import { getEnv } from './env.ts';
import {
  getFieldsBySectionClaim,
  getFieldsBySectionApplication,
  getFieldConfig,
} from './fields.js';
import {
  getControlValue,
  getFieldErrorDiv,
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  getFieldRow,
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  getOriginalMsosElement,
} from './html.js';
import { Logger } from './logger.js';
import { getOptions } from './options.js';
import { getCurrentStep, getProgramAbbreviation } from './program.ts';

// @ts-ignore
const logger = Logger('common/validation');

POWERPOD.fieldValidation = {
  validateRequiredFields,
};

export function validateRequiredFields() {
  const currentStep = getCurrentStep();
  if (currentStep === FormStep.DemographicInfo) {
    validateDemographicInfoRequiredFields();
    return;
  }
  validateStepFields(currentStep);
}

// @ts-ignore
export function validateStepField(fieldName) {
  const fieldConfig = getFieldConfig(fieldName);
  if (!fieldConfig) {
    logger.error({
      // @ts-ignore
      fn: validateStepField,
      message: `failed to find fieldName: ${fieldName} in state`,
    });
    return;
  }
  if (fieldConfig.hidden) {
    logger.warn({
      // @ts-ignore
      fn: validateStepField,
      message: `skip validating HIDDEN fieldName: ${fieldName}`,
      // @ts-ignore
      data: { fieldConfig },
    });
    // clear any field errors if present
    if (fieldConfig.error?.length) {
      store.dispatch('addFieldData', {
        // @ts-ignore
        name,
        error: '',
      });
    }
    return;
  }
  logger.info({
    // @ts-ignore
    fn: validateStepField,
    message: `start validating fieldName: ${fieldName}`,
    // @ts-ignore
    data: { fieldConfig },
  });
  const { name, required, elementType, validation, format, errorMessage } =
    fieldConfig;

  const needsValidation = required || validation || format;
  if (!needsValidation) {
    logger.warn({
      // @ts-ignore
      fn: validateStepField,
      message: `no validation options configured, skip validating fieldName: ${fieldName}`,
      // @ts-ignore
      data: { fieldConfig },
    });
    return;
  }
  let fieldErrorHtml = '';
  let errorMsgs = [];
  if (required) {
    const errorMsg = validateRequiredField({
      fieldName: name,
      elemType: elementType,
      errorMessage,
    });
    if (errorMsg && errorMsg.length) {
      errorMsgs.push(errorMsg);
    }
  }
  if (validation?.type === 'numeric') {
    const { value, comparison } = validation;
    const errorMsg =
      // @ts-ignore
      validateNumericFieldValue({
        fieldName: name,
        comparisonValue: value,
        operator: comparison,
        errorMessage,
      });
    if (errorMsg && errorMsg.length) {
      errorMsgs.push(errorMsg);
    }
  }
  if (validation?.type === 'date') {
    const { fieldName, comparison } = validation;
    const errorMsg =
      // @ts-ignore
      validateDateFieldValue({
        fieldName: name,
        comparisonFieldName: fieldName,
        operator: comparison,
        errorMessage,
      });
    // @ts-ignore
    if (errorMsg && errorMsg.length) {
      errorMsgs.push(errorMsg);
    }
  }
  if (validation?.type === 'length') {
    const { value, comparison, forceRequired, postfix, overrideDisplayValue } =
      validation;
    const errorMsg = validateFieldLength(
      name,
      value,
      comparison,
      forceRequired,
      postfix,
      overrideDisplayValue
    );
    logger.info({
      // @ts-ignore
      fn: validateStepField,
      message: 'Generate length validation error html...',
    });
    // Display instant feedback on field input
    if (errorMsg && errorMsg.length > 0) {
      errorMsgs.push(errorMsg);
      logger.info({
        // @ts-ignore
        fn: validateStepField,
        message: 'Done generating length validation error html...',
      });
    }
  }
  if (format === 'email') {
    const errorMsg = validateEmailAddressField(name);
    logger.info({
      // @ts-ignore
      fn: validateStepField,
      message: 'Generate email validation error html...',
    });
    // Display instant feedback on field input
    if (errorMsg && errorMsg.length > 0) {
      errorMsgs.push(errorMsg);
      logger.info({
        // @ts-ignore
        fn: validateStepField,
        message: 'Done generating email validation error html...',
      });
    }
  }
  let errorMessageElement = getFieldErrorDiv(fieldName);
  if (!errorMessageElement) {
    logger.error({
      // @ts-ignore
      fn: validateStepField,
      message: `Failed to find field error div, fieldName: ${fieldName}`,
    });
    return;
  }

  fieldErrorHtml = errorMsgs.join('<br />');

  // NO ERROR FOUND:
  if (!fieldErrorHtml?.length) {
    logger.info({
      // @ts-ignore
      fn: validateStepField,
      message: `Did NOT find error message for field: ${name}`,
    });
    $(errorMessageElement).addClass('hide_error_message');
    if (
      elementType === HtmlElementType.MultiOptionSet ||
      elementType === HtmlElementType.MultiSelectPicklist
    ) {
      // @ts-ignore
      if (document.querySelector(`#${fieldName}_i`)?.style?.border) {
        // @ts-ignore
        document.querySelector(`#${fieldName}_i`).style.border = '';
      }
    } else {
      $(`#${fieldName}`).css({ border: '' });
    }
    store.dispatch('addFieldData', {
      name,
      error: '',
      revalidate: false,
    });
  } else {
    // IF THERE ARE ERRORS:
    logger.info({
      // @ts-ignore
      fn: validateStepField,
      message: `Found error message for field: ${name}, fieldErrorHtml: ${fieldErrorHtml}`,
    });

    // only show error message ON FIELD if field has been touched
    if (fieldConfig.touched) {
      logger.info({
        // @ts-ignore
        fn: validateStepField,
        message: `Field has been touched name: ${name}, show error message on field: ${name}, fieldErrorHtml: ${fieldErrorHtml}`,
      });
      $(errorMessageElement).html(fieldErrorHtml);
      $(errorMessageElement).removeClass('hide_error_message');
      if (
        elementType === HtmlElementType.MultiOptionSet ||
        elementType === HtmlElementType.MultiSelectPicklist
      ) {
        $(`#${fieldName}_i`).css({ border: '1px solid #e5636c' });
      } else {
        $(`#${fieldName}`).css({ border: '1px solid #e5636c' });
      }
    } else {
      // if FIELD NOT TOUCHED
      logger.warn({
        // @ts-ignore
        fn: validateStepField,
        message: `Field NOT touched yet name: ${name}, skip showing error message on field: ${name}, fieldErrorHtml: ${fieldErrorHtml}`,
      });
      $(errorMessageElement).addClass('hide_error_message');
      if (
        elementType === HtmlElementType.MultiOptionSet ||
        elementType === HtmlElementType.MultiSelectPicklist
      ) {
        // @ts-ignore
        if (document.querySelector(`#${fieldName}_i`)?.style?.border) {
          // @ts-ignore
          document.querySelector(`#${fieldName}_i`).style.border = '';
        }
      } else {
        $(`#${fieldName}`).css({ border: '' });
      }
    }

    store.dispatch('addFieldData', {
      name,
      error: errorMsgs?.join(' ') ?? '',
      revalidate: false,
    });
  }

  displayActiveFieldErrors();
}

// @ts-ignore
export function validateStepFields(stepName, returnString) {
  if (!stepName) {
    stepName = getCurrentStep();
  }

  let validationErrorHtml = '';
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  let fieldErrorMsgs = {};

  // TODO: Remove this old func usage
  let fields;
  if (getOptions().form === Form.Application) {
    fields = getFieldsBySectionApplication(stepName);
  } else {
    fields = getFieldsBySectionClaim(stepName);
  }

  if (!fields) return '';

  logger.info({
    // @ts-ignore
    fn: validateStepFields,
    message: 'loop through fields to get validation errors',
    // @ts-ignore
    data: { validationErrorHtml },
  });

  for (let i = 0; i < fields.length; i++) {
    validateStepField(fields[i].name);
  }

  logger.info({
    // @ts-ignore
    fn: validateStepFields,
    message: 'Go through dynamic fields to generate validation error html',
    // @ts-ignore
    data: { validationErrorHtml },
  });

  // check which fields we are dynamically requiring validation
  Object.keys(localStorage)
    .filter((x) => x.startsWith('shouldRequire_'))
    .forEach((x) => {
      let fieldErrorHtml = '';
      const fieldId = x.replace('shouldRequire_', '');
      // @ts-ignore
      const fieldDefinition = fields.find((field) => field.name === fieldId);

      // if the field has already been required via JSON, no need to generate another error msg
      if (fieldDefinition && fieldDefinition.required) return;

      let errorMsg = '';
      if (fieldDefinition && fieldDefinition.elementType) {
        errorMsg = validateRequiredField({
          fieldName: fieldId,
          elemType: fieldDefinition.elementType,
        });
      } else {
        errorMsg = validateRequiredField({ fieldName: fieldId });
      }
      validationErrorHtml = validationErrorHtml.concat(errorMsg);
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg);

      logger.info({
        // @ts-ignore
        fn: validateStepFields,
        message: `Found error for field: ${fieldId}, errorMsg: ${fieldErrorHtml}`,
      });
      if (fieldErrorHtml && fieldErrorHtml.length > 0) {
        store.dispatch('addFieldData', {
          name: fieldId,
          error: `${fieldErrorHtml}`,
        });
      } else {
        store.dispatch('addFieldData', {
          name: fieldId,
          error: '',
        });
      }
    });

  if (stepName === 'ProjectStep') {
    const programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation && programAbbreviation === 'NEFBA') {
      const consultantBciaOrCpaErrorMsg = validateIsConsultantEitherBciaOrCpa();
      validationErrorHtml = validationErrorHtml.concat(
        consultantBciaOrCpaErrorMsg
      );
    }
  }

  if (returnString) {
    logger.info({
      // @ts-ignore
      fn: validateStepFields,
      message: 'returning string',
      // @ts-ignore
      data: validationErrorHtml,
    });
    return validationErrorHtml;
  }
  logger.info({
    // @ts-ignore
    fn: validateStepFields,
    message: 'Done! Displaying validation error html',
    // @ts-ignore
    data: { validationErrorHtml },
  });

  if (POWERPOD.validation.errorHtml === validationErrorHtml) {
    logger.info({
      // @ts-ignore
      fn: validateStepFields,
      message: 'No need to display new error, same as old one.',
      // @ts-ignore
      data: {
        storedErrorHtml: POWERPOD.validation.errorHtml,
        validationErrorHtml,
      },
    });
    return;
  }

  // displayValidationErrors(validationErrorHtml);
  // store.dispatch('setValidationError', validationErrorHtml);
}

// @ts-ignore
export function isValueEmpty(value) {
  // Check if the value is undefined
  if (value === undefined) {
    return true;
  }

  // Check if the value is a string with length 0
  if (typeof value === 'string' && value.length === 0) {
    return true;
  }

  // For numbers and floats, a value of 0 is not considered empty
  if (typeof value === 'number' && value === 0) {
    return false;
  }

  // Return false for all other cases (non-empty strings, non-zero numbers, etc.)
  return false;
}

export function validateRequiredField({
  // @ts-ignore
  fieldName,
  elemType = HtmlElementType.Input,
  errorMessage = 'Please enter a value, this field is required.',
}) {
  logger.info({
    // @ts-ignore
    fn: validateRequiredField,
    message: `Start validating required fieldName: ${fieldName} of elemType: ${elemType}`,
  });
  // let isVisible = $(`#${fieldName}_label`)?.is(':visible');
  // if (!isVisible) {
  //   logger.warn({
  //     fn: validateRequiredField,
  //     message: `Validate called on not visible fieldName: ${fieldName} of elemType: ${elemType}`,
  //   });
  //   return '';
  // }

  let validationErrorHtml = '';
  const value = getControlValue({
    controlId: fieldName,
    raw: true,
  });

  let fieldConfig;
  // @ts-ignore
  if (POWERPOD.state?.fields?.[fieldName]) {
    // @ts-ignore
    fieldConfig = POWERPOD.state?.fields?.[fieldName];
  }

  logger.info({
    // @ts-ignore
    fn: validateRequiredField,
    message: `Required field fieldName: ${fieldName}, elemType: ${elemType} isEmptyField: ${
      !value || !value.length
    }, value: ${value}`,
  });

  let isEmpty = false;
  if (fieldConfig && fieldConfig.checkForEmptyValues) {
    isEmpty = checkForEmptyValues(value);
  } else {
    isEmpty = isValueEmpty(value);
  }

  if (isEmpty) {
    logger.info({
      // @ts-ignore
      fn: validateRequiredField,
      message: `Required field fieldName: ${fieldName} is empty! Set validation error message`,
    });
    if (elemType === HtmlElementType.FileInput) {
      errorMessage = 'Please upload the required documents before continuing.';
    }
    validationErrorHtml = errorMessage;
  }
  return validationErrorHtml;
}

// @ts-ignore
function checkForEmptyValues(jsonString) {
  let emptyObjectValues = false;

  if (
    !jsonString ||
    !jsonString.length ||
    jsonString === '[]' ||
    jsonString === ''
  ) {
    return true;
  }

  try {
    // Parse the JSON string into an array
    const dataArray = JSON.parse(jsonString);

    // Check if it's an array
    if (!Array.isArray(dataArray)) {
      throw new Error('Input is not a valid array');
    }

    // Iterate through the array
    for (const obj of dataArray) {
      for (const key in obj) {
        if (obj[key] === '') {
          emptyObjectValues = true;
          break; // Exit the inner loop
        }
      }
      if (emptyObjectValues) break; // Exit the outer loop
    }
  } catch (error) {
    // @ts-ignore
    console.error('Error parsing JSON or processing data:', error.message);
    emptyObjectValues = true; // Handle invalid input as having empty values
  }

  return emptyObjectValues;
}

export function validateDateFieldValue({
  // @ts-ignore
  fieldName,
  // @ts-ignore
  comparisonFieldName,
  // @ts-ignore
  operator,
  errorMessage = '',
}) {
  const params = {
    fieldName,
    comparisonFieldName,
    operator,
    errorMessage,
  };

  const element = document.querySelector(`#${fieldName}`);
  const comparisonElement = document.querySelector(`#${comparisonFieldName}`);

  if (!element || !comparisonElement) {
    logger.error({
      // @ts-ignore
      fn: validateDateFieldValue,
      message: `Failed to find element for date field validation`,
      // @ts-ignore
      data: params,
    });
    return;
  }

  // Extract values from the elements
  // @ts-ignore
  const fieldValue = element.value;
  // @ts-ignore
  const comparisonValue = comparisonElement.value;

  // Ensure the values are present
  if (!fieldValue || !comparisonValue) {
    console.error('One or both date fields are empty');
    return false;
  }

  // Parse the dates
  const fieldDate = new Date(fieldValue);
  const comparisonDate = new Date(comparisonValue);

  // Check if the parsed dates are valid
  if (isNaN(fieldDate.getTime()) || isNaN(comparisonDate.getTime())) {
    console.error('Invalid date format');
    return false;
  }

  logger.info({
    // @ts-ignore
    fn: validateDateFieldValue,
    message: `After cleaning values:`,
    // @ts-ignore
    data: { fieldDate, comparisonDate },
  });

  // Format dates to MM/dd/yyyy
  // @ts-ignore
  const formatDate = (date) =>
    `${String(date.getMonth() + 1).padStart(2, '0')}/${String(
      date.getDate()
    ).padStart(2, '0')}/${date.getFullYear()}`;

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  const formattedFieldDate = formatDate(fieldDate);
  const formattedComparisonDate = formatDate(comparisonDate);

  let finalMessage = '';
  const genericErrorMsg = `Please enter a valid date.`;

  switch (operator) {
    case 'greaterThan':
      if (!(fieldDate > comparisonDate)) {
        finalMessage = `${genericErrorMsg} The value must be greater than ${formattedComparisonDate}.`;
      }
      break;
    case 'lessThan':
      if (!(fieldDate < comparisonDate)) {
        finalMessage = `${genericErrorMsg} The value must be less than ${formattedComparisonDate}.`;
      }
      break;
    case 'equalTo':
      if (!(fieldDate.getTime() === comparisonDate.getTime())) {
        finalMessage = `${genericErrorMsg} The value must be equal to ${formattedComparisonDate}.`;
      }
      break;
    case 'greaterThanOrEqualTo':
      if (!(fieldDate >= comparisonDate)) {
        finalMessage = `${genericErrorMsg} The value must be greater than or equal to ${formattedComparisonDate}.`;
      }
      break;
    case 'lessThanOrEqualTo':
      if (!(fieldDate <= comparisonDate)) {
        finalMessage = `${genericErrorMsg} The value must be less than or equal to ${formattedComparisonDate}.`;
      }
      break;
    default:
      finalMessage = 'Invalid operator';
      logger.error({
        // @ts-ignore
        fn: validateDateFieldValue,
        message: `Invalid operator`,
      });
      break;
  }

  if (errorMessage?.length > 0 && finalMessage?.length > 0) {
    finalMessage = errorMessage;
  }

  logger.info({
    // @ts-ignore
    fn: validateDateFieldValue,
    message: `Returning error message: ${
      finalMessage?.length > 0 ? finalMessage : 'VALIDATION PASSED'
    }`,
    // @ts-ignore
    data: { params, finalMessage },
  });

  return finalMessage;
}

export function validateNumericFieldValue({
  // @ts-ignore
  fieldName,
  // @ts-ignore
  comparisonValue,
  // @ts-ignore
  operator,
  forceRequired = false,
  errorMessage = '',
}) {
  const params = {
    fieldName,
    comparisonValue,
    operator,
    forceRequired,
    errorMessage,
  };
  const element = document.querySelector(`#${fieldName}`);

  if (!element) {
    logger.error({
      // @ts-ignore
      fn: validateNumericFieldValue,
      message: `failed to find element for numeric field validation`,
      // @ts-ignore
      data: params,
    });
    return;
  }

  // @ts-ignore
  if (element.value === '' && !forceRequired) {
    logger.info({
      // @ts-ignore
      fn: validateNumericFieldValue,
      message: `element control value is empty, but it is not required, so skip numeric validation`,
      // @ts-ignore
      data: params,
    });
    return '';
  }

  const value = parseFloat(
    // @ts-ignore
    element.value.replace(/,/g, '').replace('$', '').replace('%', '')
  );
  logger.info({
    // @ts-ignore
    fn: validateNumericFieldValue,
    message: `After cleaning value: ${value}`,
  });
  let finalMessage = '';
  const genericErrorMsg = `Please enter a valid number`;
  switch (operator) {
    case 'greaterThan':
      // @ts-ignore
      if (!(value > comparisonValue) || value === '') {
        finalMessage = `${genericErrorMsg}. The value must be greater than ${comparisonValue}.`;
      }
      break;
    case 'lessThan':
      // @ts-ignore
      if (!(value < comparisonValue) || value === '') {
        finalMessage = `${genericErrorMsg}. The value must be less than ${comparisonValue}.`;
      }
      break;
    case 'equalTo':
      // @ts-ignore
      if (!(value === comparisonValue) || value === '') {
        finalMessage = `${genericErrorMsg}. The value must be equal to ${comparisonValue}.`;
      }
      break;
    case 'greaterThanOrEqualTo':
      // @ts-ignore
      if (!(value >= comparisonValue) || value === '') {
        finalMessage = `${genericErrorMsg}. The value must be greater than or equal to ${comparisonValue}.`;
      }
      break;
    case 'lessThanOrEqualTo':
      // @ts-ignore
      if (!(value <= comparisonValue) || value === '') {
        finalMessage = `${genericErrorMsg}. The value must be less than or equal to ${comparisonValue}.`;
      }
      break;
    default:
      finalMessage = 'Invalid operator';
      logger.error({
        // @ts-ignore
        fn: validateNumericFieldValue,
        message: `Invalid operator`,
      });
      break;
  }
  if (errorMessage?.length > 0 && finalMessage?.length > 0) {
    finalMessage = errorMessage;
  }
  logger.info({
    // @ts-ignore
    fn: validateNumericFieldValue,
    message: `returning error message: ${
      finalMessage?.length > 0 ? finalMessage : 'VALIDATION PASSED'
    }`,
    // @ts-ignore
    data: { params, finalMessage },
  });
  return finalMessage;
}

export function validateFieldLength(
  // @ts-ignore
  fieldName,
  // @ts-ignore
  comparisonValue,
  // @ts-ignore
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
  const genericErrorMsg = `Please enter a valid length,`;
  switch (operator) {
    case 'greaterThan':
      return !(value > comparisonValue) || value === ''
        ? `${genericErrorMsg} must be greater than ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.`
        : '';
    case 'lessThan':
      return !(value < comparisonValue) || value === ''
        ? `${genericErrorMsg} must be less than ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.`
        : '';
    case 'equalTo':
      return !(value === comparisonValue) || value === ''
        ? `${genericErrorMsg} must be equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.`
        : '';
    case 'greaterThanOrEqualTo':
      return !(value >= comparisonValue) || value === ''
        ? `${genericErrorMsg} must be greater than or equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.`
        : '';
    case 'lessThanOrEqualTo':
      return !(value <= comparisonValue) || value === ''
        ? `${genericErrorMsg} must be less than or equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.`
        : '';
    default:
      return 'Invalid operator';
  }
}

// @ts-ignore
export function validateEmailAddressField(fieldName) {
  const fieldElement = document.querySelector(`#${fieldName}`);
  if (!fieldElement) {
    logger.error({
      // @ts-ignore
      fn: validateEmailAddressField,
      message: `Could not find fieldElement for fieldName: ${fieldName}`,
    });
    return;
  }

  const pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

  // @ts-ignore
  const input = fieldElement?.value;
  if (!input || !pattern.test(input)) {
    return 'Please enter a valid email address.';
  } else {
    return '';
  }
}

export function displayActiveFieldErrors() {
  // @ts-ignore
  const fields = POWERPOD.state.fields;
  logger.info({
    // @ts-ignore
    fn: displayActiveFieldErrors,
    message: `checking field state for active errors on fields...`,
    // @ts-ignore
    data: { fields },
  });

  const fieldsWithErrors = Object.values(fields).filter(
    (f) =>
      f.error &&
      !f.hidden &&
      (f.visible != undefined || f.visible != null) &&
      f.visible
  );

  if (!fieldsWithErrors || fieldsWithErrors.length === 0) {
    logger.info({
      // @ts-ignore
      fn: displayActiveFieldErrors,
      message: `No active errors on any fields to display`,
    });
    store.dispatch('setValidationError', '');
    return;
  }

  let validationErrorHtml = '';

  fieldsWithErrors.forEach((field) => {
    const errorWithLabelText = `<span>"${field.label}":</span> <span style="color: red;">${field.error}</span>`;
    validationErrorHtml = validationErrorHtml.concat(
      `<div>${errorWithLabelText}</div>`
    );
  });

  logger.info({
    // @ts-ignore
    fn: displayActiveFieldErrors,
    message: `found fields with errors...`,
    // @ts-ignore
    data: { fieldsWithErrors, validationErrorHtml },
  });

  store.dispatch('setValidationError', validationErrorHtml);
}

// @ts-ignore
export function displayValidationErrors(validationErrorHtml) {
  let validationErrorsDiv = $('#error_messages_div');

  logger.info({
    // @ts-ignore
    fn: displayValidationErrors,
    message: 'displaying validation errors',
    // @ts-ignore
    data: {
      validationErrorHtml,
    },
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
    // @ts-ignore
    if (window.debug_pp) {
      logger.warn({
        // @ts-ignore
        fn: displayValidationErrors,
        message: `Debugging mode enabled, not disabling next button`,
      });
      $('#NextButton').prop('disabled', false);
      return;
    }
    $('#NextButton').prop('disabled', true);
  }

  POWERPOD.validation.errorHtml = validationErrorHtml;
}

// @ts-ignore
export function addValidationCheck(fieldName, validation) {
  if (validation?.intervalBased) {
    const env = getEnv();
    // do not enable interval based on dev or test, since we only use it for Canada Post
    // integration for now, it's only needed in production
    if (env === Environment.PROD) {
      setInterval(() => {
        if (POWERPOD.validation.enableIntervalBased)
          validateStepField(fieldName);
      }, 1000);
      return;
    }
  }
}

// @ts-ignore
export function setInputMaxLength(fieldName, maxLength) {
  $(`#${fieldName}`).attr('maxlength', maxLength);
}

// @ts-ignore
export function setInputMaxWords(fieldName, maxWords) {
  maxWords += 1;
  const $field = $(`#${fieldName}`);
  const $controlDiv = $field.closest('.control'); // Find the closest parent div with class "control"

  // Create word count display if not already present
  if (!$(`#${fieldName}-word-count`).length) {
    // Ensure the counter is inserted AFTER the error message div
    if ($controlDiv.length) {
      $controlDiv.after(`<p id="${fieldName}-word-count" style="margin-top: 5px; font-size: 12px; color: #555; text-align: right; font-family: 'BC Sans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif' !important;">
                        Words: 0/${maxWords}
                      </p>`);
    } else {
      $field.after(`<p id="${fieldName}-word-count" style="margin-top: 5px; font-size: 12px; color: #555; text-align: right; font-family: 'BC Sans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif' !important;">
                      Words: 0/${maxWords}
                    </p>`);
    }
  }

  const $counter = $(`#${fieldName}-word-count`);

  function updateWordCount() {
    // @ts-ignore
    let text = $field.val().replace(/[,.]/g, ' '); // Convert punctuation to spaces
    let words = text
      .trim()
      .split(/\s+/)
      // @ts-ignore
      .filter((word) => word.length > 0);

    // Update the counter
    $counter.text(`Words: ${words.length}/${maxWords - 1}`);

    // If words exceed limit, trim the input
    if (words.length > maxWords) {
      $field.val(words.slice(0, maxWords).join(' '));
      $counter.text(`Words: ${maxWords}/${maxWords - 1}`);
    }
  }

  $field.on('input', updateWordCount);

  $field.on('keydown', function (event) {
    // @ts-ignore
    let text = $field.val().replace(/[,.]/g, ' ');
    let words = text
      .trim()
      .split(/\s+/)
      // @ts-ignore
      .filter((word) => word.length > 0);

    // Prevent further input if limit is reached
    if (words.length >= maxWords && event.key !== 'Backspace') {
      event.preventDefault();
    }
  });

  // Initialize counter on page load
  updateWordCount();
}

// @ts-ignore
export function setInputMaxChars(fieldName, maxChars) {
  const $field = $(`#${fieldName}`);
  const $controlDiv = $field.closest('.control'); // Find the closest parent div with class "control"

  // Create character count display if not already present
  if (!$(`#${fieldName}-char-count`).length) {
    // Ensure the counter is inserted AFTER the error message div
    if ($controlDiv.length) {
      $controlDiv.after(`<p id="${fieldName}-char-count" style="margin-top: 5px; font-size: 12px; color: #555; text-align: right; font-family: 'BC Sans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif' !important;">
                          Characters: 0/${maxChars}
                        </p>`);
    } else {
      $field.after(`<p id="${fieldName}-char-count" style="margin-top: 5px; font-size: 12px; color: #555; text-align: right; font-family: 'BC Sans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif' !important;">
                      Characters: 0/${maxChars}
                    </p>`);
    }
  }

  const $counter = $(`#${fieldName}-char-count`);

  function updateCharCount() {
    // @ts-ignore
    let text = $field.val();
    let charCount = text.length;

    // Update the counter
    $counter.text(`Characters: ${charCount}/${maxChars}`);

    // If characters exceed limit, trim the input
    if (charCount > maxChars) {
      $field.val(text.substring(0, maxChars));
      $counter.text(`Characters: ${maxChars}/${maxChars}`);
    }
  }

  $field.on('input', updateCharCount);

  $field.on('keydown', function (event) {
    // @ts-ignore
    let text = $field.val();
    let charCount = text.length;

    // Prevent further input if limit is reached
    if (charCount >= maxChars && event.key !== 'Backspace') {
      event.preventDefault();
    }
  });

  // Initialize counter on page load
  updateCharCount();
}

// @ts-ignore
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
