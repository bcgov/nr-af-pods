import {
  Environment,
  Form,
  HtmlElementType,
  POWERPOD,
  doc,
} from './constants.js';
import { customizeCurrencyInput } from './currency.js';
import {
  getFieldsBySectionClaim,
  getFieldsBySectionApplication,
  getFieldConfig,
} from './fields.js';
import {
  getControlType,
  getControlValue,
  getFieldErrorDiv,
  getFieldLabel,
  getFieldRow,
  getMultiOptionSetElementValue,
  getOriginalMsosElement,
  hideFieldByFieldName,
  hideFieldRow,
  newGetOriginalMultiOptionSetElementValue,
  observeChanges,
  setFieldValue,
  showFieldRow,
} from './html.js';
import { Logger } from './logger.js';
import { FieldMaskType, maskInput } from './masking.js';
import { getOptions } from './options.js';
import { getCurrentStep } from './program.js';
import { setupTooltip } from './tooltip.js';
import { hasUpperCase } from './utils.js';
import {
  addValidationCheck,
  displayActiveFieldErrors,
  setFieldReadOnly,
  setInputMaxLength,
  validateEmailAddressField,
  validateRequiredField,
  validateRequiredFields,
  validateStepField,
  validateStepFields,
} from './fieldValidation.js';
import {
  initializeVisibleIf,
  setFieldVisibility,
} from './fieldConditionalLogic.js';
import { useScript } from './scripts.js';
import { renderCustomComponent } from './components.js';
import '../components/FileUpload.js';
import '../components/Checkbox.js';
import store from '../store/index.js';
import { getFormType } from './applicationUtils.js';
import { getEnv } from './env.js';
import { setOnChangeHandler } from './onChangeHandlers.js';
import { generateVisibleValueForBusinessNameVLB } from './valueGeneration.js';
import { hasCraNumberCheckboxEventHandler } from './customEventHandlers.js';
import { initCraNumberCheckbox } from './initValuesFns.js';
import { generateFormJson } from './form.js';

const logger = Logger('common/fieldConfiguration');

