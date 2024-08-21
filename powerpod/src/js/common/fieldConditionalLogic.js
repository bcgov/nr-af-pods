import { getCurrentStep } from './program.ts';
import {
  configureField,
  setDynamicallyRequiredFields,
} from './fieldConfiguration.js';
import {
  validateNumericFieldValue,
  validateStepField,
  validateStepFields,
} from './fieldValidation.js';
import { Logger } from './logger.js';
import {
  disableSingleLine,
  getControlValue,
  getFieldRow,
  hideFieldRow,
  hideQuestion,
  setMultiSelectValues,
  showFieldRow,
} from './html.js';
import { getFieldConfig } from './fields.js';
import { HtmlElementType, POWERPOD } from './constants.js';
import store from '../store/index.js';

const logger = Logger('common/fieldConditionalLogic');

export function assignDependentFields(fieldConfig) {
  const { name } = fieldConfig;
  logger.info({
    fn: assignDependentFields,
    message: `starting to set dependent fields for name: ${name}`,
    data: { fieldConfig },
  });

  if (fieldConfig.visibleIf.fieldName) {
    const { fieldName: controlFieldName } = fieldConfig.visibleIf;
    const controlFieldConfig = getFieldConfig(controlFieldName);
    checkControlDependentFields({
      controlFieldConfig,
      name,
      fieldConfig,
      controlFieldName,
    });
  } else if (
    fieldConfig.visibleIf.comparisons &&
    Array.isArray(fieldConfig.visibleIf.comparisons)
  ) {
    const { comparisons } = fieldConfig.visibleIf;
    comparisons.forEach((c) => {
      const { fieldName: controlFieldName } = c;
      const controlFieldConfig = getFieldConfig(controlFieldName);
      checkControlDependentFields({
        controlFieldConfig,
        name,
        fieldConfig,
        controlFieldName,
      });
    });
  }
}

export function checkControlDependentFields(params) {
  const { controlFieldConfig, name, fieldConfig, controlFieldName } = params;
  if (
    controlFieldConfig.dependentFields &&
    Array.isArray(controlFieldConfig.dependentFields) &&
    controlFieldConfig.dependentFields?.includes(name)
  ) {
    logger.info({
      fn: checkControlDependentFields,
      message: `dependent field name: ${name} already assigned to controlFieldName: ${controlFieldName}`,
      data: { fieldConfig, controlFieldConfig },
    });
    return;
  }

  const dependentFields = controlFieldConfig.dependentFields || [];
  dependentFields.push(name);

  store.dispatch('addFieldData', { name: controlFieldName, dependentFields });
}

export function setFieldVisibility(name) {
  const fieldConfig = getFieldConfig(name);
  logger.info({
    fn: setFieldVisibility,
    message: `starting to set field visibility for name: ${name}`,
    data: { fieldConfig },
  });
  assignDependentFields(fieldConfig);
  const { visibleIf, doNotBlank } = fieldConfig;
  let matchesCondition = false;
  if (visibleIf.fieldName) {
    const {
      fieldName: dependentOnFieldName,
      selectedValue,
      selectedValueIn,
      comparison,
      value,
    } = visibleIf;

    const fieldRow = getFieldRow(dependentOnFieldName);

    const controlValue = getControlValue({
      controlId: dependentOnFieldName,
      tr: fieldRow,
      raw: true,
    });

    if (comparison && value) {
      logger.info({
        fn: setFieldVisibility,
        message: `checkVisibleIfComparison for name: ${name}`,
        data: {
          name,
          visibleIf,
          controlValue,
        },
      });
      matchesCondition = checkVisibleIfComparison({
        name,
        dependentOnFieldName,
        controlValue,
        comparison,
        value,
      });
    } else {
      logger.info({
        fn: setFieldVisibility,
        message: `checkVisibleIfCondition for name: ${name}`,
        data: {
          name,
          visibleIf,
          controlValue,
        },
      });

      matchesCondition = checkVisibleIfCondition({
        name,
        controlValue,
        selectedValue,
        selectedValueIn,
      });
    }
  } else if (visibleIf.comparison && visibleIf.comparison === 'or') {
    const { comparison, comparisons } = visibleIf;
    matchesCondition = comparisons.some((c) => {
      const { fieldName, selectedValue, selectedValueIn } = c;
      const fieldRow = getFieldRow(fieldName);
      const controlValue = getControlValue({
        controlId: fieldName,
        tr: fieldRow,
        raw: true,
      });
      logger.info({
        fn: setFieldVisibility,
        message: `calling checkVisibleIfCondition for name: ${name}, checking fieldName: ${fieldName}`,
        data: {
          name,
          c,
          controlValue,
        },
      });
      return checkVisibleIfCondition({
        name,
        controlValue,
        selectedValue,
        selectedValueIn,
      });
    });
  }

  if (matchesCondition) {
    showFieldRow(name);
    validateStepField(name);
  } else {
    hideFieldRow({ fieldName: name, doNotBlank });
  }
}

