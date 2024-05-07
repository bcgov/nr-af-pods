// @ts-nocheck
import { POWERPOD, doc } from './constants.js';
import {
  getControlType,
  getControlValue,
  getInfoValue,
  isEmptyRow,
  isHiddenRow,
} from './html.js';
import { Logger } from './logger.js';

const logger = Logger('common/form');

POWERPOD.form = {
  generateFormJson,
  getFormId,
  id: null,
};

export function getFormId() {
  if (window.location.hostname === 'localhost') {
    return '1af24e49-05fd-ee11-9f8a-6045bd5f4613';
  }
  if (POWERPOD.form?.id) {
    const formId = POWERPOD.form?.id;
    logger.info({
      fn: getFormId,
      message: `Cached form submission id found, returning ${formId}`,
    });
    return formId;
  }

  const params = new URLSearchParams(doc.location.search);
  let formId = params.get('id');
  let formElement;

  if (!formId) {
    logger.info({
      fn: getFormId,
      message:
        'Could not find current form submission id from url params, try finding liquid form element...',
    });
    // Select the form element based on the tag 'form' and the id 'liquid_form'
    formElement = document.querySelector('form#liquid_form');

    if (!formElement) {
      logger.error({
        fn: getFormId,
        message:
          'Unable to find liquid form element, unable to retrieve app/claim submission id!',
      });
      return;
    }

    const actionAttribute = formElement.getAttribute('action');

    if (!actionAttribute) {
      logger.error({
        fn: getCurrentSubmissionId,
        message: 'Unable to retrieve action attribute from liquid form element',
        data: { formElement },
      });
      return;
    }

    // Define a regular expression pattern to match the id in the action attribute
    const regex = /id=([a-f\d-]+)/i;

    // Use the regular expression to extract the id from the action attribute
    const match = regex.exec(actionAttribute);

    // Retrieve the id from the matched groups
    formId = match ? match[1] : null;
  }

  if (!formId) {
    logger.error({
      fn: getFormId,
      message:
        'Unable to retrieve form submission id from either url or form element',
      data: { params, formElement },
    });
    return;
  }

  logger.info({
    fn: getFormId,
    message: `Successfully retrieved form submission id from url params: ${formId}`,
  });

  POWERPOD.form.id = formId;
  return formId;
}

export function addFormDataOnClickHandler() {
  const nextButton = document.getElementById('NextButton');
  nextButton?.addEventListener('click', formDataOnClickHandler);
}

function formDataOnClickHandler(event) {
  const startTime = Date.now();
  event?.stopImmediatePropagation();
  event?.preventDefault();
  if (generateFormJson()) {
    event?.target?.onclick();
  } else {
    logger.error({
      fn: formDataOnClickHandler,
      message: 'Failed to generate form json data!',
    });
  }
  const elapsedTime = Date.now() - startTime;
  logger.info({
    fn: formDataOnClickHandler,
    message: `Generating form data json took ${elapsedTime} ms`,
  });
}

export function generateFormJson() {
  const containerElement = document.querySelector('#EntityFormView');

  const wordTemplateDataElement = containerElement.querySelectorAll(
    'textarea[id*="quartech_wordtemplatedata"]'
  );

  if (!wordTemplateDataElement || !wordTemplateDataElement.length) {
    logger.info({
      fn: generateFormJson,
      message: 'No need to generate form json if no word template field exists',
    });
    return true;
  }

  const fieldsetArr = containerElement?.querySelectorAll('fieldset');

  const tabDivElement = containerElement?.querySelector('.tab');

  if (
    !containerElement ||
    !fieldsetArr ||
    !fieldsetArr?.length ||
    !tabDivElement
  ) {
    logger.error({
      fn: generateFormJson,
      message: 'Unable to generate form JSON, could not find required elements',
    });
    return false;
  }

  const tabDataName = tabDivElement.getAttribute('data-name'); // e.g. "applicantInfoTab"

  if (!tabDataName) {
    logger.error({
      fn: generateFormJson,
      message: 'Failed to get tab data-name',
      data: {
        tabDivElement,
      },
    });
    return false;
  }

  logger.info({
    fn: generateFormJson,
    message: `Processing fieldSet array for tabDataName: ${tabDataName}`,
  });

  const formJsonObj = {};

  fieldsetArr.forEach((fieldset) => {
    const displayName = fieldset.querySelector('h3')?.textContent; // e.g. "Application Information for Reimbursement"

    const tableElement = fieldset.querySelector('table');
    const sectionId = tableElement?.getAttribute('data-name'); // e.g. "applicationInfoSection"
    if (sectionId && sectionId.toLowerCase().includes('codingsection')) {
      logger.info({
        fn: generateFormJson,
        message: 'Skipping coding section...',
      });
      return;
    }

    if (fieldset.style?.display === 'none') {
      logger.info({
        fn: generateFormJson,
        message: 'Skipping hidden section...',
        data: {
          fieldset,
        },
      });
      return;
    }

    const trArray = tableElement?.querySelectorAll('tbody > tr');

    if (!sectionId || !displayName || !trArray || !trArray.length) {
      logger.error({
        fn: generateFormJson,
        message:
          'Unable to generate form JSON, could not find required section elements',
        data: {
          tabDataName,
        },
      });
    }

    logger.info({
      fn: generateFormJson,
      message: `Processing tr array for sectionId: ${sectionId}, displayName: ${displayName}`,
    });

    const questionAnswerListKey = `${sectionId}QuestionAnswerList`;

    formJsonObj[sectionId] = {
      displayName: displayName,
      [questionAnswerListKey]: [],
    };

    trArray.forEach((tr) => {
      if (isHiddenRow(tr)) {
        logger.info({
          fn: generateFormJson,
          message: 'Skipping hidden row',
          data: {
            tr,
          },
        });
        return;
      }
      if (isEmptyRow(tr)) {
        logger.info({
          fn: generateFormJson,
          message: 'Skipping empty row',
          data: {
            tr,
          },
        });
        return;
      }

      const controlType = getControlType(tr);
      const questionText = getInfoValue(tr);

      logger.info({
        fn: generateFormJson,
        message: `For controlType: ${controlType}; found questionText: ${questionText}, try finding answerText next...`,
        data: { tr },
      });

      const answerText = getControlValue({ tr });

      logger.info({
        fn: generateFormJson,
        message: 'Converting form row to JSON...',
        data: {
          tr,
          questionText,
          answerText,
        },
      });

      if (!questionText) {
        logger.error({
          fn: generateFormJson,
          message: 'Could not find question text',
          data: {
            tr,
          },
        });
        return; // skip this forEach loop
      }

      if (questionText.toLowerCase().includes('eligible expenses')) {
        logger.info({
          fn: generateFormJson,
          message: 'Skipping Eligible Expenses question/answer',
          data: {
            questionText,
            answerText,
            tr,
          },
        });
        return; // skip this forEach loop
      }

      const questionKey = `${sectionId}Question`;
      const answerKey = `${sectionId}Answer`;

      formJsonObj[sectionId][questionAnswerListKey].push({
        [questionKey]: questionText,
        [answerKey]: answerText,
      });
    });
  });

  logger.info({
    fn: generateFormJson,
    message: 'Setting word template field data',
    data: {
      formJsonObj,
      wordTemplateDataElement: wordTemplateDataElement[0],
    },
  });

  wordTemplateDataElement[0].value = JSON.stringify(formJsonObj);
  return true;
}
