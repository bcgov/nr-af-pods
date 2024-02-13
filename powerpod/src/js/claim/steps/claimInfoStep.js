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

export function customizeClaimInfoStep() {
  setStepRequiredFields();

  const programAbbreviation = getProgramAbbreviation();

  // START step specific functions
  function addRequestedClaimAmountNote() {
    if (!document.querySelector('#requestedClaimAmountNote')) {
      const requestedClaimAmountNoteHtmlContent = `<div id="requestedClaimAmountNote" style="padding-bottom: 20px;">
        The Program covers costs up to the maximum amount indicated in your Approval Letter.<br />
        Any additional fees invoiced will not be covered by the B.C. Ministry of Agriculture and Food
      </div>`;

      $('#quartech_totalfees')
        .closest('tr')
        .before(requestedClaimAmountNoteHtmlContent);
    }
  }

  function addClaimAmountCaveatNote() {
    if ($('#quartech_interimorfinalpayment').val() === '255550000') {
      if (!document.querySelector('#claimAmountCaveatNote')) {
        const claimAmountCaveatNoteHtmlContent = `
          <div id='claimAmountCaveatNote' style="padding-bottom: 20px;">
            The requested amount must fall within the range of $500.00 to the authorized amount specified on the Authorization Letter.
          </div>
        `;

        $('#requestedClaimAmountNote').after(claimAmountCaveatNoteHtmlContent);
      } else {
        $('#claimAmountCaveatNote')?.css({ display: '' });
      }
    } else {
      $('#claimAmountCaveatNote')?.css({ display: 'none' });
    }
  }
  // END step specific functions

  if (programAbbreviation === 'NEFBA') {
    addRequestedClaimAmountNote();

    observeIframeChanges(
      customizeBusinessPlanDependentQuestions,
      null,
      'quartech_completingcategory'
    );
  }

  if (programAbbreviation.includes('ABPP')) {
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

    addRequestedClaimAmountNote();

    addClaimAmountCaveatNote();
    $('select[id*="quartech_interimorfinalpayment"]').on('change', function () {
      addClaimAmountCaveatNote();
    });
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

    observeChanges(
      $('#quartech_requestedinterimpaymentamount')[0],
      customizeInterimPaymentAmountField()
    );

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

function customizeInterimPaymentAmountField() {
  const iterimPaymentAmount = $(
    '#quartech_requestedinterimpaymentamount'
  )?.val();
  // @ts-ignore
  let value = parseFloat(iterimPaymentAmount.replace(/,/g, ''));
  if (isNaN(value)) value = 0.0;

  if (value > 0) {
    setFieldReadOnly('quartech_requestedinterimpaymentamount');
    setFieldReadOnly('quartech_interimorfinalpayment');
  } else {
    hideQuestion('quartech_requestedinterimpaymentamount');
  }
}

