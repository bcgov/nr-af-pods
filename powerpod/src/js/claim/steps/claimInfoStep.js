import { html } from 'lit';
import {
  GROUP_APPLICATION_VALUE,
  NO_VALUE,
  doc,
} from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldConditionalLogic.js';
import {
  hideQuestion,
  observeChanges,
  observeIframeChanges,
  setFieldValue,
} from '../../common/html.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { configureFields } from '../../common/fieldConfiguration.js';
import { setFieldReadOnly } from '../../common/fieldValidation.js';
import { customizeSingleOrGroupApplicantQuestions } from '../fieldLogic.js';
import '../../components/ExpenseReportTable.ts';
import '../../components/CurrencyInput.ts';
import '../../components/DropdownSearch.ts';
import '../../components/TextField.ts';
import 'fa-icons';
import { getTotalExpenseAmount } from '../../common/expenseTypes.ts';
import { Logger } from '../../common/logger.js';
import { filterEmptyRows } from '../../common/utils.js';

const logger = new Logger('claim/steps/claimInfoStep');

export function customizeClaimInfoStep() {
  configureFields();

  const programAbbreviation = getProgramAbbreviation();

  // START step specific functions
  function addInstructions() {
    if (!document.querySelector('#claimInfoInstructionsNote')) {
      const claimInfoInstructionsNoteHtmlContent = `
        <div id="claimInfoInstructionsNote" style="padding-bottom: 20px;">
          <b>Instructions:</b>
          <ul style="font-size: inherit;">
            <li>List all eligible expenses for which you seek reimbursement in this claim​</li>
            <li>Please see the program guide for more details on eligible and ineligible expenses</li>
            <li>Do not include expenses that are excluded from reimbursement​</li>
            <li>As a condition of reimbursement, you will be required to maintain books of account, invoices, receipts, and vouchers for all expenses incurred in relation to the event until March 31, 2031</li>
          </ul>
        </div>
      `;

      $('#quartech_eligibleexpenses')
        .closest('tr')
        .before(claimInfoInstructionsNoteHtmlContent);
    }
  }

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

  function addKttpFundingInformationNote() {
    if (!document.querySelector('#claimInformationNote')) {
      const fundingInformationNoteHtmlContent = `
        <div id="claimInformationNote" style="padding-bottom: 20px;">
          The amount requested for reimbursement should not exceed the amount approved in the Authorization Letter.
        </div>
      `;

      $('fieldset[aria-label="Funding Information"] > legend').after(
        fundingInformationNoteHtmlContent
      );
    }
  }

  function addKttpRequestedClaimAmountNote() {
    if (!document.querySelector('#requestedClaimAmountNote')) {
      const requestedClaimAmountNoteHtmlContent = `<div id="requestedClaimAmountNote" style="padding-bottom: 20px;">
        The amount requested for reimbursement includes all eligible costs (such as training, courses, registration, tuition) in $CAD.
      </div>`;

      $('#quartech_totalfees')
        .closest('tr')
        .before(requestedClaimAmountNoteHtmlContent);
    }
  }
  // END step specific functions

  if (programAbbreviation.includes('KTTP')) {
    addInstructions();
    addExpenseReportGrid();
    addKttpFundingInformationNote();
    addKttpRequestedClaimAmountNote();

    verifyTotalSumEqualsRequestedAmount();

    $('#quartech_totalfees').on('change keyup blur', () => {
      verifyTotalSumEqualsRequestedAmount();
    });
  }

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
      () => customizeInterimPaymentAmountField()
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

function showSumNotEqualWarning(show) {
  const totalSumNotEqualNoteHtml = `
    <div id="totalSumDoesNotEqualRequestAmountWarning" style="padding-bottom: 20px;">
      <span style="color: red">Your requested amount does not equal the total of reported expenses! Please make sure this is the correct amount you want to request before continuing.</span>
    </div>
  `;
  if (
    show &&
    !document.querySelector('#totalSumDoesNotEqualRequestAmountWarning')
  ) {
    $('#quartech_totalfees').closest('tr').after(totalSumNotEqualNoteHtml);
  } else if (show) {
    $('#totalSumDoesNotEqualRequestAmountWarning').css('display', '');
  } else if (!show) {
    $('#totalSumDoesNotEqualRequestAmountWarning').css('display', 'none');
  }
}

function verifyTotalSumEqualsRequestedAmount() {
  if (
    $('#quartech_totalfees')?.val() !==
    $('#quartech_totalsumofreportedexpenses')?.val()
  ) {
    showSumNotEqualWarning(true);
  } else {
    showSumNotEqualWarning(false);
  }
}

function addExpenseReportGrid() {
  const eligibleExpensesId = 'quartech_eligibleexpenses';
  if (!$(`#${eligibleExpensesId}`)) return;
  const fieldControlDiv = $(`#${eligibleExpensesId}`).closest('div');
  const columns = [
    {
      id: 'type',
      name: 'Expense Type',
      width: '35%',
    },
    {
      id: 'description',
      name: 'Description',
      width: '50%',
    },
    {
      id: 'amount',
      name: 'Amount ($CAD)',
      width: '15%',
    },
  ];

  let rows = [
    {
      type: '',
      description: '',
      amount: '',
    },
  ];

  const expenseReportTableElement = doc.createElement('expense-report-table');
  expenseReportTableElement.setAttribute('primary', 'true');
  expenseReportTableElement.setAttribute('columns', JSON.stringify(columns));
  expenseReportTableElement.setAttribute('rows', JSON.stringify(rows));

  $(fieldControlDiv)?.before(expenseReportTableElement);

  // hide dynamics field
  $(`#${eligibleExpensesId}`).css({ display: 'none' });

  // fetch pre-selected options, if any
  const existingEligibleExpenses = $(`#${eligibleExpensesId}`).val();

  // @ts-ignore
  if (
    existingEligibleExpenses?.length > 0 &&
    existingEligibleExpenses !== '[]'
  ) {
    // @ts-ignore
    expenseReportTableElement.setAttribute('rows', existingEligibleExpenses);
    setFieldValue(
      'quartech_totalsumofreportedexpenses',
      // @ts-ignore
      getTotalExpenseAmount(JSON.parse(existingEligibleExpenses))
    );
    verifyTotalSumEqualsRequestedAmount();
  }

  expenseReportTableElement.addEventListener(
    'onChangeExpenseReportData',
    (e) => {
      logger.info({
        fn: customizeClaimInfoStep,
        message: 'onChangeExpenseReportData event listener triggered',
        data: {
          e,
        },
      });
      // @ts-ignore
      rows = JSON.parse(e.detail.value);
      expenseReportTableElement.setAttribute('rows', JSON.stringify(rows));
      setFieldValue(eligibleExpensesId, JSON.stringify(filterEmptyRows(rows)));
      // @ts-ignore
      setFieldValue('quartech_totalsumofreportedexpenses', e.detail.total);
      verifyTotalSumEqualsRequestedAmount();
    }
  );
}
