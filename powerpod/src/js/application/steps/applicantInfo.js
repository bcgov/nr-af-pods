import { getGlobalConfigData } from '../../common/config.js';
import { YES_VALUE } from '../../common/constants.js';
import {
  getOrgbookAutocompleteData,
  getOrgbookTopicData,
} from '../../common/fetch.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldConditionalLogic.js';
import { addTextAboveField, addTextBelowField } from '../../common/html.js';
import { Logger } from '../../common/logger.js';
import { initInputMasking } from '../../common/masking.js';
import {
  getProgramAbbreviation,
  getProgramData,
} from '../../common/program.ts';
import { useScript } from '../../common/scripts.js';
import { configureFields } from '../../common/fieldConfiguration.js';
import {
  validateEmailAddressField,
  validateStepFields,
} from '../../common/fieldValidation.js';

const logger = Logger('application/steps/applicantInfo');

export function customizeApplicantInfoStep() {
  setupApplicantInfoStepFields();

  initOnChange_PreviouslyReceivedKttpFunding();

  initOnChange_OrganizationReceivedFundingFromBC();

  initOnChange_IsCollaboratingWithOtherOrganizationQuestion();

  initOnChange_ActivityOverMultipleDays();

  initOnChange_AdaptedEventForAdultLearning();

  handleApplicantWithAndWithoutCRA_GST();

  initOrgNameAutocomplete();

  customizeTypesOfBusinessOrganization();

  if (getProgramAbbreviation().includes('ABPP')) {
    customizeApplicantInfoStepForABPP();
  }

  if (getProgramAbbreviation() === 'NEFBA') {
    customizeApplicantInfoStepForNEFBA();
  }
}

function initOnChange_PreviouslyReceivedKttpFunding() {
  var selectOptionControl = $(
    '#quartech_hasthisorganizationreceivedkttpfundingin'
  );

  var selectedValue = selectOptionControl.val();
  hideShow_for_PreviouslyReceivedKttpFunding(selectedValue);

  logger.info({
    fn: initOnChange_PreviouslyReceivedKttpFunding,
    message: 'initOnChange_PreviouslyReceivedKttpFunding called.',
  });
  selectOptionControl.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_PreviouslyReceivedKttpFunding,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_for_PreviouslyReceivedKttpFunding(selectedValue);
  });
}

function hideShow_for_PreviouslyReceivedKttpFunding(selectedValue) {
  var cssDisplay = 'none';
  if (selectedValue === YES_VALUE) {
    cssDisplay = 'table-row';
  }

  var explainForPreviouslyReceivedKttpFunding_TrContainer = $(
    '#quartech_ifyespleaseexplainwhenandforwhichactivity'
  )
    .parent()
    .parent()
    .parent();
  explainForPreviouslyReceivedKttpFunding_TrContainer.css(
    'display',
    cssDisplay
  );
}

function initOnChange_OrganizationReceivedFundingFromBC() {
  var organizationReceivedFundingFromBC_SelectCtr = $(
    '#quartech_hasthisorganizationreceivedfundingfrmother'
  );

  var selectedValue = organizationReceivedFundingFromBC_SelectCtr.val();
  hideShow_for_OrganizationReceivedFundingFromBC(selectedValue);

  logger.info({
    fn: initOnChange_OrganizationReceivedFundingFromBC,
    message: 'initOnChange_OrganizationReceivedFundingFromBC called.',
  });
  organizationReceivedFundingFromBC_SelectCtr.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_OrganizationReceivedFundingFromBC,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_for_OrganizationReceivedFundingFromBC(selectedValue);
  });
}

function hideShow_for_OrganizationReceivedFundingFromBC(selectedValue) {
  var cssDisplay = 'none';

  if (selectedValue === YES_VALUE) {
    cssDisplay = 'table-row';
  }

  var collaboratingOrganizationName_TrContainer = $(
    '#quartech_ifyespleaseexplainwhenandfromwhichprogram'
  )
    .parent()
    .parent()
    .parent();
  collaboratingOrganizationName_TrContainer.css('display', cssDisplay);
}

