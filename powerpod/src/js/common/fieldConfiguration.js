import { Form, HtmlElementType } from './constants.js';
import { customizeCurrencyInput } from './currency.js';
import {
  getFieldsBySectionClaim,
  getFieldsBySectionApplication,
} from './fields.js';
import {
  hideFieldByFieldName,
  observeChanges,
} from './html.js';
import { Logger } from './logger.js';
import { FieldMaskType, maskInput } from './masking.js';
import { getOptions } from './options.js';
import { getCurrentStep } from './program.js';
import { setupTooltip } from './tooltip.js';
import { hasUpperCase } from './utils.js';
import {
  addValidationCheck,
  setFieldReadOnly,
  setInputMaxLength,
  validateEmailAddressField,
  validateRequiredFields,
  validateStepFields,
} from './fieldValidation.js';
import {
  initOnChange_DependentRequiredField,
  initializeVisibleIf,
} from './fieldConditionalLogic.js';

const logger = Logger('common/fieldConfiguration');

export function configureFields() {
  const stepName = getCurrentStep();
  logger.info({
    fn: configureFields,
    message: `configuring fields for step: ${stepName}...`,
  });
  let fields;
  if (getOptions().form === Form.Application) {
    fields = getFieldsBySectionApplication(stepName);
  } else {
    fields = getFieldsBySectionClaim(stepName);
  }

  if (!fields) return;

  logger.info({
    fn: configureFields,
    message: 'configuring fields...',
    data: {
      stepName,
      fields,
    },
  });

  for (let i = 0; i < fields.length; i++) {
    const {
      name,
      elementType,
      required,
      validation,
      hidden,
      format,
      // TO-DO: group these under a currency config object
      allowNegatives, // CURRENCY-specific, applies if format === 'currency'
      maxDigits, // CURRENCY-specific, applies if format === 'currency'
      emptyInitialValue, // CURRENCY-specific, applies if format === 'currency'
      maxLength, // only works on string inputs
      label,
      bold, // bolds the label text
      type,
      tooltipText,
      tooltipTargetElementId,
      skipCalculatingBudget = undefined,
      hideLabel,
      readOnly,
      doNotBlank = false,
      fileTypes, // not currently used anywhere
      visibleIf,
      oneLine,
    } = fields[i];
    logger.info({
      fn: configureFields,
      message: `setting field definition for field name: ${name}`,
    });
    if (!$(`#${name}`)) {
      logger.error({
        fn: configureFields,
        message: `could not find existing element for field name: ${name}`,
      });
    }
    if (hasUpperCase(name)) {
      logger.warn({
        fn: configureFields,
        message: `Warning! Field name: ${name} contains an uppercase letter, please confirm if it was intentional or not.`,
      });
    }
    if (type === 'SectionTitle' && hidden) {
      const sectionElement = $(`fieldset[aria-label="${name}"]`);
      if (sectionElement) {
        sectionElement?.css('display', 'none');
      }
      // continuing for type SectionTitle because nothing else is supported for this field type
      continue;
    }
    setupTooltip({ name, tooltipText, tooltipTargetElementId });
    if (label) {
      const obj = $(`#${name}_label`)?.text(label);
      obj?.html(obj?.html()?.replace(/\n/g, '<br/>'));
    }
    if (bold) {
      const labelElement = $(`#${name}_label`);
      labelElement.css('font-weight', 'bold');
    }
    if (hideLabel) {
      $(`#${name}_label`)?.css('display', 'none');
    }
    if (required) {
      if (elementType) {
        setRequiredField(name, elementType);
      } else {
        setRequiredField(name);
      }
    }
    if (validation) {
      addValidationCheck(name, validation);
    }
    if (hidden) {
      hideFieldByFieldName(name, validateStepFields(stepName), doNotBlank);
    }
    // max characters
    if (maxLength) {
      setInputMaxLength(name, maxLength);
    }
    if (readOnly) {
      setFieldReadOnly(name);
    }
    if (format === 'email') {
      maskInput(name, FieldMaskType.Email);
      validateEmailAddressField(name);
    } else if (format === 'currency') {
      customizeCurrencyInput({
        inputId: name,
        ...(skipCalculatingBudget !== undefined
          ? { skipCalculatingBudget }
          : { skipCalculatingBudget: true }),
        ...(maxDigits ? { maxDigits } : { maxDigits: 13 }),
        ...(emptyInitialValue && { emptyInitialValue }),
        ...(allowNegatives && { allowNegatives }),
      });
    } else if (format === 'percentage') {
      customizeCurrencyInput({
        inputId: name,
        skipCalculatingBudget: true,
        maxDigits: 5,
        limitInputValue: '100.00',
        hideDollarSign: true,
      });
    } else if (format === 'number') {
      $(`#${name}`).attr('type', 'number');
      if (!allowNegatives) {
        $(`#${name}`).attr('min', '0');
        $(`#${name}`).attr(
          'oninput',
          'this.value = !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null'
        );
      }
    } else if (format === 'cra') {
      maskInput(name, FieldMaskType.CRA);
    } else if (format === 'phoneNumber') {
      maskInput(name, FieldMaskType.PhoneNumber);
    } else if (format === 'postalCode') {
      maskInput(name, FieldMaskType.PostalCode);
    }

    if (elementType === HtmlElementType.FileInput) {
      let defaultFileTypes =
        '.csv,.doc,.docx,.odt,.pdf,.xls,.xlsx,.ods,.gif,.jpeg,.jpg,.png,.svg,.tif';
      $(`#${name}_AttachFile`)?.attr('accept', fileTypes ?? defaultFileTypes);
    }
    if (visibleIf) {
      initializeVisibleIf(name, required, visibleIf);
    }
  }

  setDynamicallyRequiredFields(stepName);
}

