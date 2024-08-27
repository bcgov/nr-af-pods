import { NO_VALUE, YES_VALUE } from '../../common/constants.js';
import { getEnvVars } from '../../common/env.js';
import {
  addHtmlToSection,
  addTextAboveField,
  hideAllStepSections,
  hideSection,
  setFieldValue,
} from '../../common/html.js';
import { Logger } from '../../common/logger.js';
import { configureFields } from '../../common/fieldConfiguration.js';
import { setFieldReadOnly } from '../../common/fieldValidation.js';
import { validateDemographicInfoRequiredFields } from '../validation.js';
import { getProgramEmailAddress } from '../../common/program.ts';
import { saveFormData } from '../../common/saveButton.js';
import { getFormId } from '../../common/form.js';
import { getApplicationData } from '../../common/fetch.js';

const logger = Logger('application/steps/demographicInfo');

export function customizeDemographicInfoStep(programData) {
  logger.info({
    fn: customizeDemographicInfoStep,
    message: `Start customizing demographic info step, quartech_disabledchefsdemographicinfo: ${programData?.quartech_disabledchefsdemographicinfo}`,
  });
  configureFields();
  if (programData?.quartech_disabledchefsdemographicinfo) {
    addDemographicDataDescriptionOldVersionForABPP();

    addViewExampleTo_Q1a();

    initOnChange_Question1_SoleProprietorshipOrGeneralPartnership();

    initOnChange_Question2_Re_GoverningBoard();

    initOnChange_Question2b_Re_OrganizationType();

    initOnChange_Question4_DoesYourOrganizationTargetAnyGroups();

    addDemographicInfoPercentageColumnTitle();
  } else {
    // Enable Demographic Info integration with CHEFS
    showChefsIntegration();
  }
}

function addDemographicDataDescriptionOldVersionForABPP() {
  const programEmailAddress = getProgramEmailAddress();
  const html =
    '<p>The Province of British Columbia supports inclusive and increased representation of underrepresented groups. By providing the information below, you are helping to improve the delivery of programming. At this time, the questions focus on three identity groups, and do not cover all potential groups who are underrepresented in the agriculture sector. We plan to expand the focus to other underrepresented groups in future.</p>' +
    `<p>Your personal information is collected under section 26(c) and 26(e) of the Freedom of Information and Protection of Privacy Act for the purposes of evaluating applications and for the planning and evaluating of the S-CAP Ministry Program. The demographic information you provide is voluntary and will not be used to assess your eligibility for this program. Each individual understands the purposes of the collection, use, and disclosure of their demographic personal information. The information you provide will be shared with the federal government to fulfill the provincial obligations under the Sustainable Canadian Agricultural Partnership (S-CAP) bilateral agreement. It may be combined with other survey or administrative data sources and used for statistical, research and evaluation purposes. If any information is published, your responses will be combined with the responses of others so that you cannot be identified. If you have any questions about the collection of your information, please contact the program manager at <a href = "mailto: ${programEmailAddress}">${programEmailAddress}</a>.</p>` +
    '<p><span>Required Field </span><span style="color:red">*</span></p>';

  addHtmlToSection('tab_Demographic_Info', html);
}

function addViewExampleTo_Q1a() {
  let div = document.createElement('div');
  div.innerHTML = `
    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
      <div class="panel panel-default">
        <div class="panel-heading" role="tab" id="headingOne">
          <h4 class="panel-title">
          <a role="button" class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
              View Example
          </a>
          </h4>
        </div>
        <div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
          <div class="panel-body">
            <i>As an example, a company has 4 owners:
            <br/> ✍ 1 owner identifies as First Nation and a woman and owns 10% of the business.
            <br/> ✍ 1 owner identifies as a youth (40 or younger) and as Indigenous but the applicant is not aware of which specific Indigenous group this owner identifies with. This owner owns 50% of the business.
            <br/> ✍ 2 identify as non-Indigenous men over 40 and each owns 10% of the business.
            <br/> ✍ In this case, you would enter 10% for 'First Nations', 10% for 'women', 50% for 'youth', 50% for 'Indigenous - not specified', and 20% for 'none of the above groups'. The numbers could add up to more than 100% - that's fine!
            </i>
          </div>
        </div>
      </div>
    </div>
  `;

  $("[data-name='Q1a_Section']").parent().prepend(div);
}

