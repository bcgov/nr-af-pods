// @ts-nocheck
import { HtmlElementType, POWERPOD, doc, Form } from './constants.js';
import {
  getControlType,
  getControlValue,
  getControlId,
  getInfoValue,
  isEmptyRow,
  isHiddenRow,
} from './html.js';
import { getFormType } from './applicationUtils.js';
import { getProgramData } from './program.js';
import { Logger } from './logger.js';
import store from '../store/index.js';

const logger = Logger('common/form');

POWERPOD.form = {
  generateFormJson,
  getFormId,
  id: null,
};

export function getFormIdFromURLParams() {
  const params = new URLSearchParams(doc.location.search);
  let formId = params.get('id');
  if (!formId) {
    logger.info({
      fn: getFormIdFromURLParams,
      message: 'Form id not found in URL params',
    });
    return;
  }
  return formId;
}

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

  if (formId) {
    logger.info({
      fn: getFormId,
      message: `Successfully retrieved form submission id from url params: ${formId}`,
    });

    POWERPOD.form.id = formId;
    return formId;
  }

  logger.info({
    fn: getFormId,
    message:
      'Could not find current form submission id from url params, try DOM element containing the value...',
  });
  // Get the element by ID
  formElement = document.getElementById('EntityFormView_EntityID');

  if (!formElement) {
    logger.error({
      fn: getFormId,
      message:
        'Unable to find "EntityFormView_EntityID" element, unable to retrieve app/claim submission id!',
    });
    return;
  }

  // Get the value of the 'value' attribute
  formId = formElement.value;

  if (formId) {
    logger.info({
      fn: getFormId,
      message: `Successfully retrieved form submission id from "EntityFormView_EntityID" element: ${formId}`,
    });
    POWERPOD.form.id = formId;
    return formId;
  }

  // This code incorrectly would return the programid
  // if (!formId) {
  //   logger.info({
  //     fn: getFormId,
  //     message:
  //       'Could not find current form submission id from url params, try finding liquid form element...',
  //   });
  //   // Select the form element based on the tag 'form' and the id 'liquid_form'
  //   formElement = document.querySelector('form#liquid_form');

  //   if (!formElement) {
  //     logger.error({
  //       fn: getFormId,
  //       message:
  //         'Unable to find liquid form element, unable to retrieve app/claim submission id!',
  //     });
  //     return;
  //   }

  //   const actionAttribute = formElement.getAttribute('action');

  //   if (!actionAttribute) {
  //     logger.error({
  //       fn: getCurrentSubmissionId,
  //       message: 'Unable to retrieve action attribute from liquid form element',
  //       data: { formElement },
  //     });
  //     return;
  //   }

  //   // Define a regular expression pattern to match the id in the action attribute
  //   const regex = /id=([a-f\d-]+)/i;

  //   // Use the regular expression to extract the id from the action attribute
  //   const match = regex.exec(actionAttribute);

  //   // Retrieve the id from the matched groups
  //   formId = match ? match[1] : null;
  // }

  logger.error({
    fn: getFormId,
    message:
      'Unable to retrieve form submission id from either url or form element',
    data: { params, formElement },
  });
  return;
}

export function addFormDataOnClickHandler() {
  const nextButton = document.getElementById('NextButton');

  if (!nextButton?.onclick) {
    logger.error({
      fn: addFormDataOnClickHandler,
      message: `Error getting existing next btn on click handler`,
      data: { nextButton },
    });
    return;
  }

  const nextFn = nextButton.onclick;

  nextButton.removeAttribute('onclick');

  nextButton?.addEventListener('click', (event) =>
    formDataOnClickHandler(event, nextFn)
  );

  logger.info({
    fn: addFormDataOnClickHandler,
    message:
      'Successfully configured next button onclick handler for form data',
  });
}

