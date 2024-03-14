import { getCurrentStep } from "./program.ts";
import { setDynamicallyRequiredFields } from "./fieldConfiguration.js";
import { validateStepFields } from "./validation.js";

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
  if (!dependentOnElement) return;

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
  })
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
  if (!dependentOnElement) return;
  // @ts-ignore
  const input = dependentOnElement.value;
  if (overrideTruthyClause != undefined) {
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
    if (input === dependentOnValue || dependentOnValueArray.includes(input)) {
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
  const requiredFieldRow = requiredFieldLabelElement.closest('tr');
  const requiredFieldInputElement = document.querySelector(
    `#${requiredFieldTag}`
  );

  if (
    !requiredFieldLabelElement ||
    !requiredFieldRow ||
    !requiredFieldInputElement
  )
    return;

  if (shouldBeRequired) {
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