export function checkVisibleIfComparison({
  name,
  dependentOnFieldName,
  controlValue,
  comparison,
  value,
}) {
  const params = {
    name,
    controlValue,
    comparison,
    value,
  };
  logger.info({
    fn: checkVisibleIfComparison,
    message: `for name: ${name}, doing a comparison: ${comparison}, controlValue: ${controlValue}`,
    data: { params },
  });
  if (controlValue === '') {
    logger.info({
      fn: checkVisibleIfComparison,
      message: `for name: ${name}, cannot compare an empty value, DOES NOT match visibleIf condition`,
      data: { params },
    });
    return false;
  }
  const getNumericValidationError = validateNumericFieldValue(
    dependentOnFieldName,
    value,
    comparison,
    true
  );
  logger.info({
    fn: checkVisibleIfComparison,
    message: `for name: ${name}, comparison: ${comparison} returned numericValidationResult: ${getNumericValidationError}, controlValue: ${controlValue}`,
    data: { params },
  });
  // if there's no error, means conditions match
  if (getNumericValidationError === '') {
    return true;
  }
  return false;
}

export function checkVisibleIfCondition({
  name,
  controlValue,
  selectedValue,
  selectedValueIn,
}) {
  const params = { name, controlValue, selectedValue, selectedValueIn };
  if (
    controlValue === selectedValue ||
    controlValue === `${selectedValue}` ||
    selectedValueIn?.includes(controlValue) ||
    (controlValue?.includes && controlValue?.includes(selectedValue)) ||
    (Number(controlValue) && selectedValueIn?.includes(Number(controlValue)))
  ) {
    logger.info({
      fn: checkVisibleIfCondition,
      message: `for name: ${name}, FOUND matching condition`,
      data: { params },
    });
    return true;
    // showFieldRow(name);
    // store.dispatch('addFieldData', { name, visible: true });
  } else {
    logger.info({
      fn: checkVisibleIfCondition,
      message: `for name: ${name}, found did NOT find matching condition`,
      data: { params },
    });
    return false;
    // hideFieldRow(name, doNotBlank);
    // hideQuestion(name);
    // store.dispatch('addFieldData', { name, visible: false });
  }
}

