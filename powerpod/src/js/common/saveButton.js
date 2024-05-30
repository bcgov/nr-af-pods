import store from '../store/index.js';
import { POWERPOD } from './constants.js';
import { patchClaimData } from './fetch.js';
import { getFormId } from './form.js';
import { Logger } from './logger.js';
import { isObjectEmpty } from './utils.js';

const logger = Logger('common/saveButton');

POWERPOD.saveButton = {
  addSaveButton,
};

export function addSaveButton() {
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

  saveButton.onclick = async () => {
    logger.info({
      fn: addSaveButton,
      message: 'Start saving form data...',
      data: { fields: store?.state?.fields ?? null },
    });

    if (isObjectEmpty(store?.state?.fields || {})) {
      logger.warn({
        fn: addSaveButton,
        message: 'No field data to save',
      });
      return;
    }

    const { fields: fieldsStore } = store.state;

    let payload = {};
    const fields = Object.keys(fieldsStore);

    fields.forEach((field) => {
      logger.info({
        fn: addSaveButton,
        message: `processing stored data for field: ${field}`,
      });

      const fieldData = fieldsStore[field];
      const { value, error } = fieldData;

      if (error && error.length) {
        logger.warn({
          fn: addSaveButton,
          message: `skipping saving data for field name: ${field}`,
        });
        return;
      }

      payload = {
        [field]: value,
        ...payload,
      };
    });

    if (isObjectEmpty(payload)) {
      logger.warn({
        fn: addSaveButton,
        message: 'no payload data to save',
      });
      return;
    }

    const formId = getFormId();

    // @ts-ignore
    saveButton.value = 'Saving...';

    try {
      const res = await patchClaimData({ id: formId, fieldData: payload });

      logger.info({
        fn: addSaveButton,
        message: 'successfully patched claim data with payload',
        data: { payload },
      });
    } catch (e) {
      logger.error({
        fn: addSaveButton,
        message: 'failed to patch claim data',
        data: { e },
      });
    } finally {
      // @ts-ignore
      saveButton.value = 'Save';
    }
  };
}