function initOnChange_Question1_SoleProprietorshipOrGeneralPartnership() {
  var q1Control = $('#quartech_question1reownerproprietorshiporparnership');

  var selectedValue = q1Control.val();
  hideShow_for_Question1_SoleProprietorshipOrGeneralPartnership(selectedValue);

  logger.info({
    fn: initOnChange_Question1_SoleProprietorshipOrGeneralPartnership,
    message: 'initOnChangeQuestion1 called.',
  });
  q1Control.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_Question1_SoleProprietorshipOrGeneralPartnership,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_for_Question1_SoleProprietorshipOrGeneralPartnership(
      selectedValue
    );
  });
}

function hideShow_for_Question1_SoleProprietorshipOrGeneralPartnership(
  selectedValue
) {
  var cssDisplayForQ1 = 'none';
  var cssDisplayForQ2 = 'none';
  var cssDisplayForQ3 = 'none';

  if (selectedValue === YES_VALUE) {
    cssDisplayForQ1 = 'block';
    cssDisplayForQ2 = 'none';
    cssDisplayForQ3 = 'none';

    $('#quartech_question2regoverningboard').prop('selectedIndex', 0); // select blank option for the Question 2
    $('#quartech_question2breorganizationtype').prop('selectedIndex', 0); // select blank option for the Question 2b
    $('#quartech_numberofmembersofthegoverningbody').val(''); // clear the Question 2c

    $('#quartech_numberofmembersofthegoverningbody')
      .parent()
      .parent()
      .parent()
      .css('display', 'none'); // Q2c
    $("[data-name='Q2c_Section']").parent().css('display', 'none'); // 2d's questions (previously 2c)

    clearQuestion2dAnswers();

    $('.msos-selecteditems-container ul li').remove(); // Clear selected items from the Question 3
  } else if (selectedValue === NO_VALUE) {
    cssDisplayForQ1 = 'none';
    cssDisplayForQ2 = 'block';
    cssDisplayForQ3 = 'block';
    clearQuestion1abcAnswers();
  } else {
    clearQuestion1abcAnswers();

    $('#quartech_question2regoverningboard').prop('selectedIndex', 0); // select blank option for the Question 2
    $('#quartech_question2breorganizationtype').prop('selectedIndex', 0); // select blank option for the Question 2b
    $('#quartech_numberofmembersofthegoverningbody').val(''); // Clear  the Question 2c
    clearQuestion2dAnswers();

    $('#quartech_numberofmembersofthegoverningbody')
      .parent()
      .parent()
      .parent()
      .css('display', 'none');
    $("[data-name='Q2c_Section']").parent().css('display', 'none');

    $('.msos-selecteditems-container ul li').remove(); // Clear selected items from the Question 3
  }

  $("[data-name='Q1a_Section']").parent().css('display', cssDisplayForQ1);
  $("[data-name='Q1b_Q1c_Section']").parent().css('display', cssDisplayForQ1);

  $('#quartech_question2breorganizationtype')
    .parent()
    .parent()
    .parent()
    .css('display', 'none'); // Q2b
  $('#quartech_numberofmembersofthegoverningbody')
    .parent()
    .parent()
    .parent()
    .css('display', 'none'); // Q2c
  $("[data-name='Q2_Section']").parent().css('display', cssDisplayForQ2);

  $("[data-name='Q3_section']").parent().css('display', cssDisplayForQ3);

  validateDemographicInfoRequiredFields();
}

