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
  addTextAboveField,
  addTextBelowField,
  getControlValue,
  getFieldLabel,
  getOriginalMsosElement,
  hideFieldRow,
  observeChanges,
  setFieldNameLabel,
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
  setFieldReadOnly,
  setInputMaxLength,
  validateStepField,
} from './fieldValidation.js';
import { setFieldVisibility } from './fieldConditionalLogic.js';
import { useScript } from './scripts.js';
import { renderCustomComponent } from './components.js';
import '../components/FileUpload.js';
import '../components/Checkbox.js';
import store from '../store/index.js';
import { getFormType } from './applicationUtils.js';
import { getEnv } from './env.js';
import { setOnChangeHandler } from './onChangeHandlers.js';
import { generateFormJson } from './form.js';

// Note: DO NOT remove the below, they are neccesary to import required event handler fns
//       This is needed due to tree shaking during compilation.
import { hasCraNumberCheckboxEventHandler } from './customEventHandlers.js';
import { initCraNumberCheckbox } from './initValuesFns.js';

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
    additionalTextAboveField,
    additionalTextBelowField,
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
  // setFieldObserver(name, format);
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
    logger.info({
      fn: configureField,
      message: `Found field label configuration for name: ${name}, label: ${label}, existingLabel: ${$(
        `#${name}_label`
      )?.html()}`,
    });
    setFieldNameLabel(name, label);
    const updatedLabel = $(`#${name}_label`).html();
    store.dispatch('addFieldData', {
      name,
      label: updatedLabel,
    });
    logger.info({
      fn: configureField,
      message: `Successfully set field label for name: ${name}, label: ${updatedLabel}, selector: ${`#${name}_label`}`,
      data: { label, updatedLabel, name },
    });
  } else {
    const existingLabel = getFieldLabel(name);
    store.dispatch('addFieldData', {
      name,
      label: existingLabel,
    });
  }
  if (additionalTextBelowField) {
    addTextBelowField(name, additionalTextBelowField);
  }
  if (additionalTextAboveField) {
    addTextAboveField(name, additionalTextAboveField);
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
  if (validation) {
    addValidationCheck(name, validation);
  }
  if (initialValue) {
    // ONLY set initialValue if there's no existing value present
    const currValue = getControlValue({ controlId: name, raw: true });
    if (!currValue) {
      // @ts-ignore
      setFieldValue({
        name,
        value: initialValue,
        elementType,
        skipValidation: true,
      });
    }
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
        // @ts-ignore
        setFieldValue({ name, value: fileInputStr });
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

  logger.info({
    fn: configureField,
    message: `DONE configuring field: ${name}, setting POWERPOD.state.field['${name}'].loading = false`,
  });

  validateStepField(name);

  setFieldObserver(name, format);
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
  logger.info({
    fn: configureFields,
    message: `DONE configuring fields, setting POWERPOD.configuringFields = false`,
  });
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

  const fieldKeys = Object.keys(fields);

  const allCpFieldsPresent = cpFieldNames.every((cpFieldName) => {
    return fieldKeys.some(
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

export function updateFieldValue({
  name,
  value = undefined,
  skipValidation = false,
  origin = '',
}) {
  const params = {
    name,
    value,
    skipValidation,
    origin,
  };
  logger.info({
    fn: updateFieldValue,
    message: `updateFieldValue called for name: ${name}, origin: ${origin}, is still configuringFields: ${POWERPOD.configuringFields}, loading: ${POWERPOD.loading}`,
    data: params,
  });
  const fieldConfig = getFieldConfig(name);
  const { elementType, format } = fieldConfig.elementType;
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

  if (
    !fieldConfig?.customComponent?.customEventHandler &&
    fieldConfig.value === value
  ) {
    logger.info({
      fn: updateFieldValue,
      message: `No need to update state or validate new value as it is the same for name: ${name}`,
      data: { params, fieldConfig, value },
    });
    return;
  }

  logger.info({
    fn: updateFieldValue,
    message: `Saving field data for name: ${name} and value: ${value}, format: ${format}`,
    data: { name, value, format, elementType },
  });
  store.dispatch('addFieldData', {
    name,
    value,
    touched: skipValidation ? false : true,
    revalidate: true,
  });

  if (fieldConfig.dependentFields?.length) {
    fieldConfig.dependentFields.forEach((dependentFieldName) => {
      setFieldVisibility(dependentFieldName);
    });
  }

  if (!skipValidation)
    validateNeededFields({ name, origin: updateFieldValue.name });
}

export function setDirtyField(name) {
  logger.info({
    fn: setDirtyField,
    message: `set dirty field for name: ${name}`,
  });
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

export function validateNeededFields({ name, origin = '' }) {
  logger.info({
    fn: validateNeededFields,
    message: `called for name: ${name} from origin: ${origin}`,
  });
  if (POWERPOD.configuringFields) {
    logger.warn({
      fn: validateNeededFields,
      message: `Still configuring fields, DO NOT validate yet`,
    });
    return;
  }
  if (!POWERPOD.state.fieldOrder?.length) {
    logger.error({
      fn: validateNeededFields,
      message: `No fields found in powerpod.state.fieldOrder, unable to validate`,
    });
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
      // observeChanges(attachFileField, () => {
      //   updateFieldValue(name);
      // });
      attachFileField?.on('change input', (event) => {
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} change input | event.type: ${event.type}`,
        });
      });
      attachFileField?.on('focus click blur touchstart', (event) => {
        validateNeededFields({
          name,
          origin: `${setFieldObserver.name} focus click blur touchstart | event.type: ${event.type}`,
        });
      });
      textareaField?.on('change input', function (event) {
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} change input | event.type: ${event.type}`,
        });
      });
      textareaField?.on('focus click blur touchstart', function (event) {
        validateNeededFields({
          name,
          origin: `${setFieldObserver.name} focus click blur touchstart | event.type: ${event.type}`,
        });
      });
      break;
    case HtmlElementType.DatePicker:
      const inputElement = $(`#${name}`);
      const inputElementParent = inputElement.parent()[0];
      const datePickerElement = $(`input[id=${name}_datepicker_description]`);
      const datePickerParentElement = datePickerElement.parent()[0];
      logger.info({
        fn: setFieldObserver,
        message: 'datePickerElement:',
        data: {
          inputElement,
          inputElementParent,
          datePickerElement,
          datePickerParentElement,
        },
      });
      observeChanges(inputElementParent, () =>
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} observeChanges(datePickerElement)`,
        })
      );
      $(`#${name}_datepicker_description`).on('change input', (event) => {
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} change input | event.type: ${event.type}`,
        });
      });
      $(`#${name}_datepicker_description`).on(
        'focus click blur touchstart',
        (event) => {
          validateNeededFields({
            name,
            origin: `${setFieldObserver.name} focus click blur touchstart | event.type: ${event.type}`,
          });
        }
      );
      break;
    case HtmlElementType.MultiSelectPicklist:
    case HtmlElementType.SingleOptionSet:
    case HtmlElementType.MultiOptionSet:
      const inputElements = $(`input[id*='${name}']`).parent();
      logger.info({
        fn: setFieldObserver,
        message: `setting name: ${name} elementType: ${HtmlElementType.MultiOptionSet} observer`,
        data: { inputElements },
      });
      inputElements.on('change input', function (event) {
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} change input | event.type: ${event.type}`,
        });
      });
      inputElements.on('focus click blur touchstart', function (event) {
        validateNeededFields({
          name,
          origin: `${setFieldObserver.name} focus click blur touchstart | event.type: ${event.type}`,
        });
      });
      break;
    case HtmlElementType.DropdownSelect:
      $(`select[id*='${name}']`).on('change input', function (event) {
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} change input | event.type: ${event.type}`,
        });
      });
      $(`select[id*='${name}']`).on(
        'focus click blur touchstart',
        function (event) {
          validateNeededFields({
            name,
            origin: `${setFieldObserver.name} focus click blur touchstart | event.type: ${event.type}`,
          });
        }
      );
      break;
    case HtmlElementType.Checkbox:
    default: // HtmlElementTypeEnum.Input
      $(`#${name}`).on('change input', function (event) {
        updateFieldValue({
          name,
          origin: `${setFieldObserver.name} change input | event.type: ${event.type}`,
        });
      });
      $(`#${name}`).on('focus click blur touchstart', function (event) {
        validateNeededFields({
          name,
          origin: `${setFieldObserver.name} focus click blur touchstart | event.type: ${event.type}`,
        });
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