function formDataOnClickHandler(event, nextFn) {
  const startTime = Date.now();
  event?.stopImmediatePropagation();
  event?.preventDefault();
  if (generateFormJson()) {
    nextFn();
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

export function generateFormJson(setFieldOrder = false) {
  const containerElement = document.querySelector('#EntityFormView');

  const wordTemplateDataElement = containerElement.querySelectorAll(
    'textarea[id*="quartech_wordtemplatedata"]'
  );

  if (
    !setFieldOrder &&
    (!wordTemplateDataElement || !wordTemplateDataElement.length)
  ) {
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

    const questionKey = `${sectionId}Question`;
    const answerKey = `${sectionId}Answer`;

    if (sectionId === 'applicantDeclarationSection') {
      const formType = getFormType();
      const consentText = generateConsentHtmlToText(formType);
      formJsonObj[sectionId][questionAnswerListKey].push({
        [questionKey]: 'Declaration & Consent Text',
        [answerKey]: consentText,
      });
    }

    trArray.forEach((tr) => {
      const controlType = getControlType({ tr });
      if (controlType === HtmlElementType.NotesControl) {
        logger.info({
          fn: generateFormJson,
          message: 'Skipping notes control element',
          data: { tr },
        });
        return;
      }
      const controlId = getControlId(tr, controlType);
      // exit early if the intention is just to set the field order
      if (controlId && setFieldOrder) {
        logger.info({
          fn: generateFormJson,
          message: `addToFieldOrder controlId: ${controlId}`,
        });
        store.dispatch('addToFieldOrder', controlId);
        return;
      }
      if (isHiddenRow(tr)) {
        logger.info({
          fn: generateFormJson,
          message: `Skipping hidden row, controlId: ${controlId}`,
          data: {
            tr,
          },
        });
        return;
      }
      if (isEmptyRow(tr)) {
        logger.info({
          fn: generateFormJson,
          message: `Skipping empty row, controlId: ${controlId}`,
          data: {
            tr,
          },
        });
        return;
      }

      let questionText = getInfoValue(tr);

      logger.info({
        fn: generateFormJson,
        message: `For controlId: ${controlId}, with controlType: ${controlType}; found questionText: ${questionText}, try finding answerText next...`,
        data: { tr },
      });

      let answerText = getControlValue({
        tr,
        controlId,
        forTemplateGeneration: true,
      });

      logger.info({
        fn: generateFormJson,
        message: `Converting controlId: ${controlId} form row to JSON...`,
        data: {
          tr,
          questionText,
          answerText,
        },
      });

      if (!answerText || answerText === 'undefined') {
        logger.warn({
          fn: generateFormJson,
          message: `answerText for controlId: ${controlId} was missing or undefined, answerText: ${answerText}, setting it to an empty string`,
        });
        answerText = '';
      }

      if (!questionText && POWERPOD.state?.fields?.[controlId]?.label) {
        questionText = POWERPOD.state?.fields?.[controlId]?.label;
      }

      if (!questionText) {
        logger.warn({
          fn: generateFormJson,
          message: `Could not find question text for controlId: ${controlId}, controlType: ${controlType}`,
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

      formJsonObj[sectionId][questionAnswerListKey].push({
        [questionKey]: questionText,
        [answerKey]: answerText,
      });
    });
  });

  if (setFieldOrder) {
    logger.info({
      fn: generateFormJson,
      message: `Successfully generated field order state array, exiting...`,
      data: { fieldOrder: POWERPOD.state.fieldOrder },
    });
    return;
  }

  logger.info({
    fn: generateFormJson,
    message:
      'Setting word template field data: \n' + `${JSON.stringify(formJsonObj)}`,
    data: {
      formJsonObj,
      wordTemplateDataElement: wordTemplateDataElement[0],
    },
  });

  wordTemplateDataElement[0].value = JSON.stringify(formJsonObj);
  return true;
}

export function generateConsentHtmlToText(formType) {
  const programName = getProgramData()?.quartech_applicantportalprogramname;
  let html = '';
  if (formType === Form.Claim) {
    html = `
      <div style='font-style: italic;'>
        <span>BY SUBMITTING THIS CLAIM FOR PAYMENT FORM TO %%ProgramName%% (the "Program"), I:</span>
        <u style='text-decoration:none;'>
            <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
            <li>declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this claim for payment form and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
            <li>acknowledge the information provided on this claim for payment and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
            <li>understand that failing to comply with all application requirements may delay the processing of the application or make the applicant ineligible to receive funding under the Program;</li>
            <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
            <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
            <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>
            <li>understand that the Program covers costs up to the maximum Approved amount. Any additional fees over and above the approved amount are the responsibility of the applicant and will not be covered by the B.C. Ministry of Agriculture and Food.</li>
            <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
        </u>
        <br/>
    </div>`;
  } else if (formType === Form.Application) {
    html = `
    <div style='font-style: italic;'>
      <span>BY SUBMITTING THIS APPLICATION FORM TO %%ProgramName%% (the "Program"), I:</span>
      <u style='text-decoration:none;'>
          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
          <li>declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this application and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
          <li>acknowledge the information provided on this application form and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
          <li>understand that failing to comply with all application requirements may delay the processing of this application or make the applicant ineligible to receive funding under the Program;</li>
          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>
          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
      </u>
      <br/>
  </div>`;
  }
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');

  // Set the HTML content
  tempDiv.innerHTML = html;

  // Extract text and format it
  let text = tempDiv.innerText
    .replace(/\s+/g, ' ') // Remove excess white spaces
    .replace(/^\d+/, '') // Remove potential numbering issues
    .replace(/•/g, '') // Remove any bullet points, if exist

    // Handle any placeholders
    .replace(/%%ProgramName%%/g, programName)

    // Add necessary formatting for better readability
    .replace(/\s*<li>\s*/gi, '\n- ') // Bullet points
    .replace(/<br\s*\/?>/gi, '\n'); // Line breaks

  // Return the cleaned and formatted text
  return text;
}