export function setRequiredField(
  fieldName,
  elemType = HtmlElementType.Input,
  validationErrorMessage = 'Required field'
) {
  logger.info({
    fn: setRequiredField,
    message: `Start configuring required fieldName: ${fieldName}, elemType: ${elemType}`,
  });
  $(`#${fieldName}_label`).parent().addClass('required');
  // @ts-ignore
  $(`#${fieldName}`).attr('required', true);

  let div = document.createElement('div');
  div.id = `${fieldName}_error_message`;
  div.className = 'error_message';
  // @ts-ignore
  div.style = 'display:none;';
  div.innerHTML = `<span'>${validationErrorMessage}</span>`;
  $(`#${fieldName}`).parent().append(div);

  switch (elemType) {
    case HtmlElementType.FileInput:
      const fileInputElement = $(`input[id=${fieldName}_AttachFile]`)[0];
      logger.info({
        fn: setRequiredField,
        message: 'observe changes on file input element',
        data: { fileInputElement },
      });
      observeChanges(fileInputElement);
      $(`#${fieldName}_AttachFile`).on('blur input', () => {
        validateRequiredFields();
      });
      break;
    case HtmlElementType.DatePicker:
      const datePickerElement = $(
        `input[id=${fieldName}_datepicker_description]`
      ).parent()[0];
      logger.info({
        fn: setRequiredField,
        message: 'observe changes on date picker element',
        data: { datePickerElement },
      });
      observeChanges(datePickerElement);
      $(`#${fieldName}_datepicker_description`).on('blur input', () => {
        validateRequiredFields();
      });
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      $(`input[id*='${fieldName}']`).on('change', function () {
        validateRequiredFields();
        logger.info({
          fn: setRequiredField,
          message: 'Q3 updated... validateRequiredFields...',
        });
      });
      break;
    case HtmlElementType.DropdownSelect:
      $(`select[id*='${fieldName}']`).on('change', function () {
        validateRequiredFields();
      });
      break;
    default: // HtmlElementTypeEnum.Input
      $(`#${fieldName}`).on('change keyup', function (event) {
        validateRequiredFields();
      });
      break;
  }
}

export function setDynamicallyRequiredFields(stepName) {
  // check which fields we are dynamically being required
  let fields;
  if (getOptions().form === Form.Application) {
    fields = getFieldsBySectionApplication(stepName);
  } else {
    fields = getFieldsBySectionClaim(stepName);
  }

  if (!fields) return;

  Object.keys(localStorage)
    .filter((x) => x.startsWith('shouldRequire_'))
    .forEach((x) => {
      const fieldId = x.replace('shouldRequire_', '');
      const fieldDefinition = fields.find((field) => field.name === fieldId);
      if (fieldDefinition && fieldDefinition.elementType) {
        setRequiredField(fieldId, fieldDefinition.elementType);
      } else {
        setRequiredField(fieldId);
      }
    });
}
