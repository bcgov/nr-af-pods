import { HtmlElementType, ProgramIds, doc } from './constants.js';
import { Logger } from './logger.js';
import {
  displayActiveFieldErrors,
  validateRequiredFields,
  validateStepField,
} from './fieldValidation.js';
import { POWERPOD } from './constants.js';
import { cleanString } from './documents.ts';
import { getProgramId } from './program.ts';
import store from '../store/index.js';
import { getFieldConfig } from './fields.js';
import { convertDateToISO } from './date.js';
import { updateFieldValue } from './fieldConfiguration.js';

const logger = Logger('common/html');

POWERPOD.html = {
  redirectToFormId,
  getControlType,
  isEmptyRow,
  isHiddenRow,
  getControlId,
  getInfoValue,
  getControlValue,
  listenForIframeReadyStateChanges,
  onDocumentReadyState,
  showFieldsetElement,
  getFieldLabel,
  showFieldRow,
  addHtmlToTabDiv,
  hideSection,
  showSection,
  hideTable,
  showTable,
  addHtmlToSection,
  addTextAboveField,
  addTextBelowField,
  addHtmlToField,
  observeChanges,
  observeIframeChanges,
  hideQuestion,
  showOrHideAndReturnValue,
  getFieldRow,
  setFieldValue,
  relocateField,
  combineElementsIntoOneRowNew,
  combineElementsIntoOneRow,
  hideAllStepSections,
  hideFields,
  hideFieldSets,
  hideFieldsetTitle,
  hideFieldsAndSections,
  isNode,
  getFieldNameLabel,
  htmlDecode,
  getFieldInfoDiv,
  setMultiSelectValues,
  getMultiOptionSetElementValue,
  getOriginalMsosElement,
  newGetOriginalMultiOptionSetElementValue,
};

export function redirectToFormId(id) {
  let currentUrl = new URL(window.location.href);

  // Append the new parameter to the URL
  currentUrl.search = '';
  currentUrl.searchParams.set('id', id);

  logger.info({
    fn: redirectToFormId,
    message: `Redirecting to form with id: ${id}`,
  });

  window.location.href = currentUrl.toString();
}

export function getControlType({ tr, controlId = '', skipState = false }) {
  const controlDiv = tr?.querySelector('div.control');
  const control = controlDiv?.querySelector(
    'input[id*=quartech_], textarea[id*=quartech_], select[id*=quartech_]'
  );

  if (!control) {
    logger.error({
      fn: getControlType,
      message: 'Could not find form control element',
      data: {
        tr,
        control,
      },
    });
    return;
  }

  if (!controlId) {
    controlId = getControlId(tr);
  }

  let controlType;

  if (
    !skipState &&
    control?.id &&
    POWERPOD.state?.fields[controlId]?.elementType
  ) {
    controlType = POWERPOD.state?.fields[controlId]?.elementType;
    logger.info({
      fn: getControlType,
      message: `Successfully found control type from STATE for controlId: ${controlId}, found elementType: ${controlType}`,
      data: { tr, controlId },
    });
    return controlType;
  }

  const tag = control.tagName.toLowerCase();
  const classes = control.getAttribute('class');
  const typeAttribute = control.getAttribute('type');

  if (tag === 'input' && classes?.includes('money')) {
    controlType = HtmlElementType.CurrencyInput;
  } else if (
    tag === 'input' &&
    classes?.includes('text') &&
    classes?.includes('lookup') &&
    classes?.includes('form-control')
  ) {
    controlType = HtmlElementType.MultiSelectPicklist;
  } else if (tag === 'input' && classes?.includes('text')) {
    controlType = HtmlElementType.Input;
  } else if (tag === 'input' && classes?.includes('datetime')) {
    controlType = HtmlElementType.DatePicker;
  } else if (tag === 'textarea' && classes?.includes('textarea')) {
    controlType = HtmlElementType.TextArea;
  } else if (tag === 'select' && classes?.includes('picklist')) {
    controlType = HtmlElementType.DropdownSelect;
  } else if (tag === 'input' && control.type === 'checkbox') {
    controlType = HtmlElementType.Checkbox;
  } else if (tag === 'input' && classes?.includes('msos-input')) {
    controlType = HtmlElementType.MultiOptionSet;
  }
  if (!controlType) {
    logger.error({
      fn: getControlType,
      message: 'Could not determine control type',
      data: {
        tr,
        control,
        tag,
        classes,
      },
    });
    return HtmlElementType.Unknown;
  }
  logger.info({
    fn: getControlType,
    message: `Successfully found control type for controlId: ${controlId}, found elementType: ${controlType}`,
    data: { tr, controlId },
  });
  return controlType;
}

