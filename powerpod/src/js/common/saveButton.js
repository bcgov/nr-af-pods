import store from '../store/index.js';
import { getFormType } from './applicationUtils.js';
import { Form, FormStep, POWERPOD } from './constants.js';
import { patchApplicationData, patchClaimData } from './fetch.js';
import { generateFormJson, getFormId } from './form.js';
import { Logger } from './logger.js';
import { getCurrentStep } from './program.js';
import { PropertyReferences, PropertyReferenceValues } from './propertyRefs.js';
import { isObjectEmpty } from './utils.js';

const logger = Logger('common/saveButton');

POWERPOD.saveButton = {
  addSaveButton,
};

export function addSaveButton() {
  const currentStep = getCurrentStep();
  if (currentStep === FormStep.DeclarationAndConsent) {
    logger.info({
      fn: addSaveButton,
      message: `Skip adding save button on currentStep: ${currentStep}`,
    });
    return;
  }
  const saveBtnHtml = `
    <input 
      type="button"
      value="Save"
      id="quartechSaveBtn"
      class="btn button next submit-btn"
      style="color: #FFFFFF;border-color: #277493;border-radius: 2px;font-family: Arial;font-weight: 600;font-size: 14px;padding: 6px 20px;width: fit-content;border-style: solid;background-color: #3E9327;color: #FFFFFF;" 
      nonactionlinkbutton="true"
    >
  `;

  const divElement = document.createElement('div');
  divElement.setAttribute('role', 'group');
  divElement.setAttribute('class', 'btn-group entity-action-button');
  divElement.innerHTML = saveBtnHtml;

  const actionsDiv = document.querySelector(
    '#WebFormPanel > div.actions > div'
  );

  actionsDiv?.append(divElement);

  const saveButton = document.getElementById('quartechSaveBtn');

  if (!saveButton) {
    logger.error({
      fn: addSaveButton,
      message: 'Could not get saveButton after adding it to the DOM',
    });
    return;
  }

  saveButton.onclick = async () => saveFormData({});
}

export async function saveFormData({ customPayload = {} }) {
  const saveButton = document.getElementById('quartechSaveBtn');
  if (!saveButton) {
    logger.error({
      fn: saveFormData,
      message: 'Could not get saveButton after adding it to the DOM',
    });
    return;
  }
  logger.info({
    fn: saveFormData,
    message: 'Start saving form data...',
    data: { fields: store?.state?.fields ?? null },
  });
  // @ts-ignore
  saveButton.value = 'Saving...';
  generateFormJson();

  if (isObjectEmpty(store?.state?.fields || {})) {
    logger.warn({
      fn: saveFormData,
      message: 'No field data to save',
    });
    saveButton.value = 'Save';
    return;
  }

  const { fields: fieldsStore } = store.state;

  let payload = {};
  const fields = Object.keys(fieldsStore);

  fields.forEach((field) => {
    logger.info({
      fn: saveFormData,
      message: `processing stored data for field: ${field}`,
    });

    const fieldData = fieldsStore[field];
    logger.info({
      fn: saveFormData,
      message: `found stored data for field: ${field}, fieldData: ${JSON.stringify(
        fieldData
      )}`,
    });
    const { value, error } = fieldData;

    if (error && error.length) {
      logger.warn({
        fn: saveFormData,
        message: `skipping saving data for field name: ${field}`,
      });
      return;
    }

    // @ts-ignore
    if (PropertyReferences[field]) {
      payload = {
        // @ts-ignore
        ...(value && {
          // @ts-ignore
          [PropertyReferences[field]]: PropertyReferenceValues[field](value),
        }),
        ...payload,
        ...(Object.keys(customPayload)?.length && customPayload),
      };
    } else {
      payload = {
        ...(value && { [field]: value }),
        ...payload,
        ...(Object.keys(customPayload)?.length && customPayload),
      };
    }

    if (customPayload && Object.keys(customPayload).length > 0) {
      logger.info({
        fn: saveFormData,
        message: `Adding custom payload to form save data payload: ${JSON.stringify(
          customPayload
        )}`,
        data: { payload, customPayload },
      });
    }
  });

  if (isObjectEmpty(payload)) {
    logger.warn({
      fn: saveFormData,
      message: 'no payload data to save',
    });
    saveButton.value = 'Save';
    return;
  }

  const formId = getFormId();
  const formType = getFormType();

  try {
    let res;

    if (formType === Form.Application) {
      res = await patchApplicationData({ id: formId, fieldData: payload });
    } else if (formType === Form.Claim) {
      res = await patchClaimData({ id: formId, fieldData: payload });
    }

    logger.info({
      fn: saveFormData,
      message: 'successfully patched form data with payload',
      data: { formId, formType, payload },
    });
  } catch (e) {
    logger.error({
      fn: saveFormData,
      message: `failed to patch form data for formType: ${formType}`,
      data: { e, formId, formType, payload },
    });
  } finally {
    // @ts-ignore
    saveButton.value = 'Save';
  }
}