function clearQuestion1abcAnswers() {
  // Clear Answers for the Question 1a
  $('#quartech_firstnationssharepercentage').val('');
  $('#quartech_inukinuitsharepercentage').val('');
  $('#quartech_mtissharepercentage').val('');
  $('#quartech_indigenoussharepercentage').val('');
  $('#quartech_womensharepercentage').val('');
  $('#quartech_youth40orundersharepercentage').val('');
  $('#quartech_nonindiginousnonwomennonyouthshare').val('');
  $('#quartech_unabletoansweridentifysharepercentage').val('');
  $('#quartech_newagricultureentrantssharepercentage').val('');
  $('#quartech_declinetoidentifypercentageshares').prop('checked', false);

  $('#quartech_percentagesharesownedbynewentrants').val('');
  // Clear Answers for the Question 1b
  $('#quartech_commentsondemographicsofbusinessowners').val('');
  // Clear Answers for the Question 1c
}

function clearQuestion2dAnswers() {
  $('#quartech_firstnationsgoverningbodymembers').val('');
  $('#quartech_inukinuitgoverningbodymembers').val('');
  $('#quartech_mtisgoverningbodymembers').val('');
  $('#quartech_indigenousnotspecifiedgoverningbodymember').val('');
  $('#quartech_womengoverningbodymembers').val('');
  $('#quartech_youthgoverningbodymembers').val('');
  $('#quartech_nonindiginousnonwomennonyouthgovbodymbrs').val('');
  $('#quartech_question2dgoverningbodymembersunabletoanswer').val('');
  $('#quartech_declinetoidentifygoverningbodymember').prop('checked', false);
}

function initOnChange_Question2_Re_GoverningBoard() {
  var q2Control = $('#quartech_question2regoverningboard');

  var selectedValue = q2Control.val();
  hideShow_for_Question2_Re_GoverningBoard(selectedValue);

  logger.info({
    fn: initOnChange_Question2_Re_GoverningBoard,
    message: 'initOnChange_Question2_Re_GoverningBoard called.',
  });
  q2Control.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_Question2_Re_GoverningBoard,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_for_Question2_Re_GoverningBoard(selectedValue);
  });
}

function hideShow_for_Question2_Re_GoverningBoard(selectedValue) {
  var cssDisplayForQ2bQ2c = 'none';

  if (selectedValue === YES_VALUE) {
    cssDisplayForQ2bQ2c = 'table-row';
  } else {
    $('#quartech_question2breorganizationtype').prop('selectedIndex', 0); // select blank option for the Question 2b
    $('#quartech_numberofmembersofthegoverningbody').val(''); // clear the Question 2c

    clearQuestion2dAnswers();
  }

  $('#quartech_question2breorganizationtype')
    .parent()
    .parent()
    .parent()
    .css('display', cssDisplayForQ2bQ2c);

  $('#quartech_numberofmembersofthegoverningbody')
    .parent()
    .parent()
    .parent()
    .css('display', 'none');
  $("[data-name='Q2c_Section']").parent().css('display', 'none');

  validateDemographicInfoRequiredFields();
}

function initOnChange_Question2b_Re_OrganizationType() {
  var q2bControl = $('#quartech_question2breorganizationtype');

  var selectedValue = q2bControl.val();
  hideShow_for_Question2b_Re_OrganizationType(selectedValue);

  logger.info({
    fn: initOnChange_Question2b_Re_OrganizationType,
    message: 'initOnChange_Question2b_Re_OrganizationType called.',
  });
  q2bControl.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_Question2b_Re_OrganizationType,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_for_Question2b_Re_OrganizationType(selectedValue);
  });
}

function hideShow_for_Question2b_Re_OrganizationType(selectedValue) {
  var cssDisplayForQ2c = 'none';
  var cssDisplayForQ2d = 'none';

  if (selectedValue === NO_VALUE) {
    cssDisplayForQ2d = 'block';
    cssDisplayForQ2c = 'table-row';
  } else {
    clearQuestion2dAnswers();
  }

  $('#quartech_numberofmembersofthegoverningbody')
    .parent()
    .parent()
    .parent()
    .css('display', cssDisplayForQ2c);
  $("[data-name='Q2c_Section']").parent().css('display', cssDisplayForQ2d);

  validateDemographicInfoRequiredFields();
}