export function isEmptyRow(tr) {
  const firstTd = tr.querySelector('td');
  if (
    !firstTd ||
    (firstTd?.getAttribute('quartechHtml') &&
      firstTd?.getAttribute('quartechHtml') === 'true') ||
    firstTd?.getAttribute('class')?.includes('zero-cell') ||
    firstTd.children?.length === 0
  ) {
    return true;
  }
  return false;
}

export function isHiddenRow(tr) {
  const displayStyle = tr?.style?.display;
  if (displayStyle === 'none') {
    return true;
  }
  return false;
}

export function getControlId(tr) {
  const questionDiv = tr.querySelector('.info');
  const id = questionDiv?.querySelector('label')?.getAttribute('for');
  return id;
}

export function getInfoValue(tr) {
  const questionDiv = tr.querySelector('.info');
  const questionText = questionDiv?.querySelector('label')?.textContent;
  return questionText;
}

export function getControlValue({
  controlId,
  tr,
  raw = false,
  forTemplateGeneration = false,
}) {
  const elementType = getControlType({ tr, controlId });

  logger.info({
    fn: getControlValue,
    message: `Attempting to get control value for controlId: ${controlId} type: ${elementType}, raw: ${raw}`,
    data: {
      controlId,
      tr,
      raw,
      forTemplateGeneration,
      programId: POWERPOD.program?.programId,
    },
  });

  const controlDiv = tr.querySelector('.control');

  let rawValue, verboseValue;
  if (forTemplateGeneration && controlId === 'quartech_nocragstnumber') {
    if (POWERPOD.program?.programId === ProgramIds.VLB) {
      const checked =
        document.getElementsByTagName('quartech-checkbox')?.[0].inputValue;
      if (checked === 'true' || checked === true) {
        verboseValue = 'Yes';
      } else {
        verboseValue = 'No';
      }
      rawValue = verboseValue;
    }
  } else if (elementType === HtmlElementType.FileInput) {
    const value = controlDiv?.querySelector('textarea').value;
    if (raw) {
      rawValue = value;
    } else {
      verboseValue = cleanString(value?.replace(/\n/g, ' '));
    }
  } else if (elementType === HtmlElementType.CurrencyInput) {
    const value = controlDiv?.querySelector('input')?.value;
    if (raw) {
      rawValue = value;
    } else {
      verboseValue = `$${value}`;
    }
  } else if (elementType === HtmlElementType.Input) {
    verboseValue = controlDiv?.querySelector('input')?.value;
    rawValue = verboseValue;
  } else if (elementType === HtmlElementType.DatePicker) {
    const value = controlDiv?.querySelector(
      'div > .datetimepicker > input'
    )?.value;
    if (raw && value?.length) {
      logger.info({
        fn: getControlValue,
        message: `Attempting to convert date raw value to ISO format, value: ${value}`,
      });
      rawValue = convertDateToISO(value) ?? '';
    } else {
      verboseValue = value ?? '';
    }
  } else if (elementType === HtmlElementType.TextArea) {
    verboseValue = controlDiv
      ?.querySelector('textarea')
      .value?.replace(/\n/g, ' ');
    rawValue = verboseValue;
  } else if (elementType === HtmlElementType.DropdownSelect) {
    const selectElement = controlDiv?.querySelector('select');
    if (raw) {
      rawValue = selectElement.value;
    } else {
      const selectedIndex = selectElement?.selectedIndex;
      const selectedOption = selectElement.options[selectedIndex];
      const selectedOptionText =
        selectedOption.textContent || selectedOption.innerText;
      verboseValue = selectedOptionText;
    }
  } else if (elementType === HtmlElementType.Checkbox) {
    const checked = controlDiv?.querySelector('input')?.checked;
    logger.info({
      fn: getControlValue,
      message: `Found control value for type: ${elementType}, raw: ${raw}, checked: ${checked}`,
      data: { controlDiv },
    });
    if (raw) {
      rawValue = checked;
    } else {
      if (checked === 'true' || checked === true) {
        verboseValue = 'Yes';
      } else {
        verboseValue = 'No';
      }
    }
  } else if (elementType === HtmlElementType.MultiOptionSet && controlId) {
    if (raw) {
      rawValue = newGetOriginalMultiOptionSetElementValue(controlId, raw);
    } else {
      verboseValue = newGetOriginalMultiOptionSetElementValue(controlId);
    }
  } else if (elementType === HtmlElementType.MultiSelectPicklist && controlId) {
    if (raw) {
      rawValue = document?.getElementById(controlId)?.value;
    } else {
      verboseValue = controlDiv?.querySelector('input')?.value;
    }
  }

  logger.info({
    fn: getControlValue,
    message: `
      For controlId: ${controlId}, raw: ${raw}, 
      forTemplateGeneration: ${forTemplateGeneration} found rawValue: ${rawValue} 
      finalValue: ${verboseValue}`,
    data: {
      controlId,
      tr,
      raw,
      forTemplateGeneration,
      finalValue: verboseValue,
      rawValue,
    },
  });

  if (raw) {
    if (POWERPOD.state?.fields?.[controlId]?.value !== raw) {
      store.dispatch('addFieldData', {
        name: controlId,
        value: rawValue,
      });
    }
    return rawValue;
  }

  return verboseValue;
}