function initOnChange_IsCollaboratingWithOtherOrganizationQuestion() {
  var collaboratingWithOtherOrgsControl = $(
    '#quartech_areyoucollaboratingwithanyotherorg'
  );

  var selectedValue = collaboratingWithOtherOrgsControl.val();
  hideShow_for_CollaboratingWithOtherOrgsControl(selectedValue);

  logger.info({
    fn: initOnChange_IsCollaboratingWithOtherOrganizationQuestion,
    message:
      'initOnChange_IsCollaboratingWithOtherOrganizationQuestion called.',
  });
  collaboratingWithOtherOrgsControl.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_IsCollaboratingWithOtherOrganizationQuestion,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_for_CollaboratingWithOtherOrgsControl(selectedValue);
  });
}

function hideShow_for_CollaboratingWithOtherOrgsControl(selectedValue) {
  var cssDisplay = 'none';

  if (selectedValue === YES_VALUE) {
    cssDisplay = 'table-row';
  }

  var collaboratingOrganizationName_TrContainer = $(
    '#quartech_ifyespleaseprovidelegalbusinessorganization'
  )
    .parent()
    .parent()
    .parent();
  collaboratingOrganizationName_TrContainer.css('display', cssDisplay);

  var collaboratingOrganizationContactName_TrContainer = $(
    '#quartech_ifyespleaseprovideacontactname'
  )
    .parent()
    .parent()
    .parent();
  collaboratingOrganizationContactName_TrContainer.css('display', cssDisplay);

  var collaboratingOrganizationBackground_TrContainer = $(
    '#quartech_ifyespleaseprovideabriefbackgroundoutlinin'
  )
    .parent()
    .parent()
    .parent();
  collaboratingOrganizationBackground_TrContainer.css('display', cssDisplay);
}

function initOnChange_ActivityOverMultipleDays() {
  var selectOptionControl = $(
    '#quartech_doestheactivitytakeplaceovermultipleday'
  );
  var selectedValue = selectOptionControl.val();
  hideShow_for_ActivityOverMultipleDays(selectedValue);
  logger.info({
    fn: initOnChange_ActivityOverMultipleDays,
    message: 'initOnChange_ActivityOverMultipleDays called.',
  });
  selectOptionControl.on('change', function () {
    var selectedValue = $(this).val();
    logger.info({
      fn: initOnChange_ActivityOverMultipleDays,
      message: `Selected Value: ${selectedValue}`,
    });
    hideShow_for_ActivityOverMultipleDays(selectedValue);
  });
}

function hideShow_for_ActivityOverMultipleDays(selectedValue) {
  var cssDisplay = 'none';
  if (selectedValue === YES_VALUE) {
    cssDisplay = 'table-row';
  } else {
    $('#quartech_ifyespleaseprovidetheadditionaldates').val('');
  }
  var additionalDates_TrContainer = $(
    '#quartech_ifyespleaseprovidetheadditionaldates'
  )
    .parent()
    .parent()
    .parent();
  additionalDates_TrContainer.css('display', cssDisplay);
}

function initOnChange_AdaptedEventForAdultLearning() {
  var selectOptionControl = $(
    '#quartech_theprocessoflearningandprocessingknowledge'
  );
  var selectedValue = selectOptionControl.val();
  hideShow_for_AdaptedEventForAdultLearning(selectedValue);
  logger.info({
    fn: initOnChange_AdaptedEventForAdultLearning,
    message: 'initOnChange_AdaptedEventForAdultLearning called.',
  });
  selectOptionControl.on('change', function () {
    var selectedValue = $(this).val();
    logger.info({
      fn: initOnChange_AdaptedEventForAdultLearning,
      message: `Selected Value: ${selectedValue}`,
    });
    hideShow_for_AdaptedEventForAdultLearning(selectedValue);
  });
}

