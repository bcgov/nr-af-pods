export function showFieldsetElement(fieldsetName: any): void;
export function showFieldRow(fieldName: any): void;
export function addTextAboveField(fieldName: any, htmlContentToAdd: any): void;
export function addTextBelowField(fieldName: any, htmlContentToAdd: any): void;
export function observeChanges(element: any, customFunc: any): void;
export function observeIframeChanges(funcToExecute: any, fieldNameToPass: any, fieldNameToObserve: any): void;
export function hideFieldByFieldName(fieldName: any, validationFunc: any, doNotBlank?: boolean): void;
export function hideQuestion(fieldName: any): void;
export function showOrHideAndReturnValue(valueElementId: any, descriptionElementId: any): number;
/**
 * Programmatically set a field value and trigger change event.
 * Ensures validation checks pick up on change event.
 * @function
 * @param {string} name - The name of the associated field id.
 * @param {string} value - The value to set the field to.
 */
export function setFieldValue(name: string, value: string): void;
export function combineElementsIntoOneRow(valueElementId: any, descriptionInputElementId: any): void;
export function hideAllStepSections(): void;
export function hideFields(hidden?: boolean): void;
export function hideFieldSets(hidden?: boolean): void;
export function hideFieldsAndSections(hidden?: boolean): void;
export function isNode(o: any): any;
export function htmlDecode(input: any): string | undefined;
