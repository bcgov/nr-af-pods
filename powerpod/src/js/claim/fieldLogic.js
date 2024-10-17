import { GROUP_APPLICATION_VALUE } from '../common/constants.js';
import { hideFieldRow, hideQuestion, showFieldRow } from '../common/html.js';

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
      // Note: This is used for hiding & showing `quartech_claimcoapplicants`
      hideFieldRow({ fieldName: fieldToHide });
    } else {
      showFieldRow(fieldToHide);
    }
  }
}