function hideShow_for_AdaptedEventForAdultLearning(selectedValue) {
  var cssDisplay = 'none';
  if (selectedValue === YES_VALUE) {
    cssDisplay = 'table-row';
  } else {
    $('#quartech_ifyespleasedescribehowtheproposedactivitie').val('');
  }
  var describeProposedActivitiesForAdultLearning_TrContainer = $(
    '#quartech_ifyespleasedescribehowtheproposedactivitie'
  )
    .parent()
    .parent()
    .parent();
  describeProposedActivitiesForAdultLearning_TrContainer.css(
    'display',
    cssDisplay
  );
}

function handleApplicantWithAndWithoutCRA_GST() {
  let isApplicantWithoutCraOrGstNumber = $('#quartech_nocragstnumber').prop(
    'checked'
  );
  showHideForApplicantWithAndWithoutCRA_GST(isApplicantWithoutCraOrGstNumber);

  $('#quartech_nocragstnumber').on('change', function () {
    let isApplicantWithoutCraOrGstNumber = $(this).prop('checked');
    showHideForApplicantWithAndWithoutCRA_GST(isApplicantWithoutCraOrGstNumber);
  });
}

function showHideForApplicantWithAndWithoutCRA_GST(
  isApplicantWithoutCraOrGstNumber
) {
  const craGstNumberInputCtr = $('#quartech_businessregistrationnumber');
  const craGstNumberInputCtrTrRow = craGstNumberInputCtr
    .parent()
    .parent()
    .parent();

  const reasonWithoutCraOrGstTextAreaCtr = $(
    '#quartech_reasonwhynocraorgstnumber'
  );
  const reasonWithoutCraOrGstTextAreaCtrTrRow = reasonWithoutCraOrGstTextAreaCtr
    .parent()
    .parent()
    .parent();

  if (isApplicantWithoutCraOrGstNumber) {
    craGstNumberInputCtr.val(''); // clear CRA or GST number field
    craGstNumberInputCtrTrRow.css('display', 'none');

    reasonWithoutCraOrGstTextAreaCtrTrRow.css('display', 'table-row');
  } else {
    reasonWithoutCraOrGstTextAreaCtr.val(''); // clear Reason WHY without CRA or GST number field
    reasonWithoutCraOrGstTextAreaCtrTrRow.css('display', 'none');

    craGstNumberInputCtrTrRow.css('display', 'table-row');
  }

  validateStepFields('ApplicantInfoStep');
}

function initOrgNameAutocomplete() {
  const legalBusinessOrgNameElement = document.querySelector(
    '#quartech_legalbusinessororganizationname'
  );
  if (!legalBusinessOrgNameElement) return;

  useScript('jqueryui', () => {
    // @ts-ignore
    $(legalBusinessOrgNameElement).autocomplete({
      source: function (request, response) {
        getOrgbookAutocompleteData({
          searchStr: request.term,
          onSuccess: (data) => {
            var results = data.total ? data.results : [];
            response(results);
          },
        });
      },
      minLength: 2,
      select: function (event, ui) {
        let isApplicantWithoutCraOrGstNumber = $(
          '#quartech_nocragstnumber'
        ).prop('checked');
        if (!isApplicantWithoutCraOrGstNumber) getTopic(ui.item);
      },
    });
  });
}

function getTopic(selected) {
  $.ajax({
    url: 'https://orgbook.gov.bc.ca/api/v4/search/topic',
    data: {
      q: selected.topic_source_id,
    },
  })
    .done(function (response) {
      var topic =
        response.total &&
        response.results.find(function (_topic) {
          return _topic.source_id === selected.topic_source_id;
        });
      getTopicCredentials(topic || null);
    })
    .fail(function (e) {
      logger.error({ fn: getTopic, message: 'Unable to get topic', data: e });
    });
}