function initOnChange_Question4_DoesYourOrganizationTargetAnyGroups() {
  // Scenarios
  // 1: When user selects "None of the above", deselect all other options, only adding "None of the above" option
  // 2: When user selects ANY other option, if "None of the above" is checked, uncheck it
  const fieldName =
    '#quartech_doesyourorganizationtargetanyofthegroups_Container';
  const allListItemOptions = $(fieldName).find('.msos-option');
  const allCheckboxes = $(fieldName).find('li>>input.msos-checkbox');

  // find "None of the above" list item and add a click handler
  const noneOfTheAboveListItemOption = allListItemOptions.filter((item) =>
    allListItemOptions[item].innerText.includes('None')
  )?.[0];
  $(noneOfTheAboveListItemOption).on('click', function () {
    const checkedItemsThatAreNotNoneOfTheAbove = allCheckboxes.filter(
      (item) =>
        // @ts-ignore
        allCheckboxes[item].checked &&
        !allCheckboxes[item].ariaLabel.includes('None')
    );
    if (checkedItemsThatAreNotNoneOfTheAbove.length > 0) {
      checkedItemsThatAreNotNoneOfTheAbove.trigger('change', false);
    }
  });

  // find all other option elements and add a handler to remove "None of the above" if it selected
  const allOtherListItemOptions = allListItemOptions.filter(
    (item) => !allListItemOptions[item].innerText.includes('None')
  );
  $(allOtherListItemOptions).on('click', function () {
    const checkedNoneOfTheAbove = allCheckboxes.filter(
      (item) =>
        // @ts-ignore
        allCheckboxes[item].checked &&
        allCheckboxes[item].ariaLabel.includes('None')
    );
    if (checkedNoneOfTheAbove.length > 0) {
      checkedNoneOfTheAbove.trigger('change', false);
    }
  });
}

function addDemographicInfoPercentageColumnTitle() {
  // Add "Percentage of business shares owned" column title
  $(
    '#EntityFormView > div.tab.clearfix > div > div > fieldset:nth-child(3) > table > tbody'
  ).prepend(
    '<tr><td colspan="1" rowspan="1" class="clearfix cell decimal form-control-cell"><div class="info"><label for="quartech_firstnationssharepercentage" id="quartech_firstnationssharepercentage_label" class="field-label"></label><div class="validators"><span id="FloatValidatorquartech_firstnationssharepercentage" style="visibility:hidden;">*</span><span id="RangeValidatorquartech_firstnationssharepercentage" style="visibility:hidden;">*</span></div></div><div class="control" style="width: 25% !important">Percentage of business shares owned</div></td><td class="cell zero-cell"></td></tr>'
  );
}

function showChefsIntegration() {
  addDemographicDataDescription();

  // hideAllStepSections();
  // $("[data-name='DemographicInfoChefsSubmissionSection']")
  //   .parent()
  //   .css('display', 'block');

  addDemographicInfoChefsIframe();
}

function addDemographicDataDescription() {
  const html = `<h3>Demographic Data Collection</h3>
    <p>The Province of British Columbia supports inclusive and increased representation of underrepresented groups. By participating in the survey below, you are helping to improve the delivery of programming. At this time, the questions focus on three identity groups (Indigenous, women and youth), and do not cover all potential groups who are underrepresented in the agriculture sector. We plan to expand the focus to other underrepresented groups in future.</p>
    <p>The survey is conducted independently of the funding program to which you are applying, and your survey responses will not be included in your funding application. If you wish to save a copy of your survey responses, you will have the option of emailing it to yourself upon completion. Please see the top of the survey form for instructions on how to receive a copy by email.</p>`;

  addHtmlToSection('tab_Demographic_Info', html);
}

