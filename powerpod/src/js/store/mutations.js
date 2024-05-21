import { displayValidationErrors } from '../common/fieldValidation.js';
import { Logger } from '../common/logger.js';

const logger = Logger('store/mutations');

export default {
  setFieldData(state, payload) {
    logger.info({
      fn: this.setFieldData,
      message: 'Updated field config in state',
      data: { state, payload },
    });
    state.fields = payload.fields;
    return state;
  },
  addFieldData(state, payload) {
    logger.info({
      fn: this.addFieldData,
      message: 'Add field data to state',
      data: { state, payload },
    });
    let fieldData;
    if (state.fields[payload.name]) {
      fieldData = state.fields[payload.name];
    }

    fieldData = {
      ...fieldData,
      ...payload,
    };

    state.fields[payload.name] = fieldData;
    return state;
  },
  setValidationError(state, payload) {
    if (state.validationError === payload) {
      logger.warn({
        fn: this.setValidationError,
        message:
          'Previous validationError state matches payload, no need to update',
        data: { state, payload },
      });
      return state;
    }
    state.validationError = payload;
    displayValidationErrors(state.validationError);
    return state;
  },
  addValidationError(state, payload) {
    if (state.validationError.includes(payload)) {
      logger.warn({
        fn: this.addValidationError,
        message:
          'Added validationError message already included in currently displayed message',
        data: { state, payload },
      });
      return state;
    }
    const currentState = state.validationError;
    state.validationError = currentState.concat(payload);
    displayValidationErrors(state.validationError);
    return state;
  },
  removeValidationError(state, payload) {
    if (!state.validationError.includes(payload)) {
      logger.error({
        fn: this.addValidationError,
        message:
          'Requested validationError paylaod does not exist in current state',
        data: { state, payload },
      });
      return state;
    }
    const currentState = state.validationError;
    state.validationError = currentState.replace(payload, '');
    displayValidationErrors(state.validationError);
    return state;
  },
};
