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
} from './fields.js';
import {
  getControlValue,
  getFieldErrorDiv,
  getFieldRow,
  getOriginalMsosElement,
} from './html.js';
import { Logger } from './logger.js';
import { getOptions } from './options.js';
import { getCurrentStep, getProgramAbbreviation } from './program.ts';

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

export function validateStepField(fieldName) {
  logger.info({
    fn: validateStepField,
    message: `start validating fieldName: ${fieldName}`,
  });

  if (!POWERPOD.state?.fields?.[fieldName]) {
    logger.error({
      fn: validateStepField,
      message: `failed to find fieldName: ${fieldName} in state`,
    });
    return;
  }
  const { name, required, elementType, validation, format } =
    POWERPOD.state?.fields?.[fieldName];
  let fieldErrorHtml = '';
  let errorMsg = '';
  if (required) {
    errorMsg = validateRequiredField({
      fieldName: name,
      elemType: elementType,
    });
    if (errorMsg && errorMsg.length) {
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg);
    }
  }
  if (validation?.type === 'numeric') {
    const { value, comparison } = validation;
    errorMsg = validateNumericFieldValue(name, value, comparison) ?? '';
    if (errorMsg && errorMsg.length) {
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg);
    }
  }
  if (validation?.type === 'length') {
    const { value, comparison, forceRequired, postfix, overrideDisplayValue } =
      validation;
    errorMsg = validateFieldLength(
      name,
      value,
      comparison,
      forceRequired,
      postfix,
      overrideDisplayValue
    );
    logger.info({
      fn: validateStepField,
      message: 'Generate length validation error html...',
    });
    // Display instant feedback on field input
    if (errorMsg && errorMsg.length > 0) {
      fieldErrorHtml = fieldErrorHtml.concat(`<div>${errorMsg}</div>`);
      logger.info({
        fn: validateStepField,
        message: 'Done generating length validation error html...',
      });
    }
  }
  if (format === 'email') {
    errorMsg = validateEmailAddressField(name);
    logger.info({
      fn: validateStepField,
      message: 'Generate email validation error html...',
    });
    // Display instant feedback on field input
    if (errorMsg && errorMsg.length > 0) {
      fieldErrorHtml = fieldErrorHtml.concat(`<div>${errorMsg}</div>`);
      logger.info({
        fn: validateStepField,
        message: 'Done generating email validation error html...',
      });
    }
  }
  logger.info({
    fn: validateStepField,
    message: `Found error message for field: ${name}, errorMsg: ${fieldErrorHtml}`,
  });
  let errorMessageElement = getFieldErrorDiv(fieldName);
  if (!errorMessageElement) {
    logger.error({
      fn: validateStepField,
      message: `Failed to find field error div, fieldName: ${fieldName}`,
    });
    return;
  }
  if (fieldErrorHtml && fieldErrorHtml.length > 0) {
    $(errorMessageElement).html(fieldErrorHtml);
    $(errorMessageElement).css({ display: '' });
    $(`#${fieldName}`).css({ border: '1px solid #e5636c' });
    store.dispatch('addFieldData', {
      name,
      error: `${fieldErrorHtml}`,
    });
  } else {
    $(errorMessageElement).css({ display: 'none' });
    $(`#${fieldName}`).css({ border: '' });
    store.dispatch('addFieldData', {
      name,
      error: '',
    });
  }

  displayActiveFieldErrors();
}