function getTopicCredentials(topic) {
  if (!(topic && topic.id)) return;
  $.ajax({
    url:
      'https://orgbook.gov.bc.ca/api/v4/topic/' + topic.id + '/credential-set',
  })
    .done(function (response) {
      var latestValidCredentials =
        response &&
        response.length &&
        response
          .reduce(function (_latest, _set) {
            return _latest.concat(
              _set.credentials.filter(function (credential) {
                return credential.id === _set.latest_credential_id;
              })
            );
          }, [])
          .filter(function (credential) {
            return !credential.revoked;
          });

      updateBusinessNumberField(topic, latestValidCredentials);
    })
    .fail(function (e) {
      logger.error({
        fn: getTopicCredentials,
        message: 'Unable to get topic credentials',
        data: e,
      });
    });
}

function updateBusinessNumberField(topic, credentials) {
  var bnCred = credentials.find(function (credential) {
    return (
      credential.credential_type.description === 'business_number.registries.ca'
    );
  });

  const orgBNInput = document.querySelector(
    '#quartech_businessregistrationnumber'
  );

  if (!orgBNInput || !bnCred) return;

  const bnAttr = bnCred.attributes.find(function (attribute) {
    return attribute.type === 'business_number';
  });
  // @ts-ignore
  orgBNInput.value = (bnAttr && bnAttr.value) || '';

  $(orgBNInput).trigger('change');
}

function setupApplicantInfoStepFields() {
  configureFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation && programAbbreviation === 'NEFBA') {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_fillingfarmingincomeontaxreturn',
      requiredFieldTag: 'quartech_firstyearclaimedfarmingincome',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550000',
      dependentOnElementTag: 'quartech_fillingfarmingincomeontaxreturn',
      requiredFieldTag: 'quartech_firstyearfarmoperationgeneratingrevenue',
    });
  }

  if (programAbbreviation && programAbbreviation.includes('ABPP')) {
    if (!document.querySelector('#tipReportNotice')) {
      let htmlContentToAddBelowTipReport = `<div id="tipReportNotice" style="padding-top: 50px;">
      The TIP report is a free, simplified cash-basis farm financial analysis, which provides you with a cost of production (COP) report to compare your own farm’s current year (income and expenses) to your previous 5-year average and to benchmarks with other farms of similar type and income range: <a style="color:blue" href="https://www2.gov.bc.ca/gov/content/industry/agriculture-seafood/business-market-development/agrifood-business-management/running-a-farm-business/towards-increased-profits-report">Towards Increased Profits (TIP) report - Province of British Columbia (gov.bc.ca)​</a>.
      </div>`;
      addTextBelowField(
        'quartech_tipreportenrolled',
        htmlContentToAddBelowTipReport
      );
    }

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_agriprogramsubscriber',
      requiredFieldTag: 'quartech_tipreportenrolled',
      customFunc: setShowOrHideTipNotice,
    });

    setShowOrHideTipNotice();
  }

  if (
    programAbbreviation &&
    (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA')
  ) {
    addTextAboveField(
      'quartech_indigenousapplicant',
      '<div>The Province is committed to supporting the success of Indigenous businesses in the agriculture and food sector. We understand that Indigenous businesses may have distinct characteristics reflecting regulatory, operational, cultural, and other factors. We aim for flexibility in our program delivery to reduce barriers and ensure the accessibility of our programs. If you are interested in applying to the Program but have questions about the application process or eligibility criteria, please contact Program staff at Agribusiness@gov.bc.ca<br /><br /></div>'
    );
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_recipienttype',
      requiredFieldTag: 'quartech_commodity',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_recipienttype',
      requiredFieldTag: 'quartech_othercommoditiesproducedharvested',
      disableRequiredProp: true,
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550002',
      dependentOnElementTag: 'quartech_recipienttype',
      requiredFieldTag: 'quartech_primarilyprocess',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550002',
      dependentOnElementTag: 'quartech_recipienttype',
      requiredFieldTag: 'quartech_otherproductsprocessed',
      disableRequiredProp: true,
    });
  }

  // Reset "What is your primary production?" value when "Type of Business / Organization" is changed
  $('#quartech_recipienttype').on('change', function () {
    $('#quartech_commodity_name').val('');
    $('#quartech_primarilyprocess_name').val('');
    $(
      '#quartech_othercommoditiesproducedharvested_i .msos-selecteditems-container ul li'
    ).remove();
    $(
      '#quartech_otherproductsprocessed_i .msos-selecteditems-container ul li'
    ).remove();
  });
}

