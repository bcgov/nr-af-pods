import { GROUP_APPLICATION_VALUE, NO_VALUE } from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldConditionalLogic.js';
import {
  hideFieldRow,
  hideQuestion,
  observeChanges,
  observeIframeChanges,
  showFieldRow,
} from '../../common/html.js';
import { Logger } from '../../common/logger.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { configureFields } from '../../common/fieldConfiguration.js';

const logger = Logger('claim/steps/applicantInfo');

export function customizeApplicantInfoStep() {
  configureFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation.includes('KTTP')) {
    // @ts-ignore
    // initOnChange_DependentRequiredField({
    //   dependentOnValue: NO_VALUE,
    //   dependentOnElementTag: 'quartech_applicantinformationconfirmation',
    //   requiredFieldTag: 'quartech_applicantinformationcorrections',
    // });
  }

  if (programAbbreviation === 'NEFBA' || programAbbreviation === 'NEFBA2') {
    // @ts-ignore
    // initOnChange_DependentRequiredField({
    //   dependentOnValue: NO_VALUE,
    //   dependentOnElementTag: 'quartech_applicantinformationconfirmation',
    //   requiredFieldTag: 'quartech_applicantinformationcorrections',
    // });
  }

  if (programAbbreviation.includes('ABPP')) {
    // @ts-ignore
    // initOnChange_DependentRequiredField({
    //   dependentOnValue: NO_VALUE,
    //   dependentOnElementTag: 'quartech_applicantinformationconfirmation',
    //   requiredFieldTag: 'quartech_applicantinformationcorrections',
    // });

    const iframe = document.querySelector(
      'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
    );
    // @ts-ignore
    const innerDoc = iframe.contentDocument
      ? // @ts-ignore
        iframe.contentDocument
      : // @ts-ignore
        iframe.contentWindow.document;
    const singleOrGroupApplicationElement = innerDoc.getElementById(
      'quartech_singleorgroupapplication'
    );

    if (!!singleOrGroupApplicationElement) {
      if (singleOrGroupApplicationElement?.value !== GROUP_APPLICATION_VALUE) {
        // hideQuestion('quartech_claimcoapplicants');
        hideFieldRow({ fieldName: 'quartech_claimcoapplicants' });
      } else {
        showFieldRow('quartech_claimcoapplicants');
      }
    }
  }
}