export function initializeVisibleIf(name, required, visibleIf) {
  const {
    fieldName: dependentFieldName,
    selectedValue: dependentSelectedValue,
    selectedValueIn: dependentSelectedValueIn,
  } = visibleIf;

  logger.info({
    fn: initializeVisibleIf,
    message: 'Starting to configure dynamic field using visibleIf',
    data: {
      name,
      dependentSelectedValue,
      dependentSelectedValueIn,
      dependentFieldName,
      disableRequiredProp: !required,
    },
  });

  if (
    !dependentFieldName ||
    (dependentSelectedValue === undefined &&
      (dependentSelectedValueIn === undefined ||
        dependentSelectedValueIn?.length === 0))
  ) {
    logger.error({
      fn: initializeVisibleIf,
      message:
        'Dynamically configured visibleIf field missing fieldName or selectedValue',
      data: {
        name,
        dependentFieldName,
        dependentSelectedValue,
        dependentSelectedValueIn,
      },
    });
    return;
  }

  // Make sure field is visible initially
  // showFieldRow(name);

  // @ts-ignore
  initOnChange_DependentRequiredField({
    requiredFieldTag: name,
    dependentOnElementTag: dependentFieldName,
    dependentOnValue: dependentSelectedValue,
    dependentOnValueArray: dependentSelectedValueIn,
    disableRequiredProp: !required,
  });

  logger.info({
    fn: initializeVisibleIf,
    message: `Successfully initialized dynamic field with name: ${name}`,
    data: {
      dependentSelectedValue,
      dependentFieldName,
      dependentSelectedValueIn,
      required,
    },
  });
}

export function initOnChange_DependentRequiredField({
  dependentOnValue,
  dependentOnValueArray,
  dependentOnElementTag,
  requiredFieldTag,
  overrideTruthyClause = undefined,
  validationFunc,
  setRequiredFieldsFunc,
  disableRequiredProp = false,
  customFunc,
}) {
  const dependentOnElement = document.querySelector(
    `#${dependentOnElementTag}`
  );
  if (!dependentOnElement) {
    logger.error({
      fn: initOnChange_DependentRequiredField,
      message: `Could not find field for dependentOnElementTag: ${dependentOnElementTag}`,
    });
    return;
  }

  // INITIAL LOAD/SETUP:
  setupDependentRequiredField({
    dependentOnValue,
    dependentOnValueArray,
    dependentOnElementTag,
    requiredFieldTag,
    overrideTruthyClause,
    validationFunc,
    setRequiredFieldsFunc,
    disableRequiredProp,
    customFunc,
  });

  // ON CHANGE:
  $(dependentOnElement).on('change', () => {
    setupDependentRequiredField({
      dependentOnValue,
      dependentOnValueArray,
      dependentOnElementTag,
      requiredFieldTag,
      overrideTruthyClause,
      validationFunc,
      setRequiredFieldsFunc,
      disableRequiredProp,
      customFunc,
    });
  });
}

function setupDependentRequiredField({
  dependentOnValue,
  dependentOnValueArray = [],
  dependentOnElementTag,
  requiredFieldTag,
  overrideTruthyClause = undefined,
  validationFunc,
  setRequiredFieldsFunc,
  disableRequiredProp = false,
  customFunc,
}) {
  const dependentOnElement = document.querySelector(
    `#${dependentOnElementTag}`
  );
  if (!dependentOnElement) {
    logger.error({
      fn: setupDependentRequiredField,
      message: `requiredFieldTag: ${requiredFieldTag}, could not find field for dependentOnElementTag: ${dependentOnElementTag}`,
    });
    return;
  }
  // @ts-ignore
  const tr = dependentOnElement.closest('tr');
  const input = getControlValue({
    controlId: dependentOnElementTag,
    tr,
    raw: true,
  });
  logger.info({
    fn: setupDependentRequiredField,
    message: `requiredFieldTag: ${requiredFieldTag}, setting up dependent field dependentOnElementTag: ${dependentOnElementTag} with value: ${
      input ?? ''
    }`,
  });
  if (overrideTruthyClause != undefined) {
    logger.info({
      fn: setupDependentRequiredField,
      message: `requiredFieldTag: ${requiredFieldTag}, overriding truthy clause overrideTruthyClause: ${overrideTruthyClause}`,
      data: { dependentOnElementTag, input },
    });
    if (overrideTruthyClause === true) {
      shouldRequireDependentField({
        shouldBeRequired: true,
        requiredFieldTag,
        validationFunc,
        setRequiredFieldsFunc,
        disableRequiredProp,
        customFunc,
      });
    } else {
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag,
        validationFunc,
        setRequiredFieldsFunc,
        disableRequiredProp,
        customFunc,
      });
    }
  } else {
    if (
      input === dependentOnValue ||
      input === `${dependentOnValue}` ||
      dependentOnValueArray.includes(input) ||
      input?.includes(dependentOnValue) ||
      (Number(input) && dependentOnValueArray.includes(Number(input)))
    ) {
      logger.info({
        fn: setupDependentRequiredField,
        message: `requiredFieldTag: ${requiredFieldTag}, value matches visibleIf condition, dependentOnElementTag: ${dependentOnElementTag}`,
        data: {
          dependentOnElementTag,
          input,
          dependentOnValue,
          dependentOnValueArray,
          requiredFieldTag,
        },
      });
      shouldRequireDependentField({
        shouldBeRequired: true,
        requiredFieldTag,
        validationFunc,
        setRequiredFieldsFunc,
        disableRequiredProp,
        customFunc,
      });
    } else {
      logger.info({
        fn: setupDependentRequiredField,
        message: `requiredFieldTag: ${requiredFieldTag}, value DOES NOT match visibleIf condition`,
        data: {
          dependentOnElementTag,
          input,
          dependentOnValue,
          dependentOnValueArray,
          requiredFieldTag,
        },
      });
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag,
        validationFunc,
        setRequiredFieldsFunc,
        disableRequiredProp,
        customFunc,
      });
    }
  }
}

