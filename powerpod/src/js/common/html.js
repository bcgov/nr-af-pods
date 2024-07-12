import { HtmlElementType, doc } from './constants.js';
import { Logger } from './logger.js';
import { validateRequiredFields } from './fieldValidation.js';
import { POWERPOD } from './constants.js';

const logger = Logger('common/html');

POWERPOD.html = {
  observeChanges,
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

export function getControlType(tr) {
  const controlDiv = tr.querySelector('div.control');
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

  const tag = control.tagName.toLowerCase();
  const classes = control.getAttribute('class');
  const typeAttribute = control.getAttribute('type');

  if (tag === 'input' && classes?.includes('money')) {
    return HtmlElementType.CurrencyInput;
  } else if (tag === 'input' && classes?.includes('text')) {
    return HtmlElementType.Input;
  } else if (tag === 'input' && classes?.includes('datetime')) {
    return HtmlElementType.DatePicker;
  } else if (tag === 'textarea' && classes?.includes('textarea')) {
    return HtmlElementType.TextArea;
  } else if (tag === 'select' && classes?.includes('picklist')) {
    return HtmlElementType.DropdownSelect;
  } else if (tag === 'input' && control.type === 'checkbox') {
    return HtmlElementType.Checkbox;
  }
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

export function isEmptyRow(tr) {
  const firstTd = tr.querySelector('td');
  if (
    !firstTd ||
    firstTd?.getAttribute('quartechHtml') === 'true' ||
    firstTd?.getAttribute('class').includes('zero-cell') ||
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

export function getInfoValue(tr) {
  const questionDiv = tr.querySelector('.info');
  const questionText = questionDiv?.querySelector('label')?.textContent;
  return questionText;
}

export function getControlValue({ tr, rawValue = false }) {
  const type = getControlType(tr);

  logger.info({
    fn: getControlValue,
    message: `Attempting to get control value for type: ${type}, rawValue: ${rawValue}`,
  });

  const controlDiv = tr.querySelector('.control');

  if (type === HtmlElementType.CurrencyInput) {
    const value = controlDiv?.querySelector('input')?.value;
    if (rawValue) return value;
    return `$${value}`;
  } else if (type === HtmlElementType.Input) {
    return controlDiv?.querySelector('input')?.value;
  } else if (type === HtmlElementType.DatePicker) {
    return controlDiv?.querySelector('div > .datetimepicker > input')?.value;
  } else if (type === HtmlElementType.TextArea) {
    return controlDiv?.querySelector('textarea').value?.replace(/\n/g, ' ');
  } else if (type === HtmlElementType.DropdownSelect) {
    const selectElement = controlDiv?.querySelector('select');
    if (rawValue) return selectElement.value;
    const selectedIndex = selectElement?.selectedIndex;
    const selectedOption = selectElement.options[selectedIndex];
    const selectedOptionText =
      selectedOption.textContent || selectedOption.innerText;
    return selectedOptionText;
  } else if (type === HtmlElementType.Checkbox) {
    const checked = controlDiv?.querySelector('input')?.checked;
    if (rawValue) return checked;
    if (checked) return 'Yes';
    return 'No';
  }
  return null;
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

export function showFieldRow(fieldName) {
  const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
  if (!fieldLabelElement) return;
  const fieldRow = fieldLabelElement.closest('tr');

  if (!fieldRow) return;

  $(fieldRow)?.css({ display: '' });

  // check if a fieldset exists and make sure it's visible if so
  const nearestFieldSet = fieldRow.closest('fieldset');
  $(nearestFieldSet)?.css({ display: '' });
}

export function addHtmlToTabDiv(
  tabDataName,
  htmlContentToAdd,
  topOrBottom = 'top'
) {
  const tabDiv = doc.querySelector(`div[data-name='${tabDataName}']`);
  if (!tabDiv) {
    logger.error({
      fn: addHtmlToTabDiv,
      message: `Unable to add to tab div of tabDataName: ${tabDataName}, could not find tab div`,
    });
    return;
  }

  const divElement = doc.createElement('div');

  divElement.setAttribute('quartechHtml', 'true');
  divElement.innerHTML = htmlContentToAdd;

  if (topOrBottom === 'top') {
    tabDiv.prepend(divElement);
  } else {
    tabDiv.append(divElement);
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
      validateRequiredFields();
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
        validateRequiredFields();
      }
    }
    return observer;
  }
  logger.warn({
    fn: observeChanges,
    message: 'Unable to assign observer for some reason',
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

export function hideFieldByFieldName(
  fieldName,
  validationFunc,
  doNotBlank = false
) {
  const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
  if (!fieldLabelElement) return;
  const fieldRow = fieldLabelElement.closest('tr');

  const fieldInputElement = document.querySelector(`#${fieldName}`);

  if (!fieldRow || !fieldInputElement) return;

  $(fieldRow).css({ display: 'none' });
  $(`#${fieldName}_label`).parent().removeClass('required');
  localStorage.removeItem(`shouldRequire_${fieldName}`);
  if (validationFunc) {
    validationFunc();
  }
  $(fieldInputElement).off('change');

  if (!doNotBlank) {
    $(fieldInputElement).val('');
  }
}

export function hideQuestion(fieldName) {
  $(`#${fieldName}`).css('display', 'none');
  $(`#${fieldName}`).val('');
  const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
  const fieldRow = fieldLabelElement.closest('tr');
  $(fieldRow).css({ display: 'none' });
  validateRequiredFields();
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
export function setFieldValue(name, value) {
  const element = document.querySelector(`#${name}`);
  if (!element) return;
  // @ts-ignore
  element.value = value;
  const e = new Event('change');
  element.dispatchEvent(e);
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

  const controlDiv = inputElement.closest('div.control');

  const tr = inputElement.closest('tr');

  const clonedTd = inputTd.clone();
  clonedTd.attr('colspan', '1');
  tr.append(clonedTd);

  controlDiv.remove();

  const newInfoDiv = clonedTd.find('div.info');
  newInfoDiv.remove();
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

export function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent?.replace(/[^\x00-\x7F]/g, '');
}