export function newGetOriginalMultiOptionSetElementValue(controlId, raw) {
  const originalSelectElementForMSOS = getOriginalMsosElement(controlId);
  if (!originalSelectElementForMSOS) {
    logger.error({
      fn: newGetOriginalMultiOptionSetElementValue,
      message: `Could not find original msos element for controlId: ${controlId}`,
    });
    return;
  }
  const selectionContainer =
    // @ts-ignore
    originalSelectElementForMSOS?.multiSelectOptionSet()?.$selection;
  if (!selectionContainer) {
    logger.error({
      fn: newGetOriginalMultiOptionSetElementValue,
      message: `Could not find msos selectionContainer for controlId: ${controlId}`,
    });
    return;
  }
  const selectedItems = selectionContainer?.find('li[aria-selected="true"]');
  const inputElements = selectedItems?.find('input');
  if (
    !selectedItems &&
    !selectedItems.length &&
    !inputElements &&
    !inputElements.length
  ) {
    logger.warn({
      fn: newGetOriginalMultiOptionSetElementValue,
      message: `Could not find any selectedItems or inputElements for controlId: ${controlId}`,
    });
    return '';
  }
  let valueStrArray = [];
  if (raw) {
    for (let i = 0; i < inputElements.length; i++) {
      const input = inputElements[i];
      valueStrArray.push(input?.value);
    }
  } else {
    for (let i = 0; i < inputElements.length; i++) {
      const input = inputElements[i];
      const label = input.getAttribute('aria-label') || '';
      valueStrArray.push(label);
    }
  }

  const valueStr = valueStrArray.join(', ');

  logger.info({
    fn: newGetOriginalMultiOptionSetElementValue,
    message: `For controlId: ${controlId} found valueStr: ${valueStr}`,
  });

  return valueStr;
}

export function getMultiOptionSetElementValue(controlId, raw) {
  const inputElement = document.getElementById(controlId);
  if (!inputElement) {
    logger.error({
      fn: getMultiOptionSetElementValue,
      message: `Could not find input element for MultiOptionSet element controlId: ${controlId}`,
    });
    return;
  }
  if (inputElement.value === undefined || inputElement.value?.length <= 0) {
    logger.warn({
      fn: getMultiOptionSetElementValue,
      message: `MultiOptionSet value empty for controlId: ${controlId}`,
    });
    return;
  }
  const multiOptionSetValueArray = JSON.parse(inputElement.value);

  let valueStrArray = [];

  if (raw) {
    multiOptionSetValueArray.forEach((set) => {
      valueStrArray.push(set?.Value);
    });
  } else {
    multiOptionSetValueArray.forEach((set) => {
      const label = set?.Label.UserLocalizedLabel?.Label || '';
      if (label?.length > 0) {
        valueStrArray.push(label);
      }
    });
  }

  const valueStr = valueStrArray.join(', ');

  logger.info({
    fn: getMultiOptionSetElementValue,
    message: `For controlId: ${controlId} found valueStr: ${valueStr}`,
  });

  return valueStr;
}

export function listenForIframeReadyStateChanges(iframe, fn) {
  if (
    fn &&
    (iframe.contentDocument.readyState === 'interactive' ||
      iframe.contentDocument.readyState === 'complete')
  ) {
    logger.info({
      fn: listenForIframeReadyStateChanges,
      message: 'iframe is now interactive or complete readyState',
    });
    fn();
  }
  iframe.contentDocument.addEventListener('readystatechange', () => {
    logger.info({
      fn: listenForIframeReadyStateChanges,
      message: `iframe onReadyState changed: ${iframe.contentDocument?.readyState}`,
    });
  });
}

export function onDocumentReadyState(fn) {
  logger.info({
    fn: onDocumentReadyState,
    message: `checking document readyState: ${doc.readyState}`,
  });
  if (doc.readyState === 'complete') {
    fn();
  } else {
    doc.addEventListener('readystatechange', () => {
      if (doc.readyState === 'complete') {
        logger.info({
          fn: onDocumentReadyState,
          message: 'document ready!',
        });
        fn();
      }
    });
  }
}

