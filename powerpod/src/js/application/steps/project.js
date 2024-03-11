import {
  GROUP_APPLICATION_VALUE,
  NO_VALUE,
  OTHER_VALUE,
  SECTOR_WIDE_ID_VALUE,
  YES_VALUE,
} from '../../common/constants.js';
import { getMunicipalData } from '../../common/fetch.js';
import {
  initOnChange_DependentRequiredField,
  shouldRequireDependentField,
} from '../../common/fieldLogic.js';
import {
  addTextAboveField,
  addTextBelowField,
  setFieldValue,
} from '../../common/html.js';
import { processLocationData } from '../../common/locations.ts';
import { Logger } from '../../common/logger.js';
import { initInputMasking } from '../../common/masking.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { useScript } from '../../common/scripts.js';
import { setStepRequiredFields } from '../../common/setRequired.js';
import { setupTooltip } from '../../common/tooltip.js';

const logger = Logger('application/steps/project');

export function customizeProjectStep(programData) {
  setProjectStepRequiredFields();

  setProjectStepDependentRequiredFields();

  displayLabelsForProjectStep(programData);

  customizeActivityTypesDropDownList(programData);

  initOnChange_ActiviyOpenToPublic();

  // initInputMasking();

  initAdditionalLocationsMultiSelect();
}

function displayLabelsForProjectStep(programData) {
  const fieldsLabelsMap = JSON.parse(
    programData.quartech_portalappfieldsdisplaynamesmapping
  );
  if (!fieldsLabelsMap) return;

  for (const [fieldName, label] of Object.entries(fieldsLabelsMap)) {
    let elem = $(`#${fieldName}_label`);
    if (elem) {
      elem.text(label);
    }
  }
}

function customizeActivityTypesDropDownList(programData) {
  hideActivityTypes(programData.quartech_activitiestypestodisplay);
}

function hideActivityTypes(activityTypesToDisplay) {
  if (!activityTypesToDisplay) return;
  const activityTypesToDisplayDictionary = JSON.parse(activityTypesToDisplay);
  if (!activityTypesToDisplayDictionary) return;

  $('#quartech_pleaseselectthemostapplicableactivitytype option').each(
    // @ts-ignore
    function () {
      // @ts-ignore
      const activityTypeValue = this.value;
      if (activityTypeValue != '') {
        // Hide/Show option
        const isOptionToBeHidden =
          activityTypesToDisplayDictionary[activityTypeValue] == undefined;
        if (isOptionToBeHidden) {
          this.hidden = true;
        }
      }
    }
  );
}

function initOnChange_ActiviyOpenToPublic() {
  var q2Control = $('#quartech_willthisactivitybeopentotheentirepublic');

  var selectedValue = q2Control.val();
  hideShow_WhyActiviyNotOpenToPublic(selectedValue);

  logger.info({
    fn: initOnChange_ActiviyOpenToPublic,
    message: 'initOnChange_ActiviyOpenToPublic called.',
  });
  q2Control.on('change', function () {
    var selectedValue = $(this).val();

    logger.info({
      fn: initOnChange_ActiviyOpenToPublic,
      message: `Selected Value: ${selectedValue}`,
    });

    hideShow_WhyActiviyNotOpenToPublic(selectedValue);
  });
}

function hideShow_WhyActiviyNotOpenToPublic(selectedValue) {
  if (selectedValue === YES_VALUE) {
    $('#quartech_allactivitiesmustbeopentothepublicplease')
      .parent()
      .parent()
      .css('display', 'none');
    $('#quartech_allactivitiesmustbeopentothepublicplease').val(''); // clear value
  } else {
    $('#quartech_allactivitiesmustbeopentothepublicplease')
      .parent()
      .parent()
      .css('display', 'grid');
  }
}

