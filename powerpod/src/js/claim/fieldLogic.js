import { GROUP_APPLICATION_VALUE } from '../common/constants.js';
import { hideFieldRow, hideQuestion } from '../common/html.js';

export function customizeSingleOrGroupApplicantQuestions(fieldToHide) {
  const iframe = document.querySelector(
    'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
  );
  // @ts-ignore
  const innerDoc = iframe?.contentDocument
    ? // @ts-ignore
      iframe.contentDocument
    : // @ts-ignore
      iframe.contentWindow.document;
  const singleOrGroupApplicationElement = innerDoc?.getElementById(
    'quartech_singleorgroupapplication'
  );
  if (!!singleOrGroupApplicationElement) {
    if (singleOrGroupApplicationElement?.value !== GROUP_APPLICATION_VALUE) {
      // hideQuestion(fieldToHide);
      hideFieldRow({ fieldName: fieldToHide });
    }
  }
}
