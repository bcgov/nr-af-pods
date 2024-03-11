import { CURRENCY_FORMAT } from '../../common/currency.js';
import { addTextAboveField, combineElementsIntoOneRow, showOrHideAndReturnValue } from '../../common/html.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { setStepRequiredFields } from '../../common/setRequired.js';

export function customizeDeliverablesBudgetStep() {
  const programAbbreviation = getProgramAbbreviation();

  setStepRequiredFields('DeliverablesBudgetStep');

  // START ALL PROGRAMS/STREAMS CUSTOMIZATION
  const deliverablesBudgetTabTitleElement = document.querySelector(
    '#EntityFormView > h2'
  );
  if (
    deliverablesBudgetTabTitleElement &&
    deliverablesBudgetTabTitleElement.textContent.includes(
      'Deliverables & Budget'
    )
  ) {
    $(deliverablesBudgetTabTitleElement).css('display', 'none');
  }
  // END ALL PROGRAMS/STREAMS CUSTOMIZATION

  // START KTTP PROGRAMS/STREAMS CUSTOMIZATION
  if (programAbbreviation && programAbbreviation.includes('KTTP')) {
    customizeEstimatedActivityBudgetStepForKTTP();

    setOnKeypressBudgetInput('quartech_smefee');
    setOnKeypressBudgetInput('quartech_smetravelairfareparkingetc');
    setOnKeypressBudgetInput('quartech_smeaccommodation');
    setOnKeypressBudgetInput('quartech_facilityequipmenttechnologyrental');
    setOnKeypressBudgetInput('quartech_advertisingcommunications');
    setOnKeypressBudgetInput('quartech_administrationcosts');
    setOnKeypressBudgetInput('quartech_othercost');
    setOnKeypressBudgetInput(
      'quartech_costsharecontributioncashorinkinddonation'
    );

    const deliverablesBudgetSectionElement = document.querySelector(
      '#EntityFormView > div.tab.clearfix > div > div > fieldset:nth-child(1) > legend > h3'
    );
    if (
      deliverablesBudgetSectionElement.textContent.includes(
        'Deliverables & Budget'
      )
    ) {
      deliverablesBudgetSectionElement.textContent =
        'Estimated Activity Budget';
    }

    // SET read-only: Total Activity Cost
    $('#quartech_estimatedbudgettotalactivitycost').prop('readonly', true);
    $('#quartech_estimatedbudgettotalactivitycost').off('change');
    $('#quartech_estimatedbudgettotalactivitycost').off('input');
    $('#quartech_estimatedbudgettotalactivitycost').off('keypress');
    $('#quartech_estimatedbudgettotalactivitycost').attr(
      'style',
      'background-color: #eee !important'
    );

    // text to add below Cost-Share Contribution (cash or in-kind donation)
    if (!document.querySelector('#costShareContributionNote')) {
      let htmlContentToAddBelowCostShareContribution = `<div id="costShareContributionNote" style="padding-bottom: 50px;">
      All applicants are expected to provide a minimal cost-shared amount of 25% for ELIGIBLE EXPENSES ONLY. Cash and in-kind can include the organization's own contributions and/or contributions from other sponsoring partners. The Province reserves the right to waive the cost-shared requirement for groups who may face barriers to the program including groups supporting or run by underserved populations. Please provide the total dollar amount (including in-kind). You will be asked to show the contribution when submitting reimbursement request. A list of eligible and ineligible expenses are provided in the Program Guide.
      </div>`;
      addTextAboveField(
        'quartech_totalfundingrequiredfromtheprogram',
        htmlContentToAddBelowCostShareContribution
      );
    }

    // SET read-only: Total Funding Required From The Program
    $('#quartech_totalfundingrequiredfromtheprogram').prop('readonly', true);
    $('#quartech_totalfundingrequiredfromtheprogram').off('change');
    $('#quartech_totalfundingrequiredfromtheprogram').off('input');
    $('#quartech_totalfundingrequiredfromtheprogram').off('keypress');
    $('#quartech_totalfundingrequiredfromtheprogram').attr(
      'style',
      'background-color: #eee !important'
    );
  }
  // END KTTP PROGRAMS/STREAMS CUSTOMIZATION

  setStepRequiredFields('DeliverablesBudgetStep');
}

function setOnKeypressBudgetInput(elementId) {
  $(`#${elementId}`).on('change keyup blur', function () {
    calculateEstimatedActivityBudget();
  });
}

function customizeEstimatedActivityBudgetStepForKTTP() {
  addEstimatedActivityBudgetDescription();
  setupEstimatedActivityBudget();
  calculateEstimatedActivityBudget();
}

function addEstimatedActivityBudgetDescription() {
  let div = document.createElement('div');
  div.innerHTML =
    '<p>Please provide an estimated budget</p>' +
    '<p><b><i>A detailed itemized list of expenses, invoice, event report, and reimbursement form must be submitted within 30 days post-activity. All invoices for eligible activity costs incurred and proof of payment of goods and receipts should be kept for seven years as there is a chance you may be audited.</i></b></p>' +
    '<p><span style="color:red">*</span> <span>required field</span></p>';

  $("[data-name='tab_Estimated_Activity_Budget']").parent().prepend(div);
}

function initialDeliverablesBudgetSingleRowSetup() {
  const tableElement = $(
    'table[data-name="deliverablesBudgetSection"]'
  );

  // find and delete colgroup config
  tableElement.find('colgroup').remove();

  tableElement.find('tbody > tr > td[colspan="1"]').each(function () {
    $(this).attr('colspan', '2');
  });
}

