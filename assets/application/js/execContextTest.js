function commonEventHandler(executionContext) {
  console.log('this is a test, executionContext:');
  console.log(executionContext);
  window.PODS = 'this is a test';
  debugger;
  let formContext = executionContext.getFormContext();
  this.parent.pageContext = formContext;
}