export function showFieldsetElement(fieldsetName) {
  const sectionElement = $(`fieldset[aria-label="${fieldsetName}"]`);
  if (sectionElement) {
    sectionElement.css({ display: '' });
  }
}

export function getFieldLabel(fieldName) {
  const label = $(`#${fieldName}_label`).text();
  return label;
}

export function getFieldRow(fieldName) {
  const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
  if (!fieldLabelElement) {
    logger.error({
      fn: getFieldRow,
      message: `could not find fieldLabelElement for fieldName: ${fieldName}`,
    });
    return;
  }
  const fieldRow = fieldLabelElement.closest('tr');

  if (!fieldRow) {
    logger.error({
      fn: getFieldRow,
      message: `could not find fieldRow for fieldName: ${fieldName}`,
    });
    return;
  }

  return fieldRow;
}

export function hideFieldRow({ fieldName, doNotBlank = false }) {
  logger.info({
    fn: hideFieldRow,
    message: `hideFieldRow called for fieldName: ${fieldName}, doNotBlank: ${doNotBlank}`,
  });
  const fieldRow = getFieldRow(fieldName);

  if (!fieldRow) {
    logger.error({
      fn: hideFieldRow,
      message: `could not find fieldRow for fieldName: ${fieldName}`,
    });
    return;
  }

  $(fieldRow)?.css({ display: 'none' });

  if (!doNotBlank) {
    setFieldValueToEmptyState(fieldName);
  }

  store.dispatch('addFieldData', {
    name: fieldName,
    visible: false,
    error: '',
    touched: false,
  });

  displayActiveFieldErrors();

  logger.info({
    fn: hideFieldRow,
    message: `successfully ran hideFieldRow for fieldName: ${fieldName}, doNotBlank: ${doNotBlank}`,
    data: { fieldRow },
  });
}

export function showFieldRow(fieldName) {
  logger.info({
    fn: showFieldRow,
    message: `showFieldRow called for fieldName: ${fieldName}`,
  });
  const fieldRow = getFieldRow(fieldName);

  if (!fieldRow) {
    logger.error({
      fn: showFieldRow,
      message: `could not find fieldRow for fieldName: ${fieldName}`,
    });
    return;
  }

  $(fieldRow)?.css({ display: '' });

  const isRequired = POWERPOD.state?.fields?.[fieldName].required;
  if (isRequired) {
    $(`#${fieldName}_label`).parent().addClass('required');
  }

  // check if a fieldset exists and make sure it's visible if so
  const nearestFieldSet = fieldRow.closest('fieldset');
  if (!nearestFieldSet) {
    logger.error({
      fn: showFieldRow,
      message: `could not find nearestFieldSet to fieldName: ${fieldName}`,
    });
  }
  $(nearestFieldSet).css({ display: '' });

  const displayStyle = nearestFieldSet?.style?.display;

  store.dispatch('addFieldData', { name: fieldName, visible: true });

  validateStepField(fieldName);

  logger.info({
    fn: showFieldRow,
    message: `successfully ran showFieldRow for fieldName: ${fieldName}`,
    data: { nearestFieldSet, displayStyle },
  });
}

export function addHtmlToTabDiv(
  tabDataName,
  htmlContentToAdd,
  topOrBottom = 'top'
) {
  const tabDiv = document.querySelector(`div[data-name='${tabDataName}']`);
  if (!tabDiv) {
    logger.error({
      fn: addHtmlToTabDiv,
      message: `Unable to add to tab div of tabDataName: ${tabDataName}, could not find tab div`,
    });
    return;
  }

  const divElement = document.createElement('div');

  divElement.setAttribute('quartechHtml', 'true');
  divElement.innerHTML = htmlContentToAdd;

  if (topOrBottom === 'top') {
    tabDiv.insertAdjacentElement('beforebegin', divElement);
  } else {
    tabDiv.insertAdjacentElement('afterend', divElement);
  }
}

export function hideSection(tableDataname) {
  $(`fieldset > table[data-name=${tableDataname}]`)
    .parent()
    .css('display', 'none');
}

export function showSection(tableDataname) {
  $(`fieldset > table[data-name=${tableDataname}]`).parent().css('display', '');
}

export function hideTable(tableDataname) {
  $(`table[data-name=${tableDataname}]`).css('display', 'none');
}

export function showTable(tableDataname) {
  $(`table[data-name=${tableDataname}]`).css('display', '');
}