function setProjectStepRequiredFields() {
  setStepRequiredFields('ProjectStep');

  const programAbbreviation = getProgramAbbreviation();

  // START KTTP PROJECT STEP CUSTOMIZATION
  if (programAbbreviation && programAbbreviation.includes('KTTP')) {
    // START Organization Information
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag:
        'quartech_hasthisorganizationreceivedkttpfundingin',
      requiredFieldTag: 'quartech_ifyespleaseexplainwhenandforwhichactivity',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag:
        'quartech_hasthisorganizationreceivedfundingfrmother',
      requiredFieldTag: 'quartech_ifyespleaseexplainwhenandfromwhichprogram',
    });
    // END Organization Information

    // START Collaborating Organization Information
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_areyoucollaboratingwithanyotherorg',
      requiredFieldTag: 'quartech_ifyespleaseprovidelegalbusinessorganization',
      // @ts-ignore
      shouldBeRequired: false,
    });
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_areyoucollaboratingwithanyotherorg',
      requiredFieldTag: 'quartech_ifyespleaseprovideacontactname',
      // @ts-ignore
      shouldBeRequired: false,
    });
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_areyoucollaboratingwithanyotherorg',
      requiredFieldTag: 'quartech_ifyespleaseprovideabriefbackgroundoutlinin',
      // @ts-ignore
      shouldBeRequired: false,
    });
    // END Collaborating Organization Information

    // START Activity Information
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag:
        'quartech_areyouapplyingforatraceabilityknowledget',
      requiredFieldTag: 'quartech_ifyespleaseexplainthetraceabilityactivityt',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_doestheactivitytakeplaceovermultipleday',
      requiredFieldTag: 'quartech_ifyespleaseprovidetheadditionaldates',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: NO_VALUE,
      dependentOnElementTag: 'quartech_willthisactivitybeopentotheentirepublic',
      requiredFieldTag: 'quartech_allactivitiesmustbeopentothepublicplease',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: OTHER_VALUE,
      dependentOnElementTag:
        'quartech_pleaseselectthemostapplicableactivitytype',
      requiredFieldTag: 'quartech_ifotherpleasedescribeyouractivitytype',
    });
    // Priority Topic(s). Please select the most applicable topic(s) that your project will focus on.
    // Please select the most applicable purpose that your activity will focus on:
    const priorityTopicElements = document.querySelector(
      '#quartech_prioritytopics_i'
    );
    const containsOtherPriorityTopicOption = document
      .querySelector('#quartech_prioritytopics_i')
      ?.querySelector('li[aria-label="Other for Priority Topic(s)"]');
    // initial load:
    if (containsOtherPriorityTopicOption) {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnElementTag: 'quartech_prioritytopics_i',
        requiredFieldTag: 'quartech_otherprioritytopic',
        overrideTruthyClause: true,
      });
    } else {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnElementTag: 'quartech_prioritytopics_i',
        requiredFieldTag: 'quartech_otherprioritytopic',
        overrideTruthyClause: false,
      });
    }

    // setup observer to check each time selected topics changes
    var observer = new MutationObserver(function (mutations) {
      if (
        document
          .querySelector('#quartech_prioritytopics_i')
          ?.querySelector('li[aria-label="Other for Priority Topic(s)"]')
      ) {
        let isVisible = $(`#quartech_otherprioritytopic_label`).is(':visible');
        // Here we should dynamically hide/show the comment field & make it required:
        // Do this by using 'overrideTruthyClause' and force it to show & be required
        if (!isVisible) {
          // @ts-ignore
          initOnChange_DependentRequiredField({
            dependentOnElementTag: 'quartech_prioritytopics_i',
            requiredFieldTag: 'quartech_otherprioritytopic',
            overrideTruthyClause: true,
          });
        }
      } else {
        // @ts-ignore
        initOnChange_DependentRequiredField({
          dependentOnElementTag: 'quartech_prioritytopics_i',
          requiredFieldTag: 'quartech_otherprioritytopic',
          overrideTruthyClause: false,
        });
      }
    });

    if (
      priorityTopicElements &&
      priorityTopicElements.nodeType === Node.ELEMENT_NODE
    ) {
      observer.observe(priorityTopicElements, {
        attributes: true,
        childList: true,
        characterData: true,
      });
    }

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: OTHER_VALUE,
      dependentOnElementTag: 'quartech_activitypurpose',
      requiredFieldTag: 'quartech_ifotherpleasedescribetheactivitypurpose',
    });

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag:
        'quartech_theprocessoflearningandprocessingknowledge',
      requiredFieldTag: 'quartech_adulteducationandknowlegetransferdescript',
    });
    // END Activity Information
  }
  // END KTTP PROJECT STEP CUSTOMIZATION

  // START NEFBA PROJECT STEP CUSTOMIZATION
  if (programAbbreviation && programAbbreviation === 'NEFBA') {
    if (!document.querySelector('#quartech_businessgoals_note')) {
      addTextAboveField(
        'quartech_businessgoals',
        "<br /><div id='quartech_businessgoals_note'><b>Note: Reimbursement for program costs will not be distributed unless you submit a complete new or updated business plan by March 1, 2024.</b><br /><br /></div>"
      );
    }

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550000',
      dependentOnElementTag: 'quartech_completingcategory',
      requiredFieldTag: 'quartech_stepstocompletethebusinessplan',
    });

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001', // Business Plan Coaching from a Business Consultant ($3,000 in funding)
      dependentOnElementTag: 'quartech_completingcategory',
      requiredFieldTag: 'quartech_businessconsultantinformation', // Identify the business consultant chosen by name, contact information and business registration number.
    });

    if (!document.querySelector('#quartech_bciaregisteredconsultant_note')) {
      addTextAboveField(
        'quartech_bciaregisteredconsultant',
        "<br /><div id='quartech_bciaregisteredconsultant_note'><b>Note: The consultant must be registered with BCIA or as a CPA. Please select another consultant if they are not registered with either. See the Program Guide for more information.</b></div><br />"
      );
    }

    if (!document.querySelector('#quartech_nefba_project_step_note')) {
      const containerDiv = $('#EntityFormView > div.tab.clearfix > div > div');

      containerDiv.append(`
        <div id="quartech_nefba_project_step_note">
          <label>
            <b>Review the Program Guide for support on how to complete or update your business plan and requirements for Phase 2 funding.</b>
          </label>
          <br />
          <br />
          <label>Reminders:​</label>
          <br />
          <br />
          <label>
            If a consultant is used, an invoice and proof of payment is required for reimbursement up to a maximum amount of $3,000.
          ​</label>
          <br />
          <br />
          <label>
            Note that participating in Phase 1 prepares applicants for success in the Phase 2 application process, however, does NOT guarantee funding through Phase 2. See Program Guide for full details.​
          </label>
          <br />
          <br />
          <label>
            For Phase 2 funding, a Statement of Completion from the Environmental Farm Plan (EFP) Program or commitment to apply for and, to the extent possible, complete an Environmental Farm Plan (EFP) prior to March 1, 2025 is required. Participation in the EFP program is free and confidential and applicants are encouraged to start the EFP process as soon as possible.
          </label>
        </div>`);
    }

    const programCategoryElement = document.querySelector(
      '#quartech_completingcategory'
    );
    // @ts-ignore
    const programCategoryElementInitialValue = programCategoryElement.value;

    const BUSINESS_PLAN_COACHING_VALUE = '255550001';
    if (programCategoryElementInitialValue === BUSINESS_PLAN_COACHING_VALUE) {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: true,
        requiredFieldTag: 'quartech_bciaregisteredconsultant',
        // setRequiredFieldsFunc: setProjectStepRequiredFields,
      });
      setBciaOnChange();
    } else {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag: 'quartech_bciaregisteredconsultant',
        // setRequiredFieldsFunc: setProjectStepRequiredFields,
      });
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag: 'quartech_cpaconsultant',
        // setRequiredFieldsFunc: setProjectStepRequiredFields,
      });
      $('#quartech_bciaregisteredconsultant').off('change');
    }

    $('#quartech_completingcategory').on('change', function () {
      const programCategoryValue = document.querySelector(
        '#quartech_completingcategory'
        // @ts-ignore
      ).value;
      if (programCategoryValue === BUSINESS_PLAN_COACHING_VALUE) {
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: true,
          requiredFieldTag: 'quartech_bciaregisteredconsultant',
          // setRequiredFieldsFunc: setProjectStepRequiredFields
        });
        setBciaOnChange();
      } else {
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: 'quartech_bciaregisteredconsultant',
          // setRequiredFieldsFunc: setProjectStepRequiredFields
        });
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: 'quartech_cpaconsultant',
          // setRequiredFieldsFunc: setProjectStepRequiredFields
        });
        $('#quartech_bciaregisteredconsultant').off('change');
      }
    });
  }
  // END NEFBA PROJECT STEP CUSTOMIZATION

  // START ABPP OR NEFBA CUSTOMIZATION
  if (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA') {
    const orgInfoFieldSetElement = $(
      'fieldset[aria-label="Organization Information"]'
    );
    if (orgInfoFieldSetElement) orgInfoFieldSetElement.css('display', 'none');

    const collaboratingOrgFieldSetElement = $(
      'fieldset[aria-label="Collaborating Organization Information"]'
    );
    if (collaboratingOrgFieldSetElement) {
      collaboratingOrgFieldSetElement.css('display', 'none');
    }

    const activityInformationFieldSetElement = $(
      'fieldset[aria-label="Activity Information"]'
    );
    if (activityInformationFieldSetElement) {
      activityInformationFieldSetElement.css('display', 'none');
    }
  }
  // END ABPP OR NEFBA CUSTOMIZATION

  // START ABPP1 AND ABPP2 CUSTOMIZATION
  if (programAbbreviation && programAbbreviation.includes('ABPP')) {
    let dynamicText =
      programAbbreviation === 'ABPP1' ? 'event/training' : 'project';
    if (!document.querySelector('#activityStartDateNotice')) {
      let htmlContentToAddAboveStartDate = `<div id="activityStartDateNotice" style="padding-top: 15px;">
        Your ${dynamicText} may have a delayed start date. However, all ${dynamicText}s must be submitted 90 days after the start date, unless an extension of the ${dynamicText} has been granted by the Program Manager. Applications to extend any ${dynamicText} will be considered on a case-by-case basis.
      </div>`;
      addTextBelowField(
        'quartech_whenistheprojectstartdate',
        htmlContentToAddAboveStartDate
      );
    }

    if (programAbbreviation === 'ABPP2') {
      if (!document.querySelector('#activityEndDateNotice')) {
        let htmlContentToAddAboveEndDate = `<div id="activityEndDateNotice" style="padding-top: 15px;">
        Consultants must submit the ${dynamicText} report to the Applicant for review and feedback at least two weeks prior to the ${dynamicText} end date. Revisions requested by the Applicant must be completed by the Consultant and approved by the Applicant prior to the final submission to the program.
      </div>`;
        addTextBelowField(
          'quartech_activityenddate',
          htmlContentToAddAboveEndDate
        );
      }
    }
  }
  // END ABPP1 AND ABPP2 CUSTOMIZATION

  // START ONLY ABPP1 CUSTOMIZATION
  if (getProgramAbbreviation() === 'ABBP1') {
    // Program Category
    const programCategoryElement = $('fieldset[aria-label="Program Category"]');
    programCategoryElement.css('display', 'none');

    // Consultant Information
    const consultantInformationElement = $(
      'fieldset[aria-label="Consultant Information"]'
    );
    consultantInformationElement.css('display', 'none');
  }
  // END ONLY ABPP1 CUSTOMIZATION

  // START ONLY ABPP2 CUSTOMIZATION
  if (getProgramAbbreviation() === 'ABPP2') {
    if (!document.querySelector('#consultantNotice')) {
      let htmlContentToAddUnderConsultantInfo = `<div id="consultantNotice" style="padding-bottom: 15px;">
      **Please note that the Ministry reserves the right to refuse projects submitted with consultants who are not considered to be in good standing with the Ministry. Applications with unacceptable consultants listed will be held or waitlisted and the applicants will be given an opportunity to find an acceptable consultant. 
    </div>`;
      addTextAboveField(
        'quartech_consultantcompanyname',
        htmlContentToAddUnderConsultantInfo
      );
    }

    if (!document.querySelector('#moreThan10PercentNotice')) {
      let htmlContentToAddUnderMoreThan10Percent = `<div id="moreThan10PercentNotice" style="padding-top: 15px;">
      **Please note that supporting consultants may not complete more than 40% of the proposed project. 
    </div>`;
      addTextBelowField(
        'quartech_consultantcompletingoverlimit',
        htmlContentToAddUnderMoreThan10Percent
      );
    }
  }
  // END ONLY ABPP2 CUSTOMIZATION
}