export function shouldRequireDependentField({
  shouldBeRequired,
  requiredFieldTag,
  validationFunc = validateStepFields,
  setRequiredFieldsFunc = setDynamicallyRequiredFields,
  disableRequiredProp,
  customFunc,
}) {
  const requiredFieldLabelElement = document.querySelector(
    `#${requiredFieldTag}_label`
  );
  const requiredFieldRow = requiredFieldLabelElement?.closest('tr');
  const requiredFieldInputElement = document.querySelector(
    `#${requiredFieldTag}`
  );

  if (
    !requiredFieldLabelElement ||
    !requiredFieldRow ||
    !requiredFieldInputElement
  ) {
    logger.error({
      fn: shouldRequireDependentField,
      message: 'Failed to find required elements',
      data: {
        requiredFieldTag,
        requiredFieldLabelElement,
        requiredFieldRow,
        requiredFieldInputElement,
      },
    });
    return;
  }

  const fieldConfig = getFieldConfig(requiredFieldTag);
  const loadingAllFieldConfig = POWERPOD.configuringFields;
  const loadingFieldConfig =
    POWERPOD.state?.fields?.[requiredFieldTag]?.loading;

  if (shouldBeRequired) {
    logger.info({
      fn: shouldRequireDependentField,
      message: `Setting dynamic field to visible requiredFieldTag: ${requiredFieldTag}, loadingAllFieldConfig: ${loadingAllFieldConfig}, loadingFieldConfig: ${loadingFieldConfig}`,
    });
    $(requiredFieldRow).css({ display: '' });

    if (!disableRequiredProp) {
      // @ts-ignore
      // localStorage.setItem(`shouldRequire_${requiredFieldTag}`, true);
      // if (setRequiredFieldsFunc) {
      //   setRequiredFieldsFunc(getCurrentStep());
      // }

      // if (validationFunc) {
      //   validationFunc(getCurrentStep());
      //   // re-validate every time user modifies additional info input
      //   $(requiredFieldInputElement).change(function () {
      //     validationFunc(getCurrentStep());
      //   });
      // }
      if (!loadingAllFieldConfig && !loadingFieldConfig) {
        configureField(fieldConfig);
      }
      validateStepField(requiredFieldTag);

      if (!!fieldConfig?.visibleIf?.valueIfVisible) {
        const { type, value } = fieldConfig.visibleIf.valueIfVisible;
        logger.info({
          fn: shouldRequireDependentField,
          message: `visibleIf.valueIfVisible has been configured for fieldName: ${requiredFieldTag}, start setup with values:`,
          data: { valueIfVisible: fieldConfig.visibleIf.valueIfVisible },
        });

        if (type === 'raw' && (value !== undefined || value !== null)) {
          logger.info({
            fn: shouldRequireDependentField,
            message: `visibleIf.valueIfVisible has been configured, setting value: ${value} for fieldName: ${requiredFieldTag}`,
          });
          $(requiredFieldInputElement).val(value);
        } else if (type === 'function') {
          const valueGeneratorFunction = POWERPOD.valueGeneration[value];
          if (
            !valueGeneratorFunction ||
            typeof valueGeneratorFunction !== 'function'
          ) {
            logger.error({
              fn: shouldRequireDependentField,
              message: `for fieldName: ${requiredFieldTag} could not find valueGeneration function for value: ${value}`,
            });
            return;
          }
          const newValue = valueGeneratorFunction();
          if (newValue == undefined) {
            logger.info({
              fn: shouldRequireDependentField,
              message: `visibleIf.valueIfVisible has been configured, valueGenerator: ${value} returned undefined, skipping setting value for fieldName: ${requiredFieldTag}`,
            });
            return;
          }
          logger.info({
            fn: shouldRequireDependentField,
            message: `visibleIf.valueIfVisible has been configured, valueGenerator: ${value} returned and setting value: ${newValue} for fieldName: ${requiredFieldTag}`,
          });
          $(requiredFieldInputElement).val(newValue);
        }
      }

      if (fieldConfig?.disableSingleLine) {
        if (fieldConfig?.elementType === HtmlElementType.MultiOptionSet) {
          disableSingleLine(requiredFieldTag, fieldConfig?.elementType);
        } else {
          disableSingleLine(requiredFieldTag);
        }
      }
    }
  } else {
    logger.info({
      fn: shouldRequireDependentField,
      message: `Setting dynamic field to hidden requiredFieldTag: ${requiredFieldTag}, fieldConfig: ${JSON.stringify(
        fieldConfig
      )}`,
      data: { fieldConfig },
    });
    $(requiredFieldRow).css({ display: 'none' });

    if (!disableRequiredProp) {
      $(`#${requiredFieldTag}_label`).parent().removeClass('required');
      localStorage.removeItem(`shouldRequire_${requiredFieldTag}`);
      // if (setRequiredFieldsFunc) {
      //   setRequiredFieldsFunc(getCurrentStep());
      // }
      // if (validationFunc) {
      //   validationFunc(getCurrentStep());
      // }
      validateStepField(requiredFieldTag);
      $(requiredFieldInputElement).off('change');
    }

    // for multi option sets specifically must use custom function
    if (
      fieldConfig?.elementType &&
      fieldConfig?.elementType === HtmlElementType.MultiOptionSet
    ) {
      setMultiSelectValues(requiredFieldTag, []);
    } else {
      $(`#${requiredFieldTag}_name`)?.val(''); // needed for lookup search/modal input elements
      $(requiredFieldInputElement).val('');
    }

    if (!!fieldConfig?.visibleIf?.valueIfHidden) {
      const { type, fieldNames, value } = fieldConfig.visibleIf.valueIfHidden;
      logger.info({
        fn: shouldRequireDependentField,
        message: `visibleIf.valueIfHidden has been configured for fieldName: ${requiredFieldTag}, start setup with values:`,
        data: { valueIfHidden: fieldConfig.visibleIf.valueIfHidden },
      });

      if (type === 'combineFields' && fieldNames?.length >= 1) {
        let fieldValues = [];

        fieldNames.forEach((fName) => {
          const inputValue = document.getElementById(fName)?.value;
          fieldValues.push(inputValue);
        });

        const newValue = fieldValues.join(' ');

        logger.info({
          fn: shouldRequireDependentField,
          message: `visibleIf.valueIfHidden has been configured, setting value: ${newValue} for fieldName: ${requiredFieldTag}`,
        });
        $(requiredFieldInputElement).val(newValue);
      }
    }
  }

  if (customFunc) {
    customFunc();
  }
}
