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
} from '../../common/fieldConditionalLogic.js';
import {
  addHtmlToSection,
  addHtmlToTabDiv,
  addTextAboveField,
  addTextBelowField,
  hideFieldsetTitle,
  setFieldValue,
} from '../../common/html.js';
import { processLocationData } from '../../common/locations.ts';
import { Logger } from '../../common/logger.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { useScript } from '../../common/scripts.js';
import { configureFields } from '../../common/fieldConfiguration.js';
import { setupTooltip } from '../../common/tooltip.js';

const logger = Logger('application/steps/project');

export function customizeProjectStep(programData) {
  setProjectStepRequiredFields();

  customizeActivityTypesDropDownList(programData);

  initOnChange_ActiviyOpenToPublic();

  initAdditionalLocationsMultiSelect();
}

function customizeActivityTypesDropDownList(programData) {
  hideActivityTypes(programData.quartech_activitiestypestodisplay);
}

function hideActivityTypes(activityTypesToDisplay) {
  if (!activityTypesToDisplay) return;
  const activityTypesToDisplayDictionary = JSON.parse(activityTypesToDisplay);
  if (!activityTypesToDisplayDictionary) return;

  $('#quartech_pleaseselectthemostapplicableactivitytype option').each(
    function () {
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

function customizeProjectStepForVLB() {
  addHtmlToTabDiv(
    'tab_Project',
    'Within your approved scope of practice (CVBC PPR, CVBC PSA, RVT), please indicate your capacity to provide the following types of veterinary services:',
    'top'
  );
  hideFieldsetTitle('Description');
}

function setProjectStepRequiredFields() {
  configureFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation === 'VLB') {
    customizeProjectStepForVLB();
  }

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
    const programCategoryElementInitialValue = programCategoryElement.value;

    const BUSINESS_PLAN_COACHING_VALUE = '255550001';
    if (programCategoryElementInitialValue === BUSINESS_PLAN_COACHING_VALUE) {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: true,
        requiredFieldTag: 'quartech_bciaregisteredconsultant',
      });
      setBciaOnChange();
    } else {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag: 'quartech_bciaregisteredconsultant',
      });
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag: 'quartech_cpaconsultant',
      });
      $('#quartech_bciaregisteredconsultant').off('change');
    }

    $('#quartech_completingcategory').on('change', function () {
      // @ts-ignore
      const programCategoryValue = document.querySelector(
        '#quartech_completingcategory'
        // @ts-ignore
      )?.value;
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
  if (programAbbreviation && programAbbreviation === 'ABPP1') {
    let dynamicText =
      programAbbreviation === 'ABPP1' ? 'event/training' : 'project';
    if (!document.querySelector('#activityStartDateNotice')) {
      let htmlContentToAddAboveStartDate = `<div id="activityStartDateNotice">
        Your ${dynamicText} may have a delayed start date. However, all ${dynamicText}s must be submitted 90 days after the start date, unless an extension of the ${dynamicText} has been granted by the Program Manager. Applications to extend any ${dynamicText} will be considered on a case-by-case basis.
      </div>`;
      addTextBelowField(
        'quartech_whenistheprojectstartdate',
        htmlContentToAddAboveStartDate
      );
    }

    // if (programAbbreviation === 'ABPP2') {
    //   if (!document.querySelector('#activityEndDateNotice')) {
    //     let htmlContentToAddAboveEndDate = `<div id="activityEndDateNotice" style="padding-top: 15px;">
    //     Consultants must submit the ${dynamicText} report to the Applicant for review and feedback at least two weeks prior to the ${dynamicText} end date. Revisions requested by the Applicant must be completed by the Consultant and approved by the Applicant prior to the final submission to the program.
    //   </div>`;
    //     addTextBelowField(
    //       'quartech_activityenddate',
    //       htmlContentToAddAboveEndDate
    //     );
    //   }
    // }
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
  // if (getProgramAbbreviation() === 'ABPP2') {
  //   if (!document.querySelector('#consultantNotice')) {
  //     let htmlContentToAddUnderConsultantInfo = `<div id="consultantNotice" style="padding-bottom: 15px;">
  //     **Please note that the Ministry reserves the right to refuse projects submitted with consultants who are not considered to be in good standing with the Ministry. Applications with unacceptable consultants listed will be held or waitlisted and the applicants will be given an opportunity to find an acceptable consultant.
  //   </div>`;
  //     addTextAboveField(
  //       'quartech_consultantcompanyname',
  //       htmlContentToAddUnderConsultantInfo
  //     );
  //   }

  //   if (!document.querySelector('#moreThan10PercentNotice')) {
  //     let htmlContentToAddUnderMoreThan10Percent = `<div id="moreThan10PercentNotice" style="padding-top: 15px;">
  //     **Please note that supporting consultants may not complete more than 40% of the proposed project.
  //   </div>`;
  //     addTextBelowField(
  //       'quartech_consultantcompletingoverlimit',
  //       htmlContentToAddUnderMoreThan10Percent
  //     );
  //   }
  // }
  // END ONLY ABPP2 CUSTOMIZATION
}

function setBciaOnChange() {
  $('#quartech_bciaregisteredconsultant').on('change', function () {
    // @ts-ignore
    const bciaConsultantValue = document.querySelector(
      '#quartech_bciaregisteredconsultant'
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

function setSingleOrGroupApplicant() {
  let htmlContentToAddAboveCoApplicantNames = `<div id="groupApplicationNotice" style="padding-bottom: 15px;">
  If applying for a group project, please ensure all participants submit their own applications and indicate co-applicants as part of the application process.
</div>`;
  // @ts-ignore
  const singleOrGroupApplicationValue = document.querySelector(
    '#quartech_singleorgroupapplication'
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
    const existingLocationsArray = existingAdditionalLocations.split(', ');
    $('.chosen-select').val(existingLocationsArray);
    $('.chosen-select').trigger('chosen:updated');
  }

  // @ts-ignore
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
    const stringToPassToFieldInput = newSelectedLocations?.join(', ');
    // @ts-ignore
    setFieldValue({
      name: 'quartech_venuelocationcitytownetcoronlinesoftwar',
      value: stringToPassToFieldInput,
    });
  });

  setupTooltip({
    name: 'quartech_venuelocationcitytownetcoronlinesoftwar',
    tooltipText:
      'Project locations in addition to what you have provided in the question above',
    tooltipTargetElementId: 'additionalLocationControl_chosen',
  });
  logger.info({ fn: setupChosen, message: 'successfully setup chosen...' });
}