function setBciaOnChange() {
  $('#quartech_bciaregisteredconsultant').on('change', function () {
    const bciaConsultantValue = document.querySelector(
      '#quartech_bciaregisteredconsultant'
      // @ts-ignore
    ).value;
    const BCIA_NO_VALUE = '255550002';
    if (bciaConsultantValue === BCIA_NO_VALUE) {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: true,
        requiredFieldTag: 'quartech_cpaconsultant',
        setRequiredFieldsFunc: setProjectStepRequiredFields,
      });
    } else {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag: 'quartech_cpaconsultant',
        setRequiredFieldsFunc: setProjectStepRequiredFields,
      });
      $('#quartech_cpaconsultant').off('change');
    }
  });
}

function setProjectStepDependentRequiredFields() {
  const programAbbreviation = getProgramAbbreviation();
  // START KTTP CUSTOMIZATION
  if (programAbbreviation.includes('KTTP')) {
    // Please explain if you selected Sector-Wide, or if you have additional information to share on the Commodity/Sector:
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: SECTOR_WIDE_ID_VALUE,
      dependentOnElementTag: 'quartech_naicsindustry',
      requiredFieldTag: 'quartech_ifotherpleasedescribecommodity',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValueArray: [
        '255550001', // "In-Person"
        '255550002', // "hybrid"
      ],
      dependentOnElementTag: 'quartech_eventtype',
      requiredFieldTag: 'quartech_projectlocation',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_projecttakesplaceinotherplaces',
      requiredFieldTag: 'quartech_venuelocationcitytownetcoronlinesoftwar',
    });
  }
  // END KTTP CUSTOMIZATION

  // START ABBP STREAM 2 CUSTOMIZATION
  if (programAbbreviation === 'ABPP2') {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_useofsupportingconsultant',
      requiredFieldTag: 'quartech_consultantcompletingoverlimit',
    });

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_useofsupportingconsultant',
      requiredFieldTag: 'quartech_supportingconsultantcompanyname',
    });

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_useofsupportingconsultant',
      requiredFieldTag: 'quartech_supportingconsultantfullname',
    });

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_useofsupportingconsultant',
      requiredFieldTag: 'quartech_supportingconsultantpositiontitle',
    });

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_useofsupportingconsultant',
      requiredFieldTag: 'quartech_supportingconsultantrationale',
    });

    // Please provide the names of the co-applicants to your group application
    // initial load:

    setSingleOrGroupApplicant();
    if (document.querySelector('#quartech_singleorgroupapplication')) {
      setSingleOrGroupApplicantOnChange();
    }
  }
  // END ABPP STREAM 2 CUSTOMIZATION

  // In order to continuously improve communications, we are interested in learning how you heard about this program, please select all options that apply
  const communicationsOptions = document.querySelector(
    '#quartech_inordertocontinuouslyimprovecommunications_i'
  );
  const containsOtherCommunicationOption = document
    .querySelector('#quartech_inordertocontinuouslyimprovecommunications_i')
    ?.querySelector(
      'li[aria-label="Other for In order to continuously improve communications"]'
    );
  // initial load:
  if (containsOtherCommunicationOption) {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnElementTag:
        'quartech_inordertocontinuouslyimprovecommunications_i',
      overrideTruthyClause: true,
      requiredFieldTag: 'quartech_ifotherpleasedescribe',
    });
  } else {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnElementTag:
        'quartech_inordertocontinuouslyimprovecommunications_i',
      overrideTruthyClause: false,
      requiredFieldTag: 'quartech_ifotherpleasedescribe',
    });
  }

  // setup observer to check each time selected topics changes
  var observer = new MutationObserver(function (mutations) {
    if (
      document
        .querySelector('#quartech_inordertocontinuouslyimprovecommunications_i')
        ?.querySelector(
          'li[aria-label="Other for In order to continuously improve communications"]'
        )
    ) {
      // Only need to show the field when it's not visible, otherwise do nothing
      let isVisible = $(`#quartech_ifotherpleasedescribe_label`).is(':visible');
      // Here we should dynamically hide/show the comment field & make it required:
      // Do this by using 'overrideTruthyClause' and force it to show & be required
      if (!isVisible) {
        // @ts-ignore
        initOnChange_DependentRequiredField({
          dependentOnElementTag:
            'quartech_inordertocontinuouslyimprovecommunications_i',
          overrideTruthyClause: true,
          requiredFieldTag: 'quartech_ifotherpleasedescribe',
        });
      }
    } else {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnElementTag:
          'quartech_inordertocontinuouslyimprovecommunications_i',
        overrideTruthyClause: false,
        requiredFieldTag: 'quartech_ifotherpleasedescribe',
      });
    }
  });

  if (
    communicationsOptions &&
    communicationsOptions.nodeType === Node.ELEMENT_NODE
  ) {
    observer.observe(communicationsOptions, {
      attributes: true,
      childList: true,
      characterData: true,
    });
  }
}