export function validateStepFields(stepName, returnString) {
  if (!stepName) {
    stepName = getCurrentStep();
  }

  let validationErrorHtml = '';
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
    fn: validateStepFields,
    message: 'loop through fields to get validation errors',
    data: { validationErrorHtml },
  });

  for (let i = 0; i < fields.length; i++) {
    const { name, required, elementType, validation } = fields[i];
    let fieldErrorHtml = '';
    let errorMsg = '';
    if (required) {
      if (elementType) {
        errorMsg = validateRequiredField({
          fieldName: name,
          elemType: elementType,
        });
      } else {
        errorMsg = validateRequiredField({ fieldName: name });
      }
      if (errorMsg && errorMsg.length) {
        validationErrorHtml = validationErrorHtml.concat(errorMsg);
        fieldErrorHtml = fieldErrorHtml.concat(errorMsg);
      }
    }
    if (validation?.type === 'numeric') {
      const { value, comparison } = validation;
      errorMsg = validateNumericFieldValue(name, value, comparison) ?? '';
      if (errorMsg && errorMsg.length) {
        validationErrorHtml = validationErrorHtml.concat(errorMsg);
        fieldErrorHtml = fieldErrorHtml.concat(errorMsg);
      }
    }
    if (validation?.type === 'length') {
      const {
        value,
        comparison,
        forceRequired,
        postfix,
        overrideDisplayValue,
      } = validation;
      errorMsg = validateFieldLength(
        name,
        value,
        comparison,
        forceRequired,
        postfix,
        overrideDisplayValue
      );
      logger.info({
        fn: validateStepFields,
        message: 'Generate length validation error html...',
        data: { validationErrorHtml },
      });
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
        fieldErrorHtml = fieldErrorHtml.concat(
          `<div>${errorMsgPrefix}${errorMsg}</div>`
        );
        logger.info({
          fn: validateStepFields,
          message: 'Done generating length validation error html...',
          data: { validationErrorHtml },
        });
      } else {
        logger.info({
          fn: validateStepFields,
          message: 'Nothing to display for length validation error html...',
          data: { validationErrorHtml },
        });
        $(`#${name}`).off('focusout');
        $(`#${name}_error_message`).css({ display: 'none' });
        $(`#${name}`).css({ border: '' });
      }
    }
    logger.info({
      fn: validateStepFields,
      message: `Found error message for field: ${name}, errorMsg: ${fieldErrorHtml}`,
    });
    if (fieldErrorHtml && fieldErrorHtml.length > 0) {
      store.dispatch('addFieldData', {
        name,
        error: `${fieldErrorHtml}`,
      });
    } else {
      store.dispatch('addFieldData', {
        name,
        error: '',
      });
    }
  }

  logger.info({
    fn: validateStepFields,
    message: 'Go through dynamic fields to generate validation error html',
    data: { validationErrorHtml },
  });

  // check which fields we are dynamically requiring validation
  Object.keys(localStorage)
    .filter((x) => x.startsWith('shouldRequire_'))
    .forEach((x) => {
      let fieldErrorHtml = '';
      const fieldId = x.replace('shouldRequire_', '');
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
      fn: validateStepFields,
      message: 'returning string',
      data: validationErrorHtml,
    });
    return validationErrorHtml;
  }
  logger.info({
    fn: validateStepFields,
    message: 'Done! Displaying validation error html',
    data: { validationErrorHtml },
  });

  if (POWERPOD.validation.errorHtml === validationErrorHtml) {
    logger.info({
      fn: validateStepFields,
      message: 'No need to display new error, same as old one.',
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

export function validateRequiredField({
  fieldName,
  elemType = HtmlElementType.Input,
  errorMessage = 'Please enter a value, this field is required.',
}) {
  logger.info({
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

  var isEmptyField = true;
  switch (elemType) {
    case HtmlElementType.FileInput:
      isEmptyField =
        // @ts-ignore
        $(`#${fieldName}`)?.val()?.length === 0;
      errorMessage =
        'Please ensure at least one file per required upload field is confirmed & uploaded successfully.';
      break;
    // case HtmlElementType.MultiSelectPicklist:
    // isEmptyField = $(`li[id*='${fieldName}-selected-item-']`)?.length == 0;
    // break;
    case HtmlElementType.MultiOptionSet:
      const originalSelectElementForMSOS = getOriginalMsosElement(fieldName);
      const selectionContainer =
        // @ts-ignore
        originalSelectElementForMSOS?.multiSelectOptionSet()?.$selection;
      const selectedItems = selectionContainer?.find(
        'li[aria-selected="true"]'
      );
      isEmptyField = selectedItems?.length === 0;
      break;
    case HtmlElementType.DropdownSelect:
      isEmptyField =
        // @ts-ignore
        document.querySelector(`#${fieldName}`)?.value?.length == 0;
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.DatePicker:
      let fieldRow = getFieldRow(fieldName);
      let value = getControlValue({
        controlId: fieldName,
        tr: fieldRow,
        rawValue: false,
      });
      isEmptyField = value?.length === 0;
      break;
    case HtmlElementType.MultiSelectPicklist:
    case HtmlElementType.Input:
    default:
      isEmptyField = $(`#${fieldName}`)?.val() == '';
      break;
  }

  logger.info({
    fn: validateRequiredField,
    message: `Required field fieldName: ${fieldName}, elemType: ${elemType} isEmptyField: ${isEmptyField}`,
  });

  if (isEmptyField) {
    logger.info({
      fn: validateRequiredField,
      message: `Required field fieldName: ${fieldName} is empty! Set validation error message`,
    });
    const fieldLabelText = $(`#${fieldName}_label`).text();
    validationErrorHtml = `<div><span style="color:red;"> ${errorMessage}</span></div>`;
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
  if (!fieldElement) {
    logger.error({
      fn: validateEmailAddressField,
      message: `Could not find fieldElement for fieldName: ${fieldName}`,
    });
    return;
  }

  const pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

  const input = fieldElement?.value;
  if (!input || !pattern.test(input)) {
    return '<span>Must be a valid email address.</span>';
  } else {
    return '';
  }
}

export function displayActiveFieldErrors() {
  const fields = POWERPOD.state.fields;
  logger.info({
    fn: displayActiveFieldErrors,
    message: `checking field state for active errors on fields...`,
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
      fn: displayActiveFieldErrors,
      message: `No active errors on any fields to display`,
    });
    store.dispatch('setValidationError', '');
    return;
  }

  let validationErrorHtml = '';

  fieldsWithErrors.forEach((field) => {
    const errorWithLabelText = field.error.replace(
      '<div>',
      `<div><span>"${field.label}"</span>`
    );
    validationErrorHtml = validationErrorHtml.concat(errorWithLabelText);
  });

  store.dispatch('setValidationError', validationErrorHtml);
}

export function displayValidationErrors(validationErrorHtml) {
  let validationErrorsDiv = $('#error_messages_div');

  logger.info({
    fn: displayValidationErrors,
    message: 'displaying validation errors',
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
    $('#NextButton').prop('disabled', true);
  }

  POWERPOD.validation.errorHtml = validationErrorHtml;
}

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