export function addHtmlToSection(
  tableDataName,
  htmlContentToAdd,
  topOrBottom = 'top'
) {
  const sectionTable = doc.querySelector(
    `table[data-name='${tableDataName}'] > tbody`
  );
  if (!sectionTable) {
    logger.error({
      fn: addHtmlToSection,
      message: `Unable to add to section of tableDataName: ${tableDataName}, could not find section`,
    });
    return;
  }
  const trElement = doc.createElement('tr');

  const tdElement = document.createElement('td');
  tdElement.setAttribute('colspan', '2');
  tdElement.setAttribute('quartechHtml', 'true');
  tdElement.innerHTML = htmlContentToAdd;

  trElement.appendChild(tdElement);

  if (topOrBottom === 'top') {
    sectionTable.prepend(trElement);
  } else if (topOrBottom === 'bottom') {
    sectionTable.append(trElement);
  }
}

export function addTextAboveField(fieldName, htmlContentToAdd) {
  addHtmlToField(fieldName, htmlContentToAdd, 'top');
}

export function addTextBelowField(fieldName, htmlContentToAdd) {
  addHtmlToField(fieldName, htmlContentToAdd, 'bottom');
}

export function addHtmlToField(
  fieldName,
  htmlContentToAdd,
  topOrBottom = 'top'
) {
  const tr = $(`#${fieldName}`).closest('tr');
  if (!tr) return;

  const uuid = crypto.randomUUID();

  if (topOrBottom === 'top') {
    $(`<tr data-uuid='${uuid}'></tr>`).insertBefore(tr);
  } else if (topOrBottom === 'bottom') {
    $(`<tr data-uuid='${uuid}'></tr>`).insertAfter(tr);
  }
  const newTrElement = $(`tr[data-uuid="${uuid}"]`);

  if (!newTrElement || !newTrElement?.length) {
    logger.error({
      fn: addHtmlToField,
      message: 'Failed to create new row',
    });
  }

  const tdElement = document.createElement('td');
  tdElement.setAttribute('colspan', '2');
  tdElement.setAttribute('quartechHtml', 'true');
  tdElement.innerHTML = htmlContentToAdd;

  newTrElement.append(tdElement);
}

