import {
  validateNumericFieldValue,
  validateStepField,
} from './fieldValidation.js';
import { Logger } from './logger.js';
import {
  getControlValue,
  getFieldRow,
  hideFieldRow,
  showFieldRow,
} from './html.js';
import { getFieldConfig } from './fields.js';
import { POWERPOD } from './constants.js';
import store from '../store/index.js';

const logger = Logger('common/fieldConditionalLogic');

POWERPOD.fieldConditionalLogic = {
  setFieldVisibility,
};

export function assignDependentFields(fieldConfig) {
  const { name } = fieldConfig;
  logger.info({
    fn: assignDependentFields,
    message: `starting to set dependent fields for name: ${name}`,
    data: { fieldConfig },
  });

  if (!fieldConfig.visibleIf) {
    logger.warn({
      fn: assignDependentFields,
      message: `could not find visibleIf configuration for field with name: ${name}`,
      data: { fieldConfig },
    });
    return;
  }

  if (fieldConfig.visibleIf && fieldConfig.visibleIf.fieldName) {
    const { fieldName: controlFieldName } = fieldConfig.visibleIf;
    const controlFieldConfig = getFieldConfig(controlFieldName);
    checkControlDependentFields({
      controlFieldConfig,
      name,
      fieldConfig,
      controlFieldName,
    });
  } else if (
    fieldConfig.visibleIf &&
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
  logger.info({
    fn: setFieldVisibility,
    message: `starting to set field visibility for name: ${name}`,
  });

  const fieldConfig = getFieldConfig(name);
  assignDependentFields(fieldConfig);

  const { visibleIf, doNotBlank, html } = fieldConfig;
  let matchesCondition = false;

  if (!visibleIf) {
    logger.warn({
      fn: setFieldVisibility,
      message: `no visibleIf config found for field: ${name}`,
      data: { fieldConfig },
    });
    return;
  }

  matchesCondition = evaluateVisibilityConditions(visibleIf, name);

  if (matchesCondition) {
    showFieldRow(name);
    validateStepField(name);
    html?.forEach((id) => $(`tr[data-uuid="${id}"]`)?.css({ display: '' }));
  } else {
    hideFieldRow({ fieldName: name, doNotBlank });
    html?.forEach((id) => $(`tr[data-uuid="${id}"]`)?.css({ display: 'none' }));
  }
}

// export function setFieldVisibility(name) {
//   logger.info({
//     fn: setFieldVisibility,
//     message: `starting to set field visibility for name: ${name}`,
//   });

//   const fieldConfig = getFieldConfig(name);
//   assignDependentFields(fieldConfig);

//   const { visibleIf, doNotBlank, html } = fieldConfig;
//   let matchesCondition = false;

//   if (!visibleIf) {
//     logger.warn({
//       fn: setFieldVisibility,
//       message: `no visibleIf config found for field: ${name}`,
//       data: { fieldConfig },
//     });
//     return;
//   }

//   // Single condition (backward-compatible)
//   if (visibleIf.fieldName) {
//     const {
//       fieldName: dependentOnFieldName,
//       selectedValue,
//       selectedValueIn,
//       comparison,
//       value,
//     } = visibleIf;

//     const controlValue = getControlValue({
//       controlId: dependentOnFieldName,
//       tr: getFieldRow(dependentOnFieldName),
//       raw: true,
//     });

//     matchesCondition = comparison && value
//       ? checkVisibleIfComparison({ name, dependentOnFieldName, controlValue, comparison, value })
//       : checkVisibleIfCondition({ name, controlValue, selectedValue, selectedValueIn });
//   }

//   // Multiple comparisons (new logic)
//   else if (Array.isArray(visibleIf.comparisons)) {
//     const isOr = visibleIf.comparison === 'or';
//     const isAnd = visibleIf.comparison === 'and' || !isOr;

//     matchesCondition = visibleIf.comparisons[isOr ? 'some' : 'every']((c) => {
//       const {
//         fieldName,
//         selectedValue,
//         selectedValueIn,
//         comparison,
//         value,
//       } = c;

//       const controlValue = getControlValue({
//         controlId: fieldName,
//         tr: getFieldRow(fieldName),
//         raw: true,
//       });

//       return comparison && value
//         ? checkVisibleIfComparison({ name, dependentOnFieldName: fieldName, controlValue, comparison, value })
//         : checkVisibleIfCondition({ name, controlValue, selectedValue, selectedValueIn });
//     });
//   }

//   if (matchesCondition) {
//     showFieldRow(name);
//     validateStepField(name);
//     html?.forEach((id) => $(`tr[data-uuid="${id}"]`)?.css({ display: '' }));
//   } else {
//     hideFieldRow({ fieldName: name, doNotBlank });
//     html?.forEach((id) => $(`tr[data-uuid="${id}"]`)?.css({ display: 'none' }));
//   }
// }
// export function setFieldVisibility(name) {
//   logger.info({
//     fn: setFieldVisibility,
//     message: `starting to set field visibility for name: ${name}`,
//   });
//   const fieldConfig = getFieldConfig(name);
//   assignDependentFields(fieldConfig);
//   const { visibleIf, doNotBlank, html, loading } = fieldConfig;
//   let matchesCondition = false;
//   if (!visibleIf || !visibleIf.fieldName) {
//     logger.error({
//       fn: setFieldVisibility,
//       message: `error! visibleIf definition missing fieldName for field with name: ${name}`,
//       data: { name, fieldConfig },
//     });
//     return;
//   }
//   if (visibleIf.fieldName) {
//     const {
//       fieldName: dependentOnFieldName,
//       selectedValue,
//       selectedValueIn,
//       comparison,
//       value,
//     } = visibleIf;

//     const fieldRow = getFieldRow(dependentOnFieldName);

//     const controlValue = getControlValue({
//       controlId: dependentOnFieldName,
//       tr: fieldRow,
//       raw: true,
//     });

//     if (comparison && value) {
//       logger.info({
//         fn: setFieldVisibility,
//         message: `checkVisibleIfComparison for name: ${name}`,
//         data: {
//           name,
//           visibleIf,
//           controlValue,
//         },
//       });
//       matchesCondition = checkVisibleIfComparison({
//         name,
//         dependentOnFieldName,
//         controlValue,
//         comparison,
//         value,
//       });
//     } else {
//       logger.info({
//         fn: setFieldVisibility,
//         message: `checkVisibleIfCondition for name: ${name}`,
//         data: {
//           name,
//           visibleIf,
//           controlValue,
//           loading,
//         },
//       });

//       matchesCondition = checkVisibleIfCondition({
//         name,
//         controlValue,
//         selectedValue,
//         selectedValueIn,
//       });
//     }
//   } else if (visibleIf.comparison && visibleIf.comparison === 'or') {
//     const { comparison, comparisons } = visibleIf;
//     matchesCondition = comparisons.some((c) => {
//       const { fieldName, selectedValue, selectedValueIn } = c;
//       const fieldRow = getFieldRow(fieldName);
//       const controlValue = getControlValue({
//         controlId: fieldName,
//         tr: fieldRow,
//         raw: true,
//       });
//       logger.info({
//         fn: setFieldVisibility,
//         message: `calling checkVisibleIfCondition for name: ${name}, checking fieldName: ${fieldName}`,
//         data: {
//           name,
//           c,
//           controlValue,
//         },
//       });
//       return checkVisibleIfCondition({
//         name,
//         controlValue,
//         selectedValue,
//         selectedValueIn,
//       });
//     });
//   }

//   if (matchesCondition) {
//     showFieldRow(name);
//     validateStepField(name);

//     if (html) {
//       html.forEach((id) => {
//         let htmlRow = $(`tr[data-uuid="${id}"]`);
//         htmlRow?.css({ display: '' });
//       });
//     }
//   } else {
//     hideFieldRow({ fieldName: name, doNotBlank });

//     if (html) {
//       html.forEach((id) => {
//         let htmlRow = $(`tr[data-uuid="${id}"]`);
//         htmlRow?.css({ display: 'none' });
//       });
//     }
//   }
// }

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
  const getNumericValidationError = validateNumericFieldValue({
    fieldName: dependentOnFieldName,
    comparisonValue: value,
    operator: comparison,
    forceRequired: true,
  });
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
    const loadingAllFieldConfig = POWERPOD.configuringFields;
    const loadingFieldConfig = POWERPOD.state?.fields?.[name]?.loading;
    logger.info({
      fn: checkVisibleIfCondition,
      message: `for name: ${name}, found did NOT find matching condition`,
      data: { params, loadingAllFieldConfig, loadingFieldConfig },
    });
    return false;
    // hideFieldRow(name, doNotBlank);
    // hideQuestion(name);
    // store.dispatch('addFieldData', { name, visible: false });
  }
}

function evaluateVisibilityConditions(visibleIf, name) {
  // Legacy case: single condition
  if (visibleIf.fieldName) {
    const {
      fieldName,
      selectedValue,
      selectedValueIn,
      comparison,
      value,
    } = visibleIf;

    const controlValue = getControlValue({
      controlId: fieldName,
      tr: getFieldRow(fieldName),
      raw: true,
    });

    return comparison && value
      ? checkVisibleIfComparison({ name, dependentOnFieldName: fieldName, controlValue, comparison, value })
      : checkVisibleIfCondition({ name, controlValue, selectedValue, selectedValueIn });
  }

  // Recursive condition group
  if (Array.isArray(visibleIf.comparisons)) {
    const isOr = visibleIf.comparison === 'or';
    const isAnd = !isOr; // default is AND if not specified

    return visibleIf.comparisons[isOr ? 'some' : 'every']((subCond) => {
      return evaluateVisibilityConditions(subCond, name);
    });
  }

  logger.warn({
    fn: evaluateVisibilityConditions,
    message: 'Invalid visibleIf structure',
    data: { visibleIf, name },
  });

  return false;
}
