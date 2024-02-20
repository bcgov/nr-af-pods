import { Logger } from './logger.js';
import { validateRequiredFields } from './validation.js';

const logger = new Logger('common/html');

export function showFieldsetElement(fieldsetName) {
  const sectionElement = $(`fieldset[aria-label="${fieldsetName}"]`);
  if (sectionElement) {
    sectionElement.css({ display: '' });
  }
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

export function addTextAboveField(fieldName, htmlContentToAdd) {
  const fieldLabelDivContainer = $(`#${fieldName}_label`).parent();
  if (!fieldLabelDivContainer) return;

  fieldLabelDivContainer.prepend(htmlContentToAdd);
}

export function addTextBelowField(fieldName, htmlContentToAdd) {
  const fieldLabelDivContainer = $(`#${fieldName}_label`).parent().parent();
  if (!fieldLabelDivContainer) return;

  fieldLabelDivContainer.append(htmlContentToAdd);
}

export function observeChanges(element, customFunc) {
  logger.info({
    fn: observeChanges,
    message: 'observing changes...',
    data: {
      element,
    },
  });
  if (!element) {
    logger.error({
      fn: observeChanges,
      message: 'failed to observe changes, null element',
      data: {
        element,
      },
    });
    return;
  }
  // initial load:
  if (customFunc) {
    customFunc();
  } else {
    validateRequiredFields();
  }

  // watch for changes
  var observer = new MutationObserver(function (mutations, observer) {
    if (customFunc) {
      customFunc();
    } else {
      validateRequiredFields();
    }
  });
  observer.observe(element, {
    attributes: true,
    childList: true,
    characterData: true,
  });
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

export function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent?.replace(/[^\x00-\x7F]/g, '');
}