export function observeChanges(
  element,
  customFunc,
  disableInitialCall = false
) {
  const id = element?.id || '';
  logger.info({
    fn: observeChanges,
    message: 'observing changes...',
    data: {
      id,
      element,
      disableInitialCall,
    },
  });
  if (!element) {
    logger.error({
      fn: observeChanges,
      message: 'failed to observe changes, null element',
      data: {
        id,
        element,
        disableInitialCall,
      },
    });
    return;
  }

  // watch for changes
  var observer = new MutationObserver(function (mutations, observer) {
    logger.info({
      fn: observeChanges,
      message: 'Change observed',
      data: { id, element, disableInitialCall, customFunc },
    });
    if (customFunc) {
      customFunc(mutations);
    } else {
      // validateRequiredFields();
    }
  });
  if (
    element &&
    (element.nodeType === Node.ELEMENT_NODE ||
      element.nodeType === Node.DOCUMENT_NODE)
  ) {
    observer.observe(element, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    logger.info({
      fn: observeChanges,
      message: 'Successfully assigned observer to element',
      data: {
        element,
        elementNodeType: element.nodeType,
        customFunc,
        disableInitialCall,
      },
    });
    if (!disableInitialCall) {
      // initial load:
      if (customFunc) {
        customFunc();
      } else {
        // validateRequiredFields();
      }
    }
    return observer;
  }
  logger.error({
    fn: observeChanges,
    message: `Unable to assign observer for some reason`,
    data: {
      element,
      elementNodeType: element.nodeType,
      customFunc,
      disableInitialCall,
    },
  });
  return false;
}

export function observeIframeChanges(
  funcToExecute,
  fieldNameToPass,
  fieldNameToObserve
) {
  logger.info({
    fn: observeIframeChanges,
    message: 'observing iframe changes...',
    data: {
      fieldNameToPass,
      fieldNameToObserve,
    },
  });
  const iframe = document.querySelector(
    'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
  );
  // wait for iframe to load / watch for changes
  if (iframe?.nodeType) {
    observeChanges($(iframe)[0], function () {
      funcToExecute(fieldNameToPass);
      const iframe = document.querySelector(
        'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
      );
      // @ts-ignore
      const innerDoc = iframe?.contentDocument
        ? // @ts-ignore
          iframe?.contentDocument
        : // @ts-ignore
          iframe?.contentWindow.document;
      if (innerDoc?.nodeType) {
        observeChanges(innerDoc, function () {
          const iframe = document.querySelector(
            'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
          );
          // @ts-ignore
          const innerDoc = iframe.contentDocument
            ? // @ts-ignore
              iframe.contentDocument
            : // @ts-ignore
              iframe.contentWindow.document;
          funcToExecute(fieldNameToPass);
          const element = innerDoc?.getElementById(fieldNameToObserve);
          if (element?.nodeType) {
            observeChanges(element, function () {
              funcToExecute(fieldNameToPass);
            });
          }
        });
      }
    });
  }
}

export function hideFieldByFieldName(fieldName, doNotBlank = false) {
  const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
  if (!fieldLabelElement) return;
  const fieldRow = fieldLabelElement.closest('tr');

  const fieldInputElement = document.querySelector(`#${fieldName}`);

  if (!fieldRow || !fieldInputElement) return;

  $(fieldRow).css({ display: 'none' });
  store.dispatch('addFieldData', {
    name: fieldName,
    visible: false,
    erorr: '',
  });

  $(`#${fieldName}_label`).parent().removeClass('required');
  localStorage.removeItem(`shouldRequire_${fieldName}`);
  // if (validationFunc) {
  //   validationFunc();
  // }
  $(fieldInputElement).off('change');

  if (!doNotBlank) {
    setFieldValueToEmptyState(fieldName);
  }
}

export function hideQuestion(fieldName) {
  $(`#${fieldName}`).css('display', 'none');
  $(`#${fieldName}`).val('');
  const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
  const fieldRow = fieldLabelElement.closest('tr');
  $(fieldRow).css({ display: 'none' });

  // store.dispatch('addFieldData', { name: fieldName, visible: false });
  // validateRequiredFields();
}

export function showOrHideAndReturnValue(valueElementId, descriptionElementId) {
  const valueElement = $(`#${valueElementId}`);
  const descriptionElement = $(`#${descriptionElementId}`);

  // @ts-ignore
  let value = parseFloat(valueElement.val().replace(/,/g, ''));
  if (isNaN(value)) value = 0.0;

  const hideDescription = value == 0.0;
  if (hideDescription) {
    descriptionElement.val('');
    descriptionElement.closest('td').css('display', 'none');
    valueElement.closest('td').attr('colspan', '2');
  } else {
    descriptionElement.closest('td').css('display', 'block');
    descriptionElement.closest('td').attr('colspan', '1');
    valueElement.closest('td').attr('colspan', '1');
  }

  return value;
}

/**
 * Programmatically set a field value and trigger change event.
 * Ensures validation checks pick up on change event.
 * @function
 * @param {string} name - The name of the associated field id.
 * @param {string} value - The value to set the field to.
 */
export function setFieldValue(name, value, elementType = null) {
  logger.info({
    fn: setFieldValue,
    message: `Setting field value for name: ${name}, value: ${value}, elementType: ${elementType}`,
  });
  const element = document.querySelector(`#${name}`);
  if (!element) return;
  // @ts-ignore
  if (elementType === HtmlElementType.Checkbox) {
    element.checked = value;
  } else {
    element.value = value;
  }
  const e = new Event('change');
  element.dispatchEvent(e);

  updateFieldValue(name, value);
}

export function relocateField(field) {
  const { originFieldName, destinationFieldName, relativePosition } =
    field.relocateField;

  if (!originFieldName || !destinationFieldName || !relativePosition) {
    logger.error({
      fn: relocateField,
      message: `Missing a required parameter to relocate field`,
      data: field,
    });
    return;
  }
  logger.info({
    fn: relocateField,
    message: `Starting moving originFieldName: ${originFieldName} ${relativePosition} destinationFieldName: ${destinationFieldName}`,
  });

  const elementToMove = $(`#${originFieldName}`);
  const rowToMove = elementToMove.closest('tr');
  const clonedRowToMove = rowToMove.clone();

  const moveToElement = document.getElementById(destinationFieldName);
  const moveToRow = moveToElement?.closest('tr');

  if (!moveToRow) {
    logger.error({
      fn: relocateField,
      message: `Unable to find nearest row to destinationFieldName: ${destinationFieldName}`,
      data: {
        originInputId: originFieldName,
        destinationInputId: destinationFieldName,
        relativePosition,
      },
    });
    return;
  }

  if (relativePosition === 'above') {
    moveToRow.insertAdjacentElement('beforebegin', clonedRowToMove?.[0]);
  } else if (relativePosition === 'below') {
    moveToRow.insertAdjacentElement('afterend', clonedRowToMove?.[0]);
  }

  // cleanup original row
  rowToMove.remove();

  logger.info({
    fn: relocateField,
    message: `Successfully moved originFieldName: ${originFieldName} to ${relativePosition} destinationFieldName: ${destinationFieldName}`,
  });
}

export function combineElementsIntoOneRowNew(name) {
  logger.info({
    fn: combineElementsIntoOneRowNew,
    message: `Combining elements into one row for name: ${name}`,
  });
  const inputElement = $(`#${name}`);
  const labelElement = $(`#${name}_label`);

  const inputTd = inputElement.closest('td');
  const labelTd = labelElement.closest('td');

  if (!inputTd.is(labelTd)) {
    logger.warn({
      fn: combineElementsIntoOneRowNew,
      message: `Skipping... elements must've already been combined, since label and input are in different cells`,
      data: { name, inputElement, labelElement, inputTd, labelTd },
    });
    return;
  }

  const tableElement = inputElement.closest('table.section');

  // find and delete colgroup config, if it exists
  tableElement.find('colgroup')?.remove();

  const tr = inputElement.closest('tr');

  // Clone the <td> element without children
  const newTd = $('<td>');

  // Copy attributes from the original <tr> to the new <tr>
  $.each(inputTd[0].attributes, function () {
    newTd.attr(this.name, this.value);
  });

  newTd.attr('colspan', '1');
  tr.append(newTd);
  inputTd.children().not('div.info').appendTo(newTd);
}

export function disableSingleLine(name, elementType = '') {
  logger.info({
    fn: disableSingleLine,
    message: `Disable single line for name: ${name}, elementType: ${elementType}`,
  });
  let inputElement;
  if (elementType === HtmlElementType.MultiOptionSet) {
    inputElement = $(`#${name}_0`);
  } else {
    inputElement = $(`#${name}`);
  }
  if (!inputElement) {
    logger.error({
      fn: disableSingleLine,
      message: `Failed to disable single line, could not find input element for name: ${name}, elementType: ${HtmlElementType}`,
    });
    return;
  }
  const inputTd = inputElement.closest('td');
  if (!inputTd) {
    logger.error({
      fn: disableSingleLine,
      message: `Failed to disable single line, could not find input td element for name: ${name}, elementType: ${HtmlElementType}`,
    });
    return;
  }
  inputTd.attr('colspan', '2');
}

export function combineElementsIntoOneRow(
  valueElementId,
  descriptionInputElementId
) {
  const descriptionInputElement = $(`#${descriptionInputElementId}`);
  const descriptionInputElementCol = descriptionInputElement.closest('td');

  const descriptionInputElementColClone = descriptionInputElementCol.clone();
  descriptionInputElementColClone.attr('colspan', '1');

  descriptionInputElementCol.remove();

  const valueElement = $(`#${valueElementId}`);
  const valueElementCol = valueElement.closest('td');
  valueElementCol.attr('colspan', '1');

  const valueElementRow = valueElement.closest('tr');
  valueElementRow.append(descriptionInputElementColClone);
}

export function hideAllStepSections() {
  $('fieldset > table').parent().css('display', 'none');
}

export function hideFields(hidden = true) {
  const selector = 'tr:has([id$="_label"])';
  const fieldRows = document.querySelectorAll(selector);

  fieldRows.forEach((row) => {
    // @ts-ignore
    if (!row.style) return;
    if (hidden) {
      // @ts-ignore
      row.style.display = 'none';
    } else {
      // @ts-ignore
      row.style.display = '';
    }
  });
}

export function hideFieldSets(hidden = true) {
  const fieldsetsWithAriaLabel = document.querySelectorAll(
    'fieldset[aria-label]'
  );

  fieldsetsWithAriaLabel.forEach((fieldset) => {
    // @ts-ignore
    if (!fieldset.style) return;
    if (hidden) {
      // @ts-ignore
      fieldset.style.display = 'none';
    } else {
      // @ts-ignore
      fieldset.style.display = '';
    }
  });
}

export function hideFieldsAndSections(hidden = true) {
  if (!hidden) {
    logger.info({
      fn: hideFieldsAndSections,
      message: 'Unhiding fields and sections',
    });
  } else {
    logger.info({
      fn: hideFieldsAndSections,
      message: 'Hiding fields and sections',
    });
  }
  hideFields(hidden);
  hideFieldSets(hidden);
}

export function isNode(o) {
  return typeof Node === 'object'
    ? o instanceof Node
    : o &&
        typeof o === 'object' &&
        typeof o.nodeType === 'number' &&
        typeof o.nodeName === 'string';
}

export function getFieldNameLabel(fieldName) {
  const label = doc.getElementById(`${fieldName}_label`)?.textContent;
  if (!label) {
    logger.error({
      fn: getFieldNameLabel,
      message: `Could not find label text for fieldName: ${fieldName}`,
    });
  }
  return label;
}

export function setFieldNameLabel(fieldName, label) {
  const labelElement = $(`#${fieldName}_label`);

  if (!labelElement) {
    logger.error({
      fn: setFieldNameLabel,
      message: `Could not find fieldName: ${fieldName} label element`,
    });
    return;
  }
  const obj = $(`#${fieldName}_label`)?.text(label);
  obj?.html(obj?.html()?.replace(/\n/g, '<br/>'));

  logger.info({
    fn: setFieldNameLabel,
    message: `Successfully set fieldName: ${fieldName} to ${label}`,
  });
}

export function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent?.replace(/[^\x00-\x7F]/g, '');
}

