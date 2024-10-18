import { html } from 'lit';
import {
  GROUP_APPLICATION_VALUE,
  NO_VALUE,
  doc,
} from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldConditionalLogic.js';
import {
  hideFieldRow,
  hideQuestion,
  observeChanges,
  observeIframeChanges,
  setFieldValue,
  showFieldRow,
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
import { renderCustomComponent } from '../../common/components.ts';

const logger = Logger('claim/steps/claimInfoStep');

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
            <li>List all eligible expenses for which you seek reimbursement in this claim​.</li>
            <li>Please see the program guide for more details on eligible and ineligible expenses.</li>
            <li>Do not include expenses that are excluded from reimbursement​.</li>
            <li>As a condition of reimbursement, you will be required to maintain books of account, invoices, receipts, and vouchers for all expenses incurred in relation to the event until March 31, 2031.</li>
            <li>You do not need to submit proof of payment (receipts) with your claim. Keep all proof of payment for 7 years in case of audit.</li>
          </ul>
        </div>
      `;

      $('#quartech_eligibleexpenses')
        .closest('tr')
        .before(claimInfoInstructionsNoteHtmlContent);
    }
  }

  function addVVTSApprovedFundingAmount() {
    const iframe = document.querySelector(
      'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
    );
    // @ts-ignore
    const innerDoc = iframe?.contentDocument
      ? // @ts-ignore
        iframe.contentDocument
      : // @ts-ignore
        iframe.contentWindow.document;
    const numberOfStudentsApprovedFieldElement = innerDoc?.getElementById(
      'quartech_numberofstudentsapproved'
    );

    logger.info({
      fn: addVVTSApprovedFundingAmount,
      message: `Change detected...`,
      data: {
        numberOfStudentsApprovedFieldElement,
        value: numberOfStudentsApprovedFieldElement?.value,
      },
    });

    if (
      numberOfStudentsApprovedFieldElement &&
      numberOfStudentsApprovedFieldElement?.value !== undefined &&
      !document.querySelector('#vvtsFundingApprovedAmount')
    ) {
      const vvtsApprovedFundingAmountHtmlContent = `
        <tr>
          <td colspan="2" rowspan="1" class="clearfix cell money form-control-cell"><div id="vvtsFundingApprovedAmount" style="padding-bottom: 20px;">
            Total funding amount per student will be $6,000. Your clinic was approved for <b>${numberOfStudentsApprovedFieldElement?.value}</b> student(s).
          </div></td>
          <td class="cell zero-cell"></td>
        </tr>
      `;

      $('#quartech_numberofstudentscompletedconsecutivework')
        .closest('tr')
        .before(vvtsApprovedFundingAmountHtmlContent);
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

  function addFundingInformationNote() {
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

  if (programAbbreviation === 'VVTS') {
    observeIframeChanges(
      addVVTSApprovedFundingAmount,
      'quartech_numberofstudentsapproved',
      'quartech_numberofstudentsapproved'
    );
    // The following is removed as per request in TASK 4578:
    // verifyTotalSumEqualsRequestedAmount();

    // $('#quartech_totalfees').on('change keyup blur', () => {
    //   verifyTotalSumEqualsRequestedAmount();
    // });

    // $('#quartech_totalsumofreportedexpenses').on('change keyup blur', () => {
    //   verifyTotalSumEqualsRequestedAmount();
    // });
  }

  if (programAbbreviation.includes('KTTP')) {
    // addInstructions();
    addExpenseReportGrid();
    addFundingInformationNote();
    addKttpRequestedClaimAmountNote();

    verifyTotalSumEqualsRequestedAmount();

    $('#quartech_totalfees').on('change keyup blur', () => {
      verifyTotalSumEqualsRequestedAmount();
    });
  }

  if (programAbbreviation === 'NEFBA2') {
    addInstructions();
    addExpenseReportGrid();
    addFundingInformationNote();
    addRequestedClaimAmountNote();

    // The following is removed as per request in TASK 4578:
    // verifyTotalSumEqualsRequestedAmount();

    // $('#quartech_totalfees').on('change keyup blur', () => {
    //   verifyTotalSumEqualsRequestedAmount();
    // });
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
        // hideQuestion('quartech_claimcoapplicants');
        hideFieldRow({ fieldName: 'quartech_claimcoapplicants' });
      } else {
        showFieldRow('quartech_claimcoapplicants');
      }
    }

    // addRequestedClaimAmountNote();

    // Removed for TASK 5135: ABPP S2 Customization
    // addClaimAmountCaveatNote();
    // $('select[id*="quartech_interimorfinalpayment"]').on('change', function () {
    //   addClaimAmountCaveatNote();
    // });
  }

  if (programAbbreviation === 'ABPP1') {
    if (!document.querySelector('#claimInformationNote')) {
      const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
        The Program requires paid invoice(s) from the Learning Provider(s), and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />
        <br />
        The Reimbursement Amount Requested for specialized training  should be the same as your approved Learning Action Plan  and Authorization Letter.<br />
        <br />
        Reimbursement Amount Requested includes registration fees (such as training, courses, registration, tuition) GST and total.</div>`;

      $('fieldset[aria-label="Funding Information"] > legend').after(
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

      $('fieldset[aria-label="Funding Information"] > legend').after(
        claimInformationNoteHtmlContent
      );
    }

    observeChanges($('#quartech_requestedinterimpaymentamount')[0], () =>
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

        $('fieldset[aria-label="Funding Information"] > legend').after(
          claimInformationNoteHtmlContent
        );
      }
    } else if (completingCategoryElement?.value === '255550001') {
      if (!document.querySelector('#claimInformationNote')) {
        const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />
        <br />
        The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).</div>`;

        $('fieldset[aria-label="Funding Information"] > legend').after(
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
    // hideQuestion('quartech_requestedinterimpaymentamount');
    hideFieldRow({ fieldName: 'quartech_requestedinterimpaymentamount' });
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
  const programAbbreviation = getProgramAbbreviation();

  // skip verifying total sum if any of the following programs
  if (
    programAbbreviation === 'NEFBA2' ||
    programAbbreviation === 'VLB' ||
    programAbbreviation === 'VVTS' ||
    programAbbreviation.includes('KTTP')
  ) {
    return;
  }

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

  const expenseReportTableElement = renderCustomComponent({
    fieldId: 'quartech_eligibleexpenses',
    customElementTag: 'expense-report-table',
    attributes: {
      primary: true,
      columns: JSON.stringify(columns),
      rows: JSON.stringify(rows),
    },
    customEvent: 'onChangeExpenseReportData',
    customEventHandler: (event, customElement) => {
      logger.info({
        fn: customizeClaimInfoStep,
        message: 'onChangeExpenseReportData event listener triggered',
        data: { event, customElement },
      });
      // @ts-ignore
      rows = JSON.parse(event.detail.value);
      customElement.setAttribute('rows', JSON.stringify(rows));
      // @ts-ignore
      setFieldValue({
        name: 'quartech_eligibleexpenses',
        value: JSON.stringify(filterEmptyRows(rows)),
      });
      // @ts-ignore
      setFieldValue({
        name: 'quartech_totalsumofreportedexpenses',
        value: event.detail.total,
      });
      verifyTotalSumEqualsRequestedAmount();
    },
    mappedValueKey: 'rows',
    initFn: (existingEligibleExpenses) => {
      // @ts-ignore
      setFieldValue({
        name: 'quartech_totalsumofreportedexpenses',
        value: getTotalExpenseAmount(JSON.parse(existingEligibleExpenses)),
      });
      verifyTotalSumEqualsRequestedAmount();
    },
    initValuesFn: (mappedValueKey, existingValue, customElement) => {
      if (mappedValueKey === 'rows') {
        const arr = JSON.parse(existingValue);
        if (!Array.isArray(arr)) {
          customElement.setAttribute(`${mappedValueKey}`, JSON.stringify(rows));
        }
      }
    },
  });

  logger.info({
    fn: addExpenseReportGrid,
    message: 'Successfully added expense report grid',
  });
}
