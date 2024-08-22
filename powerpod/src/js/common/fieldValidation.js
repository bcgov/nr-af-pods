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
  const fieldConfig = getFieldConfig(fieldName);
  if (!fieldConfig) {
    logger.error({
      fn: validateStepField,
      message: `failed to find fieldName: ${fieldName} in state`,
    });
    return;
  }
  if (fieldConfig.hidden) {
    logger.warn({
      fn: validateStepField,
      message: `skip validating HIDDEN fieldName: ${fieldName}`,
      data: { fieldConfig },
    });
    // clear any field errors if present
    if (fieldConfig.error?.length) {
      store.dispatch('addFieldData', {
        name,
        error: '',
      });
    }
    return;
  }
  logger.info({
    fn: validateStepField,
    message: `start validating fieldName: ${fieldName}`,
    data: { fieldConfig },
  });
  const { name, required, elementType, validation, format, errorMessage } =
    fieldConfig;
  let fieldErrorHtml = '';
  let errorMsg = '';
  if (required) {
    errorMsg =
      validateRequiredField({
        fieldName: name,
        elemType: elementType,
        errorMessage,
      }) ?? '';
    if (errorMsg && errorMsg.length) {
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg + ' ');
    }
  }
  if (validation?.type === 'numeric') {
    const { value, comparison } = validation;
    errorMsg = validateNumericFieldValue(name, value, comparison) ?? '';
    if (errorMsg && errorMsg.length) {
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg + ' ');
    }
  }
  if (validation?.type === 'length') {
    const { value, comparison, forceRequired, postfix, overrideDisplayValue } =
      validation;
    errorMsg =
      validateFieldLength(
        name,
        value,
        comparison,
        forceRequired,
        postfix,
        overrideDisplayValue
      ) ?? '';
    logger.info({
      fn: validateStepField,
      message: 'Generate length validation error html...',
    });
    // Display instant feedback on field input
    if (errorMsg && errorMsg.length > 0) {
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg + ' ');
      logger.info({
        fn: validateStepField,
        message: 'Done generating length validation error html...',
      });
    }
  }
  if (format === 'email') {
    errorMsg = validateEmailAddressField(name) ?? '';
    logger.info({
      fn: validateStepField,
      message: 'Generate email validation error html...',
    });
    // Display instant feedback on field input
    if (errorMsg && errorMsg.length > 0) {
      fieldErrorHtml = fieldErrorHtml.concat(errorMsg + ' ');
      logger.info({
        fn: validateStepField,
        message: 'Done generating email validation error html...',
      });
    }
  }
  let errorMessageElement = getFieldErrorDiv(fieldName);
  if (!errorMessageElement) {
    logger.error({
      fn: validateStepField,
      message: `Failed to find field error div, fieldName: ${fieldName}`,
    });
    return;
  }

  if (!fieldErrorHtml?.length) {
    logger.info({
      fn: validateStepField,
      message: `Did NOT find error message for field: ${name}`,
    });
    $(errorMessageElement).css({ display: 'none' });
    if (
      elementType === HtmlElementType.MultiOptionSet ||
      elementType === HtmlElementType.MultiSelectPicklist
    ) {
      if (document.querySelector(`#${fieldName}_i`)?.style?.border) {
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
    logger.info({
      fn: validateStepField,
      message: `Found error message for field: ${name}, fieldErrorHtml: ${fieldErrorHtml}`,
    });
    // only show error message ON FIELD if field has been touched
    if (fieldConfig.touched) {
      logger.info({
        fn: validateStepField,
        message: `Field has been touched name: ${name}, show error message on field: ${name}, fieldErrorHtml: ${fieldErrorHtml}`,
      });
      $(errorMessageElement).html(fieldErrorHtml);
      $(errorMessageElement).css({ display: '' });
      if (
        elementType === HtmlElementType.MultiOptionSet ||
        elementType === HtmlElementType.MultiSelectPicklist
      ) {
        $(`#${fieldName}_i`).css({ border: '1px solid #e5636c' });
      } else {
        $(`#${fieldName}`).css({ border: '1px solid #e5636c' });
      }
    } else {
      logger.warn({
        fn: validateStepField,
        message: `Field NOT touched yet name: ${name}, skip showing error message on field: ${name}, fieldErrorHtml: ${fieldErrorHtml}`,
      });
      $(errorMessageElement).css({ display: 'none' });
      if (
        elementType === HtmlElementType.MultiOptionSet ||
        elementType === HtmlElementType.MultiSelectPicklist
      ) {
        if (document.querySelector(`#${fieldName}_i`)?.style?.border) {
          document.querySelector(`#${fieldName}_i`).style.border = '';
        }
      } else {
        $(`#${fieldName}`).css({ border: '' });
      }
    }
    store.dispatch('addFieldData', {
      name,
      error: `${fieldErrorHtml}`,
      revalidate: false,
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
    validateStepField(fields[i].name);
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

export function isEmpty(value) {
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
  const value = getControlValue({
    controlId: fieldName,
    raw: true,
  });

  logger.info({
    fn: validateRequiredField,
    message: `Required field fieldName: ${fieldName}, elemType: ${elemType} isEmptyField: ${
      !value || !value.length
    }, value: ${value}`,
  });

  if (isEmpty(value)) {
    logger.info({
      fn: validateRequiredField,
      message: `Required field fieldName: ${fieldName} is empty! Set validation error message`,
    });
    if (elemType === HtmlElementType.FileInput) {
      errorMessage = 'Please upload the required documents before continuing.';
    }
    // const fieldLabelText = $(`#${fieldName}_label`).text();
    validationErrorHtml = `<span style="color:red;"> ${errorMessage}</span>`;
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
  const genericErrorMsg = `<span style="color:red;"> Please enter a valid number`;
  switch (operator) {
    case 'greaterThan':
      // @ts-ignore
      return !(value > comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be greater than ${comparisonValue}.</span>`
        : '';
    case 'lessThan':
      // @ts-ignore
      return !(value < comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be less than ${comparisonValue}.</span>`
        : '';
    case 'equalTo':
      // @ts-ignore
      return !(value === comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be equal to ${comparisonValue}.</span>`
        : '';
    case 'greaterThanOrEqualTo':
      // @ts-ignore
      return !(value >= comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be greater than or equal to ${comparisonValue}.</span>`
        : '';
    case 'lessThanOrEqualTo':
      // @ts-ignore
      return !(value <= comparisonValue) || value === ''
        ? `${genericErrorMsg}. The value must be less than or equal to ${comparisonValue}.</span>`
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
  const genericErrorMsg = `<span style="color:red;">Please enter a valid length,`;
  switch (operator) {
    case 'greaterThan':
      return !(value > comparisonValue) || value === ''
        ? `${genericErrorMsg} must be greater than ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'lessThan':
      return !(value < comparisonValue) || value === ''
        ? `${genericErrorMsg} must be less than ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'equalTo':
      return !(value === comparisonValue) || value === ''
        ? `${genericErrorMsg} must be equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'greaterThanOrEqualTo':
      return !(value >= comparisonValue) || value === ''
        ? `${genericErrorMsg} must be greater than or equal to ${
            overrideDisplayValue ?? comparisonValue
          }${postfix ? ` ${postfix}` : ''}.</span>`
        : '';
    case 'lessThanOrEqualTo':
      return !(value <= comparisonValue) || value === ''
        ? `${genericErrorMsg} must be less than or equal to ${
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
    return '<span style="color:red;">Must be a valid email address.</span>';
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
    const errorWithLabelText = `<span>"${field.label}":</span>` + field.error;
    validationErrorHtml = validationErrorHtml.concat(
      `<div>${errorWithLabelText}</div>`
    );
  });

  logger.info({
    fn: displayActiveFieldErrors,
    message: `found fields with errors...`,
    data: { fieldsWithErrors, validationErrorHtml },
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