async function addDemographicInfoChefsIframe() {
  $('#quartech_chefssubmissionid')?.closest('tr')?.css({ display: 'none' });

  // setFieldReadOnly('quartech_chefsid');

  let chefsIdElement = document.getElementById('quartech_chefsid');
  if (chefsIdElement)
    chefsIdElement.style.setProperty(
      'background-color',
      '#fff3cd',
      'important'
    );
  // chefsIdElement.style.fontWeight = 'bold';

  const chefsSubmissionGuid = $('#quartech_chefssubmissionid')?.val();

  // Shorthand ID result for Staff
  const chefsSubmissionId = $('#quartech_chefsid')?.val();

  if (chefsSubmissionGuid || chefsSubmissionId) {
    // Logic has since changed, if there's an ID present, we don't need to do anything.
    // chefsUrl = `https://submit.digital.gov.bc.ca/app/form/success?s=${chefsSubmissionGuid}`;

    logger.info({
      fn: addDemographicInfoChefsIframe,
      message: `Demographic info survey has already been completed, chefsSubmissionGuid: ${chefsSubmissionGuid}, chefsSubmissionId: ${chefsSubmissionId}`,
    });
    return;
  }

  let chefsUrl = '';

  if (chefsSubmissionGuid) {
    chefsUrl = `https://submit.digital.gov.bc.ca/app/form/success?s=${chefsSubmissionGuid}`;
  } else {
    const {
      quartech_ChefsDemographicDataFormId: chefsDemographicDataFormId,
      quartech_ChefsDemographicDataIndividualsFormId:
        chefsDemographicDataIndividualsFormId,
    } = await getEnvVars();

    const formId = getFormId();

    const applicationDataRes = await getApplicationData({ id: formId });

    if (!applicationDataRes?.data?.value?.[0]) {
      logger.error({
        fn: addDemographicInfoChefsIframe,
        message: `Could not get application data result to determine whether individual or business`,
      });
    }

    const { quartech_nocragstnumber } = applicationDataRes?.data?.value?.[0];

    // If no CRA number then it's an individual
    if (quartech_nocragstnumber) {
      if (!chefsDemographicDataIndividualsFormId) {
        logger.error({
          fn: addDemographicInfoChefsIframe,
          message: `Bad config: Env Vars should contain the quartech_ChefsDemographicDataFormId element`,
        });
      }
      chefsUrl = `https://submit.digital.gov.bc.ca/app/form/submit?f=${chefsDemographicDataIndividualsFormId}`;
    } else {
      // Otherwise it's a business
      if (!chefsDemographicDataFormId) {
        logger.error({
          fn: addDemographicInfoChefsIframe,
          message: `Bad config: Env Vars should contain the quartech_ChefsDemographicDataFormId element`,
        });
      }
      chefsUrl = `https://submit.digital.gov.bc.ca/app/form/submit?f=${chefsDemographicDataFormId}`;
    }

    window.addEventListener('message', function (event) {
      if (event.origin != 'https://submit.digital.gov.bc.ca') {
        return;
      }
      const containSubmissionId = event.data.indexOf('submissionId') > -1;

      if (!containSubmissionId) return;

      const submissionPayload = JSON.parse(event.data);

      const chefsSubmissionGuidResult = submissionPayload.submissionId;

      logger.info({
        fn: addDemographicInfoChefsIframe,
        message:
          'received chefsSubmissionGuidResult: ' + chefsSubmissionGuidResult,
      });

      const chefsSubmissionId = chefsSubmissionGuidResult
        .substring(0, 8)
        .toUpperCase();

      if (!chefsSubmissionId || !chefsSubmissionGuidResult) {
        logger.error({
          fn: addDemographicInfoChefsIframe,
          message: `Failed to get chefsSubmissionId`,
        });
        return;
      }

      setFieldValue({ name: 'quartech_chefsid', value: chefsSubmissionId });
      setFieldValue({
        name: 'quartech_chefssubmissionid',
        value: chefsSubmissionGuidResult,
      });

      if (chefsSubmissionGuidResult) {
        saveFormData({
          customPayload: {
            quartech_chefsid: chefsSubmissionId,
            quartech_chefssubmissionid: chefsSubmissionGuidResult,
          },
        });
      }
    });
  }

  const html = `<iframe id='chefsDemographicInfoIframe' src="${chefsUrl}" height="800" width="100%" title="Demographic Info in CHEFS">
      </iframe><br/>`;

  addTextAboveField('quartech_chefsid', html);
}