export function copyFromFieldAToFieldB(fromFieldNameA, toFieldNameB) {
  const fromFieldNameAElement = document.getElementById(fromFieldNameA);

  logger.info({
    fn: copyFromFieldAToFieldB,
    message: `Start copying value ${
      fromFieldNameAElement.value || ''
    } from ${fromFieldNameA} to ${toFieldNameB}`,
  });

  setFieldValue(toFieldNameB, fromFieldNameAElement.value || '');

  logger.info({
    fn: copyFromFieldAToFieldB,
    message: `Successfully copied value ${
      fromFieldNameAElement.value || ''
    } from ${fromFieldNameA} to ${toFieldNameB}`,
  });
}

export function hideFieldsetTitle(ariaLabel) {
  // Find the fieldset element by aria-label attribute
  const fieldset = document.querySelector(
    `fieldset[aria-label="${ariaLabel}"]`
  );

  // Select the legend tag inside the fieldset
  const legend = fieldset?.querySelector('legend');

  // Hide the legend element
  if (legend) {
    legend.style.display = 'none';
  }
}

export function getFieldInfoDiv(name) {
  const infoDiv = $(`#${name}_label`)?.closest('td')?.find('div.info');

  if (!infoDiv) {
    logger.error({
      fn: getFieldInfoDiv,
      message: `Could not find info div for field name: ${name}`,
    });
    return;
  }

  return infoDiv;
}

