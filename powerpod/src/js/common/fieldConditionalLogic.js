import { getCurrentStep } from './program.ts';
import { setDynamicallyRequiredFields } from './fieldConfiguration.js';
import { validateStepFields } from './fieldValidation.js';
import { Logger } from './logger.js';
import { getControlValue, showFieldRow } from './html.js';

const logger = Logger('common/fieldConditionalLogic');

export function initializeVisibleIf(name, required, visibleIf) {
  const {
    fieldName: dependentFieldName,
    selectedValue: dependentSelectedValue,
    selectedValueIn: dependentSelectedValueIn,
  } = visibleIf;

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

  // Make sure field is visible initially
  showFieldRow(name);

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
      message: `Could not find field for dependentOnElementTag: ${dependentOnElementTag}`,
    });
    return;
  }
  // @ts-ignore
  const tr = dependentOnElement.closest('tr');
  const input = getControlValue({ tr, rawValue: true });
  logger.info({
    fn: setupDependentRequiredField,
    message: `Setting up dependent field dependentOnElementTag: ${dependentOnElementTag} with value: ${input}`,
  });
  if (overrideTruthyClause != undefined) {
    logger.info({
      fn: setupDependentRequiredField,
      message: `Overriding truthy clause overrideTruthyClause: ${overrideTruthyClause}`,
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
      (Number(input) && dependentOnValueArray.includes(Number(input)))
    ) {
      logger.info({
        fn: setupDependentRequiredField,
        message: `Value matches visibleIf condition`,
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
        message: `Value DOES NOT match visibleIf condition`,
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

  if (shouldBeRequired) {
    logger.info({
      fn: shouldRequireDependentField,
      message: `Setting dynamic field to visible requiredFieldTag: ${requiredFieldTag}`,
    });
    $(requiredFieldRow).css({ display: '' });

    if (!disableRequiredProp) {
      // @ts-ignore
      localStorage.setItem(`shouldRequire_${requiredFieldTag}`, true);
      if (setRequiredFieldsFunc) {
        setRequiredFieldsFunc(getCurrentStep());
      }

      if (validationFunc) {
        validationFunc(getCurrentStep());
        // re-validate every time user modifies additional info input
        $(requiredFieldInputElement).change(function () {
          validationFunc(getCurrentStep());
        });
      }
    }
  } else {
    logger.info({
      fn: shouldRequireDependentField,
      message: `Setting dynamic field to hidden requiredFieldTag: ${requiredFieldTag}`,
    });
    $(requiredFieldRow).css({ display: 'none' });

    if (!disableRequiredProp) {
      $(`#${requiredFieldTag}_label`).parent().removeClass('required');
      localStorage.removeItem(`shouldRequire_${requiredFieldTag}`);
      if (setRequiredFieldsFunc) {
        setRequiredFieldsFunc(getCurrentStep());
      }
      if (validationFunc) {
        validationFunc(getCurrentStep());
      }
      $(requiredFieldInputElement).off('change');
    }
    $(`#${requiredFieldTag}_name`)?.val(''); // needed for lookup search/modal input elements
    $(requiredFieldInputElement).val('');
  }

  if (customFunc) {
    customFunc();
  }
}
