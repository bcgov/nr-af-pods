// @ts-nocheck
import { POWERPOD } from './constants.js';
import {
  getControlValue,
  getInfoValue,
  isEmptyRow,
  isHiddenRow,
} from './html.js';
import { Logger } from './logger.js';

const logger = new Logger('common/form');

POWERPOD.form = {
  generateFormJson,
};

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

  const formJsonObj = {};

  fieldsetArr.forEach((fieldset) => {
    const displayName = fieldset.getAttribute('aria-label'); // e.g. "Application Information for Reimbursement"

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

    formJsonObj[sectionId] = {
      displayName: displayName,
      applicationInfoQuestionAnswerList: [],
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

      const questionText = getInfoValue(tr);
      const answerText = getControlValue(tr);

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

      formJsonObj[sectionId].applicationInfoQuestionAnswerList.push({
        applicationInfoQuestion: questionText,
        applicationInfoAnswer: answerText,
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
