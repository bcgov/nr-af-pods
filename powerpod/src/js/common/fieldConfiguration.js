import { Environment, Form, HtmlElementType, doc } from './constants.js';
import { customizeCurrencyInput } from './currency.js';
import {
  getFieldsBySectionClaim,
  getFieldsBySectionApplication,
} from './fields.js';
import { hideFieldByFieldName, observeChanges, setFieldValue } from './html.js';
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
import { initializeVisibleIf } from './fieldConditionalLogic.js';
import { useScript } from './scripts.js';
import { renderCustomComponent } from './components.js';
import '../components/FileUpload.js';
import store from '../store/index.js';
import { getFormType } from './applicationUtils.js';
import { getEnv } from './env.js';
import { setOnChangeHandler } from '../onChangeHandlers.js';

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
      initialValue,
      onChangeHandler,
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
      return;
    }
    if (onChangeHandler) {
      setOnChangeHandler(name, elementType, onChangeHandler);
    }
    setFieldObserver(name, elementType, format);
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
    if (tooltipText) {
      setupTooltip({ name, tooltipText, tooltipTargetElementId, elementType });
    }
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
    if (initialValue) {
      setFieldValue(name, initialValue, elementType);
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

      logger.info({
        fn: configureFields,
        message: 'Start configuring custom component',
      });
      renderCustomComponent({
        fieldId: name,
        customElementTag: 'file-upload',
        attributes: {
          fieldName: name,
        },
        customEvent: 'onChangeFileUpload',
        customEventHandler: (event, customElement) => {
          logger.info({
            fn: configureFields,
            message: 'onChangeFileUpload event listener triggered',
            data: { event, customElement },
          });
          const docs = JSON.parse(event.detail.value);
          const fileInputStr = event.detail.fileInputStr;
          customElement.setAttribute('fileInputStr', fileInputStr);
          customElement.setAttribute('docs', JSON.stringify(docs));
          customElement.setAttribute('formType', getFormType());
          setFieldValue(name, fileInputStr);
          validateRequiredFields();
        },
        mappedValueKey: 'fileInputStr',
        customSetupFn: () => {
          const notes = doc.getElementById('notescontrol');
          const entityNotes = notes?.querySelector('.entity-notes');
          if (entityNotes) {
            // @ts-ignore
            entityNotes.style.display = 'none';
          }
        },
      });
    }
    if (visibleIf && !hidden) {
      initializeVisibleIf(name, required, visibleIf);
    }
  }

  setupCanadaPostAddressComplete(fields);

  setDynamicallyRequiredFields(stepName);
}

function setupCanadaPostAddressComplete(fields) {
  const env = getEnv();

  if (env !== Environment.PROD) {
    logger.warn({
      fn: setupCanadaPostAddressComplete,
      message: `Skipping Canada Post since env detected is not prod, but is env: ${env}`,
    });
    return;
  }

  const options = {
    key: 'kb98-fz49-gp47-dk74',
  };
  const cpFieldNames = [
    'quartech_businesssuitenumberoptional',
    'quartech_businessstreetnumber',
    'quartech_businessstreet',
    'quartech_businesscity',
    'quartech_businessprovinceterritory',
    'quartech_businesspostalcode',
  ];

  const allCpFieldsPresent = cpFieldNames.every((cpFieldName) => {
    return fields.some(
      // @ts-ignore
      (field) => field.name === cpFieldName
    );
  });

  logger.info({
    fn: setupCanadaPostAddressComplete,
    message: `Checked if all addresscomplete fields exist in fields data: allCpFieldsPresent: ${allCpFieldsPresent}`,
    data: { cpFieldNames, fields, allCpFieldsPresent },
  });

  if (allCpFieldsPresent) {
    useScript('canadapost', () => {
      // @ts-ignore
      const pca = window.pca;

      logger.info({
        fn: setupCanadaPostAddressComplete,
        message: 'Starting to setup canadapost addresscomplete',
        data: { pca, options },
      });

      const fieldConfig = [
        {
          element: 'quartech_businesssuitenumberoptional',
          field: 'SubBuilding',
          mode: pca.fieldMode.DEFAULT,
        },
        {
          element: 'quartech_businessstreetnumber',
          field: 'BuildingNumber',
          mode: pca.fieldMode.DEFAULT,
        },
        {
          element: 'quartech_businessstreet',
          field: 'Street',
          mode: pca.fieldMode.POPULATE,
        },
        {
          element: 'quartech_businesscity',
          field: 'City',
          mode: pca.fieldMode.POPULATE,
        },
        {
          element: 'quartech_businessprovinceterritory',
          field: 'ProvinceName',
          mode: pca.fieldMode.POPULATE,
        },
        {
          element: 'quartech_businesspostalcode',
          field: 'PostalCode',
          mode: pca.fieldMode.POPULATE,
        },
      ];

      const scriptEl = doc.createElement('script');
      scriptEl.setAttribute('type', 'text/javascript');
      scriptEl.innerHTML = `
          var fields = ${JSON.stringify(fieldConfig)},
          options = ${JSON.stringify(options)},
          control = new pca.Address(fields, options);
        `;
      doc.head.appendChild(scriptEl);

      logger.info({
        fn: setupCanadaPostAddressComplete,
        message: 'Successfully configured canadapost addresscomplete',
      });
    });
    return;
  }

  logger.info({
    fn: setupCanadaPostAddressComplete,
    message:
      'Canadapost addresscomplete fields not found, no need to load script',
  });
}