function setupEstimatedActivityBudget() {
  // setup table config to support single row
  initialDeliverablesBudgetSingleRowSetup();

  // SME Travel (airfare, parking, etc)
  const travelValueElementId = 'quartech_smetravelairfareparkingetc';
  const travelDescriptionElementId =
    'quartech_pleasedescribemodeoftravelifapplicable';

  combineElementsIntoOneRow(travelValueElementId, travelDescriptionElementId);

  // SME Accommodation
  const accommodationValueElementId = 'quartech_smeaccommodation';
  const accommodationDescriptionElementId =
    'quartech_pleasedescribeaccommodationwherewillthesme';

  combineElementsIntoOneRow(
    accommodationValueElementId,
    accommodationDescriptionElementId
  );

  // Facility, Equipment, Technology Rental
  const rentalValueElementId = 'quartech_facilityequipmenttechnologyrental';
  const rentalDescriptionElementId =
    'quartech_pleasedescribeequipmentrequiredifapplicable';

  combineElementsIntoOneRow(rentalValueElementId, rentalDescriptionElementId);

  // Advertising/Communications
  const advertisingValueElementId = 'quartech_advertisingcommunications';
  const advertisingDescriptionElementId =
    'quartech_pleasedescribewhatformsofadvertisingcommunic';

  combineElementsIntoOneRow(
    advertisingValueElementId,
    advertisingDescriptionElementId
  );

  // Administration Costs
  const administrationValueElementId = 'quartech_administrationcosts';
  const administrationDescriptionElementId =
    'quartech_pleasedescribetheadministrativecoststobeinc';

  combineElementsIntoOneRow(
    administrationValueElementId,
    administrationDescriptionElementId
  );

  // Other Costs
  const otherValueElementId = 'quartech_othercost';
  const otherDescriptionElementId = 'quartech_pleaseexplainotherifapplicable';

  combineElementsIntoOneRow(otherValueElementId, otherDescriptionElementId);

  // Cost-Share Contribution (cash or in-kind donation)
  const costShareValueElementId =
    'quartech_costsharecontributioncashorinkinddonation';
  const costShareDescriptionElementId =
    'quartech_pleaseexplainwhotheotherpartnersareandwha';

  combineElementsIntoOneRow(
    costShareValueElementId,
    costShareDescriptionElementId
  );
}

export function calculateEstimatedActivityBudget() {
  // @ts-ignore
  let fee = parseFloat($('#quartech_smefee').val().replace(/,/g, ''));
  if (isNaN(fee)) fee = 0.0;

  // SME Travel (airfare, parking, etc)
  const travelValueElementId = 'quartech_smetravelairfareparkingetc';
  const travelDescriptionElementId =
    'quartech_pleasedescribemodeoftravelifapplicable';

  const travel = showOrHideAndReturnValue(
    travelValueElementId,
    travelDescriptionElementId
  );

  // SME Accommodation
  const accommodationValueElementId = 'quartech_smeaccommodation';
  const accommodationDescriptionElementId =
    'quartech_pleasedescribeaccommodationwherewillthesme';

  const accommodation = showOrHideAndReturnValue(
    accommodationValueElementId,
    accommodationDescriptionElementId
  );

  // Facility, Equipment, Technology Rental
  const rentalValueElementId = 'quartech_facilityequipmenttechnologyrental';
  const rentalDescriptionElementId =
    'quartech_pleasedescribeequipmentrequiredifapplicable';

  const rental = showOrHideAndReturnValue(
    rentalValueElementId,
    rentalDescriptionElementId
  );

  // Advertising/Communications
  const advertisingValueElementId = 'quartech_advertisingcommunications';
  const advertisingDescriptionElementId =
    'quartech_pleasedescribewhatformsofadvertisingcommunic';

  const advertising = showOrHideAndReturnValue(
    advertisingValueElementId,
    advertisingDescriptionElementId
  );

  // Administration Costs
  const administrationValueElementId = 'quartech_administrationcosts';
  const administrationDescriptionElementId =
    'quartech_pleasedescribetheadministrativecoststobeinc';

  const administration = showOrHideAndReturnValue(
    administrationValueElementId,
    administrationDescriptionElementId
  );

  // Other Costs
  const otherValueElementId = 'quartech_othercost';
  const otherDescriptionElementId = 'quartech_pleaseexplainotherifapplicable';

  const otherCosts = showOrHideAndReturnValue(
    otherValueElementId,
    otherDescriptionElementId
  );

  // Cost-Share Contribution (cash or in-kind donation)
  const costShareValueElementId =
    'quartech_costsharecontributioncashorinkinddonation';
  const costShareDescriptionElementId =
    'quartech_pleaseexplainwhotheotherpartnersareandwha';

  const costShareContribution = showOrHideAndReturnValue(
    costShareValueElementId,
    costShareDescriptionElementId
  );

  // Calculate total
  let totalActivityCost =
    fee +
    travel +
    accommodation +
    rental +
    advertising +
    administration +
    otherCosts;
  let totalFundingRequired = totalActivityCost - costShareContribution;

  let totalActivityCostWithCurrencyFormat =
    CURRENCY_FORMAT.format(totalActivityCost);
  $('#quartech_estimatedbudgettotalactivitycost').val(
    totalActivityCostWithCurrencyFormat.replace('CA$', '')
  );

  let totalFundingRequiredWithCurrencyFormat =
    CURRENCY_FORMAT.format(totalFundingRequired);
  $('#quartech_totalfundingrequiredfromtheprogram').val(
    totalFundingRequiredWithCurrencyFormat.replace('CA$', '')
  );
}