function setSingleOrGroupApplicant() {
  let htmlContentToAddAboveCoApplicantNames = `<div id="groupApplicationNotice" style="padding-bottom: 15px;">
  If applying for a group project, please ensure all participants submit their own applications and indicate co-applicants as part of the application process.
</div>`;
  const singleOrGroupApplicationValue = document.querySelector(
    '#quartech_singleorgroupapplication'
    // @ts-ignore
  ).value;
  if (singleOrGroupApplicationValue === GROUP_APPLICATION_VALUE) {
    // Here we should dynamically hide/show the comment field & make it required:
    // Do this by using 'overrideTruthyClause' and force it to show & be required
    // @ts-ignore
    shouldRequireDependentField({
      shouldBeRequired: true,
      requiredFieldTag: 'quartech_coapplicatntsnames',
      setRequiredFieldsFunc: setProjectStepRequiredFields,
      disableRequiredProp: true,
    });
    const groupApplicationNoticeElement = document.querySelector(
      '#groupApplicationNotice'
    );
    if (groupApplicationNoticeElement) {
      $(groupApplicationNoticeElement).css({ display: '' });
    } else {
      addTextAboveField(
        'quartech_coapplicatntsnames',
        htmlContentToAddAboveCoApplicantNames
      );
    }
  } else {
    // @ts-ignore
    shouldRequireDependentField({
      shouldBeRequired: false,
      requiredFieldTag: 'quartech_coapplicatntsnames',
      setRequiredFieldsFunc: setProjectStepRequiredFields,
      disableRequiredProp: true,
    });
    const groupApplicationNoticeElement = document.querySelector(
      '#groupApplicationNotice'
    );
    if (groupApplicationNoticeElement) {
      $(groupApplicationNoticeElement).css({ display: 'none' });
    }
  }
}