export function updateFieldValue(name, elementType, format) {
  logger.info({
    fn: updateFieldValue,
    message: `updateFieldValue called for name: ${name}, elementType: ${elementType}, format: ${format}`,
  });
  let value = '';
  switch (elementType) {
    case HtmlElementType.FileInput:
      value = $(`#${name}`)?.val();
      break;
    case HtmlElementType.MultiOptionSet:
      logger.error({
        fn: updateFieldValue,
        message: 'updateFieldValue not setup for multi options sets yet',
      });
      break;
    case HtmlElementType.DropdownSelect:
      // @ts-ignore
      value = document.querySelector(`#${name}`)?.value;
      break;
    case HtmlElementType.Checkbox:
      value = document.querySelector(`#${name}`)?.checked;
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.DatePicker:
    default: // HtmlElementTypeEnum.Input
      value = $(`#${name}`)?.val();
      break;
  }
  if (value === null || value === undefined) {
    logger.warn({
      fn: updateFieldValue,
      message: `nothing to save for name: ${name}, value: ${value}, format: ${format}`,
      data: { name, value, format },
    });
    store.dispatch('addFieldData', { name, value: null });
    return;
  }
  if (format === 'currency') {
    let noCommas = value.replace(/,/g, '');
    let floatNumber = parseFloat(noCommas);
    // @ts-ignore
    value = floatNumber;
  } else if (format === 'number') {
    let integerNumber = parseInt(value, 10);
    // @ts-ignore
    value = integerNumber;
  }
  logger.info({
    fn: updateFieldValue,
    message: `Saving field data for name: ${name} and value: ${value}, format: ${format}`,
    data: { name, value, format, elementType },
  });
  store.dispatch('addFieldData', { name, value });
}

// this is used to update store/state values of fields
export function setFieldObserver(
  fieldName,
  elementType = HtmlElementType.Input,
  format = ''
) {
  // set appropriate observer/on change listener depending on field type
  logger.info({
    fn: setFieldObserver,
    message: `Watching for value changes on name: ${fieldName}, elementType: ${elementType}`,
    data: { fieldName, elementType, format },
  });
  switch (elementType) {
    case HtmlElementType.FileInput:
      const textareaField = $(`#${fieldName}`);
      const attachFileField = $(`input[id=${fieldName}_AttachFile]`);
      observeChanges(attachFileField, () => {
        updateFieldValue(fieldName, elementType, format);
      });
      attachFileField?.on('blur input', () => {
        updateFieldValue(fieldName, elementType, format);
      });
      textareaField?.on('change', function () {
        updateFieldValue(fieldName, elementType, format);
      });
      break;
    case HtmlElementType.DatePicker:
      const datePickerElement = $(
        `input[id=${fieldName}_datepicker_description]`
      ).parent()[0];
      observeChanges(datePickerElement, () =>
        updateFieldValue(fieldName, elementType)
      );
      $(`#${fieldName}_datepicker_description`).on('blur input', () => {
        updateFieldValue(fieldName, elementType, format);
      });
      break;
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      $(`input[id*='${fieldName}']`).on('change', function () {
        updateFieldValue(fieldName, elementType, format);
      });
      break;
    case HtmlElementType.DropdownSelect:
      $(`select[id*='${fieldName}']`).on('change', function () {
        updateFieldValue(fieldName, elementType, format);
      });
      break;
    case HtmlElementType.Checkbox:
    default: // HtmlElementTypeEnum.Input
      $(`#${fieldName}`).on('change keyup', function (event) {
        updateFieldValue(fieldName, elementType, format);
      });
      break;
  }
}

export function setRequiredField(
  fieldName,
  elemType = HtmlElementType.Input,
  validationErrorMessage = 'Required field'
) {
  logger.info({
    fn: setRequiredField,
    message: `Start configuring required fieldName: ${fieldName}, elemType: ${elemType}`,
    data: {
      element: $(`#${fieldName}`),
      fieldName,
      elemType,
      validationErrorMessage,
    },
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
      const textareaField = $(`#${fieldName}`);
      const attachFileField = $(`input[id=${fieldName}_AttachFile]`);
      logger.info({
        fn: setRequiredField,
        message: 'observe changes on file input element',
        data: { attachFileField, textareaField, fieldName },
      });
      observeChanges(attachFileField);
      attachFileField?.on('blur input', () => {
        validateRequiredFields();
      });
      textareaField?.on('change', function () {
        validateRequiredFields();
      });
      break;
    case HtmlElementType.DatePicker:
      logger.info({
        fn: setRequiredField,
        message: `Configuring required datepicker element for fieldName: ${fieldName}`,
      });
      const datePickerElement = $(
        `input[id=${fieldName}_datepicker_description]`
      ).parent()[0];
      logger.info({
        fn: setRequiredField,
        message: 'observe changes on datepicker element',
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
