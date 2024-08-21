export default {
  setFieldData(context, payload) {
    context.commit('setFieldData', payload);
  },
  addFieldData(context, payload) {
    context.commit('addFieldData', payload);
  },
  setValidationError(context, payload) {
    context.commit('setValidationError', payload);
  },
  addValidationError(context, payload) {
    context.commit('addValidationError', payload);
  },
  removeValidationError(context, payload) {
    context.commit('removeValidationError', payload);
  },
  addToFieldOrder(context, payload) {
    context.commit('addToFieldOrder', payload);
  },
};