function setSingleOrGroupApplicantOnChange() {
  $('#quartech_singleorgroupapplication').on('change', function () {
    setSingleOrGroupApplicant();
  });
}

function initAdditionalLocationsMultiSelect() {
  getMunicipalData({
    onSuccess: (data) => {
      if (data) {
        addLocationMultiSelect(data);
      }
    },
  });
}

function addLocationMultiSelect(municipalJson) {
  const additionalLocationsId =
    'quartech_venuelocationcitytownetcoronlinesoftwar';

  if (!$(`#${additionalLocationsId}`)) return;

  const municipalsGroupedByRegionalDistrictKey =
    processLocationData(municipalJson);

  const fieldControlDiv = $(`#${additionalLocationsId}`).closest('div');

  const selectElement = `
      <select id="additionalLocationControl" data-placeholder="Select locations" class="chosen-select" multiple tabindex="6">
        <option value=""></option>
      </select>
    `;
  $(fieldControlDiv)?.append(selectElement);

  // hide dynamics field
  $(`#${additionalLocationsId}`).css({ display: 'none' });

  Object.keys(municipalsGroupedByRegionalDistrictKey).forEach(
    (regionalDistrictName) => {
      const group = $('<optgroup label="' + regionalDistrictName + '" />');
      municipalsGroupedByRegionalDistrictKey[regionalDistrictName].forEach(
        (municipalName) => {
          $(`<option value="${municipalName}"/>`)
            .html(municipalName)
            .appendTo(group);
        }
      );
      group.appendTo($('#additionalLocationControl'));
    }
  );

  useScript('chosen', setupChosen);
}

