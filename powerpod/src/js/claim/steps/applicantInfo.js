import { GROUP_APPLICATION_VALUE, NO_VALUE } from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldLogic.js';
import {
  hideQuestion,
  observeChanges,
  observeIframeChanges,
} from '../../common/html.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { setStepRequiredFields } from '../../common/setRequired.js';
import { setFieldReadOnly } from '../../common/validation.js';
import { customizeSingleOrGroupApplicantQuestions } from '../fieldLogic.js';

export function customizeApplicantInfoStep() {
  setStepRequiredFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation === 'NEFBA') {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: NO_VALUE,
      dependentOnElementTag: 'quartech_applicantinformationconfirmation',
      requiredFieldTag: 'quartech_applicantinformationcorrections',
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

  if (programAbbreviation === 'ABPP1') {
    if (!document.querySelector('#claimInformationNote')) {
      const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
        The Program requires paid invoice(s) from the Learning Provider(s), and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />
        <br />
        The Reimbursement Amount Requested for specialized training  should be the same as your approved Learning Action Plan  and Authorization Letter.<br />
        <br />
        Reimbursement Amount Requested includes registration fees (such as training, courses, registration, tuition) GST and total.</div>`;

      $('fieldset[aria-label="Claim Information"] > legend').after(
        claimInformationNoteHtmlContent
      );
    }
  } else if (programAbbreviation === 'ABPP2') {
    if (!document.querySelector('#claimInformationNote')) {
      const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
        The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />
        <br />
        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />
        <br />
        Reimbursement Amount Requested includes Consultant Fee, GST, and total.</div>`;

      $('fieldset[aria-label="Claim Information"] > legend').after(
        claimInformationNoteHtmlContent
      );
    }

    observeIframeChanges(
      customizeSingleOrGroupApplicantQuestions,
      'quartech_claimcoapplicants',
      'quartech_singleorgroupapplication'
    );
  }
}

function customizeBusinessPlanDependentQuestions() {
  if (document.querySelector('#claimInformationNote')) return;
  const iframe = document.querySelector(
    'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
  );
  // @ts-ignore
  const innerDoc = iframe?.contentDocument
    ? // @ts-ignore
      iframe.contentDocument
    : // @ts-ignore
      iframe.contentWindow.document;
  const completingCategoryElement = innerDoc?.getElementById(
    'quartech_completingcategory'
  );
  if (!!completingCategoryElement) {
    if (completingCategoryElement?.value === '255550000') {
      if (!document.querySelector('#claimInformationNote')) {
        const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.</div>`;

        $('fieldset[aria-label="Claim Information"] > legend').after(
          claimInformationNoteHtmlContent
        );
      }
    } else if (completingCategoryElement?.value === '255550001') {
      if (!document.querySelector('#claimInformationNote')) {
        const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />
        <br />
        The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).</div>`;

        $('fieldset[aria-label="Claim Information"] > legend').after(
          claimInformationNoteHtmlContent
        );
      }
    }
  }
}