function setShowOrHideTipNotice() {
  showOrHideTipNotice();
  $('#quartech_tipreportenrolled').on('change', function () {
    showOrHideTipNotice();
  });
  $('#quartech_agriprogramsubscriber').on('change', function () {
    showOrHideTipNotice();
  });
}

function showOrHideTipNotice() {
  const agriProgramSubscriptionValue = document.querySelector(
    '#quartech_agriprogramsubscriber'
    // @ts-ignore
  )?.value;
  const tipReportEnrolledValue = document.querySelector(
    '#quartech_tipreportenrolled'
    // @ts-ignore
  )?.value;
  const tipReportNoticeElement = document.querySelector('#tipReportNotice');
  if (!tipReportNoticeElement) return;
  if (
    agriProgramSubscriptionValue === '255550001' &&
    (tipReportEnrolledValue === '255550002' ||
      tipReportEnrolledValue === '255550000')
  ) {
    $(tipReportNoticeElement).css({ display: '' });
  } else {
    $(tipReportNoticeElement).css({ display: 'none' });
  }
}

function customizeTypesOfBusinessOrganization() {
  hideTypesOfBusinessOrganization();

  addTooltipsToTypesOfBusinessOrganization();
}

function hideTypesOfBusinessOrganization() {
  const typesOfBusinessToDisplay =
    getProgramData()?.quartech_typesofbusinesstodisplay;
  if (!typesOfBusinessToDisplay) return;

  const typesOfBusinessToDisplayDictionary = JSON.parse(
    typesOfBusinessToDisplay
  );
  if (!typesOfBusinessToDisplayDictionary) return;

  // @ts-ignore
  $('#quartech_recipienttype option').each(function () {
    // @ts-ignore
    const typeOfBusinessValue = this.value;
    if (typeOfBusinessValue != '') {
      // Hide/Show option
      const isOptionToBeHidden =
        typesOfBusinessToDisplayDictionary[typeOfBusinessValue] == undefined;

      if (isOptionToBeHidden) {
        this.hidden = true;
      }
    }
  });
}

function addTooltipsToTypesOfBusinessOrganization() {
  const typeOfBusiness_ToolTips =
    getGlobalConfigData()?.TypeOfBusiness_ToolTips;

  if (!typeOfBusiness_ToolTips) return;

  // @ts-ignore
  $('#quartech_recipienttype option').each(function () {
    // @ts-ignore
    const typeOfBusiness_SelectControl_OptionValue = this.value;

    const configuredOption =
      typeOfBusiness_ToolTips[typeOfBusiness_SelectControl_OptionValue];

    if (configuredOption) {
      this.title = configuredOption.Tooltip;
    }
  });
}

function customizeApplicantInfoStepForABPP() {
  let htmlContentToAddAboveBusinessDesc = `<div style="padding-bottom: 15px;">
    <div>Please provide a brief description of your business e.g.,</div>
    <ul>
      <li>For Primary Producer - farm size in production in units such as acres, metres squared, and number and type of animals, marketing channels (farm gate, wholesale, retail/use of social media)</li>
      <li>OR For Processor - size of processing area in units such as square feet or metres, number and type of B.C. products used and/or produced, marketing channels (direct, wholesale, retail/use of social media)</li>
    </ul>
  </div>`;
  addTextAboveField(
    'quartech_businessdescription',
    htmlContentToAddAboveBusinessDesc
  );
}

function customizeApplicantInfoStepForNEFBA() {
  const businessOverviewFieldSetElement = $(
    'fieldset[aria-label="Business Overview"]'
  );
  if (businessOverviewFieldSetElement)
    businessOverviewFieldSetElement.css('display', 'none');
}
