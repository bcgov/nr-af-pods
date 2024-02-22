import { GROUP_APPLICATION_VALUE, NO_VALUE } from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldLogic.js';
import {
  hideQuestion,
  observeChanges,
  observeIframeChanges,
} from '../../common/html.js';
import { Logger } from '../../common/logger.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { setStepRequiredFields } from '../../common/setRequired.js';
import { setFieldReadOnly } from '../../common/validation.js';
import { customizeSingleOrGroupApplicantQuestions } from '../fieldLogic.js';

const logger = new Logger('claim/steps/applicantInfo');

export function customizeApplicantInfoStep() {
  setStepRequiredFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation.includes('KTTP')) {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: NO_VALUE,
      dependentOnElementTag: 'quartech_applicantinformationconfirmation',
      requiredFieldTag: 'quartech_applicantinformationcorrections',
    });
  }

  if (programAbbreviation === 'NEFBA') {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: NO_VALUE,
      dependentOnElementTag: 'quartech_applicantinformationconfirmation',
      requiredFieldTag: 'quartech_applicantinformationcorrections',
    });

    logger.info({
      fn: customizeApplicantInfoStep,
      message: 'Observing changes on quartech_completingcategory...',
    });

    observeIframeChanges(
      customizeBusinessPlanDependentQuestions,
      null,
      'quartech_completingcategory'
    );
  }

  if (programAbbreviation.includes('ABPP')) {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: NO_VALUE,
      dependentOnElementTag: 'quartech_applicantinformationconfirmation',
      requiredFieldTag: 'quartech_applicantinformationcorrections',
    });

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
        hideQuestion('quartech_claimcoapplicants');
      }
    }
  }
}