export function configureField(field) {
  const {
    name,
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
    initialValue,
    onChangeHandler,
    customComponent,
    newLabel,
    visible = true,
  } = field;
  let { elementType } = field;
  logger.info({
    fn: configureField,
    message: `setting field definition for field name: ${name}`,
    data: { field },
  });
  if (!$(`#${name}`)) {
    logger.error({
      fn: configureField,
      message: `could not find existing element for field name: ${name}`,
    });
    return;
  }
  store.dispatch('addFieldData', {
    name,
    loading: true,
  });
  if (hidden) {
    hideFieldRow({ fieldName: name, doNotBlank });
    logger.info({
      fn: configureField,
      message: `aborting field config for fieldName: ${name}, since it is hidden`,
    });
    return; // no need to do any config yet if field is hidden
  }
  setFieldObserver(name, format);
  // cleanup resize handlers that break UI
  if (elementType === HtmlElementType.MultiOptionSet) {
    const originalSelectElementForMSOS = getOriginalMsosElement(name);
    if (originalSelectElementForMSOS) {
      const { _handleWindowResize, internalScrollWrapper } =
        // @ts-ignore
        originalSelectElementForMSOS.multiSelectOptionSet();
      $(window).off('resize', _handleWindowResize);
      $(window).off('resize', internalScrollWrapper);
    }
  }
  if (label) {
    const obj = $(`#${name}_label`)?.text(label);
    obj?.html(obj?.html()?.replace(/\n/g, '<br/>'));
  } else {
    const existingLabel = getFieldLabel(name);
    store.dispatch('addFieldData', {
      name,
      label: existingLabel,
    });
  }
  if (onChangeHandler) {
    setOnChangeHandler(name, elementType, onChangeHandler);
  }
  if (hasUpperCase(name)) {
    logger.warn({
      fn: configureField,
      message: `Warning! Field name: ${name} contains an uppercase letter, please confirm if it was intentional or not.`,
    });
  }
  if (tooltipText) {
    setupTooltip({ name, tooltipText, tooltipTargetElementId, elementType });
  }
  if (bold) {
    const labelElement = $(`#${name}_label`);
    labelElement.css('font-weight', 'bold');
  }
  if (hideLabel) {
    $(`#${name}_label`)?.css('display', 'none');
  }
  // if (required) {
  //   if (elementType) {
  //     setRequiredField(name, elementType);
  //   } else {
  //     setRequiredField(name);
  //   }
  // }
  if (validation) {
    addValidationCheck(name, validation);
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
    // validateEmailAddressField(name);
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

  if (customComponent && customComponent.customElementTag) {
    logger.info({
      fn: configureField,
      message: `Start configuring custom component for field name: ${name}`,
      data: { customComponent },
    });
    const { customElementTag, mappedValueKey, customEventName } =
      customComponent;

    let customEventHandlerFn = (name) => {};
    let customInitValuesFn = (
      mappedValueKey,
      existingValue,
      customElement
    ) => {};

    if (customComponent.customEventHandler) {
      const { customEventHandler } = customComponent;
      customEventHandlerFn =
        POWERPOD.customEventHandlers[customEventHandler] ||
        customEventHandlerFn;
    }

    if (customComponent.customInitValueFn) {
      const { customInitValueFn } = customComponent;
      customInitValuesFn =
        POWERPOD.initValuesFns[customInitValueFn] || customInitValuesFn;
    }

    const params = {
      fieldId: name,
      customElementTag: customElementTag,
      customEventHandler: customEventHandlerFn(name),
      mappedValueKey: 'inputvalue',
      customEvent: customEventName,
      initValuesFn: customInitValuesFn,
    };

    logger.info({
      fn: configureField,
      message: `Rendering custom component`,
      data: { params },
    });

    renderCustomComponent(params);
  }

  if (elementType === HtmlElementType.FileInput) {
    let defaultFileTypes =
      '.csv,.doc,.docx,.odt,.pdf,.xls,.xlsx,.ods,.gif,.jpeg,.jpg,.png,.svg,.tif';
    $(`#${name}_AttachFile`)?.attr('accept', fileTypes ?? defaultFileTypes);

    logger.info({
      fn: configureField,
      message: `Start configuring custom component for FileInput`,
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
          fn: configureField,
          message: 'onChangeFileUpload event listener triggered',
          data: { event, customElement },
        });
        const docs = JSON.parse(event.detail.value);
        const fileInputStr = event.detail.fileInputStr;
        customElement.setAttribute('fileInputStr', fileInputStr);
        customElement.setAttribute('docs', JSON.stringify(docs));
        customElement.setAttribute('formType', getFormType());
        setFieldValue(name, fileInputStr);
        // validateRequiredFields();
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
    // initializeVisibleIf(name, required, visibleIf);
    setFieldVisibility(name);
  } else {
    showFieldRow(name);
  }

  store.dispatch('addFieldData', {
    name,
    loading: false,
  });

  validateStepField(name);
}

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

  Object.values(fields).forEach((field) => {
    configureField(field);
  });

  setupCanadaPostAddressComplete(fields);

  // setDynamicallyRequiredFields(stepName);

  generateFormJson(true);

  POWERPOD.configuringFields = false;
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

export function updateFieldValue(name, value = undefined) {
  const fieldConfig = getFieldConfig(name);
  const { elementType, format } = fieldConfig.elementType;
  logger.info({
    fn: updateFieldValue,
    message: `updateFieldValue called for name: ${name}, value: ${
      value === undefined ? 'NOT PASSED' : value
    }, elementType: ${elementType}, format: ${format}`,
  });
  // if no value passed, get current value from HTML
  if (value === undefined) {
    value = getControlValue({ controlId: name, raw: true });
    // switch (elementType) {
    //   case HtmlElementType.FileInput:
    //     value = $(`#${name}`)?.val();
    //     break;
    //   case HtmlElementType.MultiSelectPicklist:
    //     value = $(`#${name}`).val();
    //     break;
    //   case HtmlElementType.MultiOptionSet:
    //     value = newGetOriginalMultiOptionSetElementValue(name, true);
    //     break;
    //   case HtmlElementType.DropdownSelect:
    //     // @ts-ignore
    //     value = document.querySelector(`#${name}`)?.value;
    //     break;
    //   case HtmlElementType.Checkbox:
    //     value = document.querySelector(`#${name}`)?.checked;
    //     break;
    //   case HtmlElementType.SingleOptionSet:
    //   case HtmlElementType.DatePicker:
    //     const tr = getFieldRow(name);
    //     value = getControlValue({ controlId: name, tr, raw: true });
    //     break;
    //   default: // HtmlElementTypeEnum.Input
    //     value = $(`#${name}`)?.val();
    //     break;
    // }
    if (value === null || value === undefined) {
      logger.warn({
        fn: updateFieldValue,
        message: `nothing to save for name: ${name}, value: ${value}, format: ${format}`,
        data: { name, value, format },
      });
      store.dispatch('addFieldData', { name, value: null, revalidate: true });
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
  }
  logger.info({
    fn: updateFieldValue,
    message: `Saving field data for name: ${name} and value: ${value}, format: ${format}`,
    data: { name, value, format, elementType },
  });
  store.dispatch('addFieldData', {
    name,
    value,
    touched: true,
    revalidate: true,
  });

  if (fieldConfig.dependentFields?.length) {
    fieldConfig.dependentFields.forEach((dependentFieldName) => {
      setFieldVisibility(dependentFieldName);
    });
  }

  validateNeededFields(name);
}

export function setDirtyField(name) {
  const fieldConfig = getFieldConfig(name);
  // If field has never been touched before, always validate
  if (fieldConfig.touched === false) {
    logger.info({
      fn: setDirtyField,
      message: `Setting dirty field name: ${name} to dirty status, touched: true`,
    });
    store.dispatch('addFieldData', { name, touched: true });
  }
  validateStepField(name);
}

export function validateNeededFields(name) {
  if (POWERPOD.configuringFields) {
    logger.warn({
      fn: validateNeededFields,
      message: `Still configuring fields, DO NOT validate yet`,
    });
    return;
  }
  if (!POWERPOD.state.fieldOrder?.length) {
    return;
  }
  const fieldOrder = POWERPOD.state.fieldOrder;
  const index = fieldOrder.indexOf(name);
  const resultArray = fieldOrder.slice(0, index);
  resultArray.push(name);
  const fields = POWERPOD.state.fields;
  const fieldsToSetDirty = Object.values(fields).filter(
    (f) => resultArray.includes(f.name) && !f.hidden
  );
  const fieldsToRevalidate = Object.keys(fieldsToSetDirty).map(
    (key) => fieldsToSetDirty[key].name
  );
  logger.info({
    fn: validateNeededFields,
    message: `for name: ${name}, validating the following fields: ${JSON.stringify(
      fieldsToRevalidate
    )}`,
    data: { name, index, fieldOrder, fieldsToSetDirty, fieldsToRevalidate },
  });
  fieldsToRevalidate.forEach((res) => setDirtyField(res));
}

// this is used to update store/state values of fields
export function setFieldObserver(name, format = '') {
  // set appropriate observer/on change listener depending on field type
  const fieldConfig = getFieldConfig(name);
  const elementType = fieldConfig.elementType;
  logger.info({
    fn: setFieldObserver,
    message: `Watching for value changes on name: ${name}, elementType: ${elementType}, format: ${format}`,
  });
  switch (elementType) {
    case HtmlElementType.FileInput:
      const textareaField = $(`#${name}`);
      const attachFileField = $(`input[id=${name}_AttachFile]`);
      observeChanges(attachFileField, () => {
        updateFieldValue(name);
      });
      attachFileField?.on('change input', () => {
        updateFieldValue(name);
      });
      attachFileField?.on('focus click blur touchstart', () => {
        validateNeededFields(name);
      });
      textareaField?.on('change input', function () {
        updateFieldValue(name);
      });
      textareaField?.on('focus click blur touchstart', function () {
        validateNeededFields(name);
      });
      break;
    case HtmlElementType.DatePicker:
      const datePickerElement = $(
        `input[id=${name}_datepicker_description]`
      ).parent()[0];
      observeChanges(datePickerElement, () => updateFieldValue(name));
      $(`#${name}_datepicker_description`).on('change input', () => {
        updateFieldValue(name);
      });
      $(`#${name}_datepicker_description`).on(
        'focus click blur touchstart',
        () => {
          if (fieldConfig.touched === false) {
            validateNeededFields(name);
          }
        }
      );
      break;
    case HtmlElementType.MultiSelectPicklist:
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      $(`input[id*='${name}']`).on('change input', function () {
        updateFieldValue(name);
      });
      $(`input[id*='${name}']`).on('focus click blur touchstart', function () {
        validateNeededFields(name);
      });
      break;
    case HtmlElementType.DropdownSelect:
      $(`select[id*='${name}']`).on('change input', function () {
        updateFieldValue(name);
      });
      $(`select[id*='${name}']`).on('focus click blur touchstart', function () {
        validateNeededFields(name);
      });
      break;
    case HtmlElementType.Checkbox:
    default: // HtmlElementTypeEnum.Input
      $(`#${name}`).on('change input', function (event) {
        updateFieldValue(name);
      });
      $(`#${name}`).on('focus click blur touchstart', function (event) {
        validateNeededFields(name);
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

  // let errorMessageElement = getFieldErrorDiv(fieldName);

  // let div = document.createElement('div');
  // div.id = `${fieldName}_error_message`;
  // div.className = 'error_message';
  // // @ts-ignore
  // div.style = 'display:none;';
  // div.innerHTML = `<span'>${validationErrorMessage}</span>`;
  // $(`#${fieldName}`).parent().append(div);

  switch (elemType) {
    case HtmlElementType.FileInput:
      const textareaField = $(`#${fieldName}`);
      const attachFileField = $(`input[id=${fieldName}_AttachFile]`);
      logger.info({
        fn: setRequiredField,
        message: 'observe changes on file input element',
        data: { attachFileField, textareaField, fieldName },
      });
      // observeChanges(attachFileField);
      // attachFileField?.on('blur input', () => {
      //   validateRequiredField(fieldName);
      // });
      // textareaField?.on('change', function () {
      //   validateRequiredField(fieldName);
      // });
      break;
    case HtmlElementType.DatePicker:
      logger.info({
        fn: setRequiredField,
        message: `Configuring required datepicker element for fieldName: ${fieldName}`,
      });
      // const datePickerElement = $(
      //   `input[id=${fieldName}_datepicker_description]`
      // ).parent()[0];
      // // logger.info({
      // //   fn: setRequiredField,
      // //   message: 'observe changes on datepicker element',
      // //   data: { datePickerElement },
      // // });
      // // observeChanges(datePickerElement);
      // // $(`#${fieldName}_datepicker_description`).on('blur input', () => {
      // //   validateRequiredField(fieldName);
      // // });
      break;
    case HtmlElementType.MultiSelectPicklist:
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      // $(`input[id*='${fieldName}']`).on('change', function () {
      //   validateRequiredField(fieldName);
      // });
      break;
    case HtmlElementType.DropdownSelect:
      // $(`select[id*='${fieldName}']`).on('change', function () {
      //   validateRequiredField(fieldName);
      // });
      break;
    default: // HtmlElementTypeEnum.Input
      // $(`#${fieldName}`).on('change keyup', function (event) {
      //   validateRequiredField(fieldName);
      // });
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