export function getOriginalMsosElement(name) {
  const originalSelectElementForMSOS = $(`#${name}_0`);

  if (!originalSelectElementForMSOS || !originalSelectElementForMSOS.length) {
    logger.error({
      fn: setMultiSelectValues,
      message: `Could not get original select control element for fieldName: ${name} for Msos, see initializeMsosLibrary, MultiSelectOptionSet libraries, https://pbauerochse.github.io/searchable-option-list/`,
    });
    return;
  }

  return originalSelectElementForMSOS;
}

// Note: values should be an array of raw values from the mutli optionset, e.g. [255550000]
export function setMultiSelectValues(name, values = []) {
  const originalSelectElementForMSOS = getOriginalMsosElement(name);

  // @ts-ignore
  if (!originalSelectElementForMSOS?.multiSelectOptionSet()) {
    logger.error({
      fn: setMultiSelectValues,
      message: `Could not get multiSelectOptionSet() object form original select control element for Msos, see initializeMsosLibrary, MultiSelectOptionSet libraries, https://pbauerochse.github.io/searchable-option-list/`,
    });
    return;
  }
  // @ts-ignore
  originalSelectElementForMSOS.multiSelectOptionSet().refreshControl(values);

  // to select specific items:
  // $(`#${multiSelectFieldName}_0`).multiSelectOptionSet().refreshControl([255550005])
}

export function getFieldErrorDiv(fieldName) {
  let errorMessageElement = document.querySelector(
    `#${fieldName}_error_message`
  );

  if (!errorMessageElement) {
    let div = document.createElement('div');
    div.id = `${fieldName}_error_message`;
    div.className = 'error_message';
    // @ts-ignore
    div.style = 'display:none;';

    const control = getFieldRow(fieldName)?.querySelector('div.control');
    control?.insertAdjacentElement('afterend', div);

    errorMessageElement = document.querySelector(`#${fieldName}_error_message`);

    if (!errorMessageElement) {
      logger.error({
        fn: getFieldErrorDiv,
        message: `Failed to find field error div, fieldName: ${fieldName}`,
      });
      return;
    }
  }

  return errorMessageElement;
}

export function setFieldValueToEmptyState(fieldName) {
  const fieldConfig = getFieldConfig(fieldName);
  // for multi option sets specifically must use custom function
  if (
    fieldConfig?.elementType &&
    fieldConfig?.elementType === HtmlElementType.MultiOptionSet
  ) {
    setMultiSelectValues(fieldName, []);
  } else {
    $(`#${fieldName}_name`)?.val(''); // needed for lookup search/modal input elements
    $(fieldName).val('');
    setFieldValue(fieldName, '');
  }
}