function setupChosen() {
  logger.info({ fn: setupChosen, message: 'setting up chosen...' });
  // @ts-ignore
  $('.chosen-select').chosen();
  // @ts-ignore
  $('.chosen-select-deselect').chosen({ allow_single_deselect: true });

  // fetch pre-selected options, if any
  const existingAdditionalLocations = $(
    '#quartech_venuelocationcitytownetcoronlinesoftwar'
  ).val();

  if (existingAdditionalLocations) {
    // @ts-ignore
    const existingLocationsArray = existingAdditionalLocations.split(', ');
    $('.chosen-select').val(existingLocationsArray);
    $('.chosen-select').trigger('chosen:updated');
  }

  var target = document
    .getElementById('quartech_venuelocationcitytownetcoronlinesoftwar')
    .closest('tr');
  var observer = new MutationObserver(function (mutations) {
    if (target?.style?.display === 'none') {
      $('.chosen-select').val([]);
      $('.chosen-select').trigger('chosen:updated');
    }
  });
  if (target && target.nodeType === Node.ELEMENT_NODE) {
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  // update dynamics field value on change of chosen field
  $('.chosen-select').on('change', function () {
    const newSelectedLocations = $('.chosen-select').val();
    // @ts-ignore
    const stringToPassToFieldInput = newSelectedLocations.join(', ');
    setFieldValue(
      'quartech_venuelocationcitytownetcoronlinesoftwar',
      stringToPassToFieldInput
    );
  });

  setupTooltip({
    name: 'quartech_venuelocationcitytownetcoronlinesoftwar',
    tooltipText:
      'Project locations in addition to what you have provided in the question above',
    tooltipTargetElementId: 'additionalLocationControl_chosen',
  });
  logger.info({ fn: setupChosen, message: 'successfully setup chosen...' });
}
