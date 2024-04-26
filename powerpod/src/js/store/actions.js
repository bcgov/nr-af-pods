export default {
  setValidationError(context, payload) {
    context.commit('setValidationError', payload);
  },
  addValidationError(context, payload) {
    context.commit('addValidationError', payload);
  },
  removeValidationError(context, payload) {
    context.commit('removeValidationError', payload);
  },
};
