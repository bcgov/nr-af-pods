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
} from '../../common/fieldConditionalLogicLegacy.js';
import {
  addHtmlToSection,
  addHtmlToTabDiv,
  addTextAboveField,
  addTextBelowField,
  disableSingleLine,
  getControlValue,
  hideFieldsetTitle,
  moveTableRow,
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

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation.includes('KTTP')) {
    moveTableRow(
      'quartech_accessandinclusivenessdescription',
      'quartech_numberofoverallattendeesexpectedtoattendthi'
    );
  }

  if (programAbbreviation === 'TFCCRF') {
    const style = document.createElement('style');
    style.textContent = `
      a.btn-primary, button.btn-primary {
        color: #fff !important;
      }
    `;
    document.head.appendChild(style);
    // customizeProjectStepForTFCCRF();
    // disableSingleLine('subgrid_ProjectStep_Import_TF_Inventory');
    // disableSingleLine('subgrid_ProjectStep_New_TF_Inventory');

    ensureHeaderSingleLineForTFCCRF('subgrid_ProjectStep_Import_TF_Inventory');
    ensureHeaderSingleLineForTFCCRF('subgrid_ProjectStep_New_TF_Inventory');

    addTextBelowNewTFInventoryLabel();
  }
}

function addTextBelowNewTFInventoryLabel() {
  const heading = document.querySelector(
    'h3.info.form-subgrid-heading > label[for="subgrid_ProjectStep_New_TF_Inventory"]'
  )?.parentElement;

  if (heading) {
    const blankParagraph = document.createElement('br');

    const paragraph1 = document.createElement('p');
    paragraph1.textContent =
      'Provide row spacing and tree spacing measurements in feet.';

    const paragraph2 = document.createElement('p');
    paragraph2.textContent =
      'You will be able to view the calculated acreage for each line item on the printable copy once your application has been submitted.';

    heading.insertAdjacentElement('afterend', blankParagraph);
    blankParagraph.insertAdjacentElement('afterend', paragraph1);
    paragraph1.insertAdjacentElement('afterend', paragraph2);
  }
}

function ensureHeaderSingleLineForTFCCRF(subgridName) {
  const container = document.querySelector(`#${subgridName}`);
  if (!container) return;

  const thElements = container.querySelectorAll('tr > th');

  thElements.forEach((th) => {
    const anchor = th.querySelector('a');
    if (anchor) {
      // Prevent wrapping
      anchor.style.whiteSpace = 'nowrap';
      anchor.style.display = 'inline-block';

      // Temporarily append to measure actual size
      const clone = anchor.cloneNode(true);
      clone.style.visibility = 'hidden';
      clone.style.position = 'absolute';
      clone.style.width = 'auto';
      clone.style.maxWidth = 'none';

      document.body.appendChild(clone);
      const width = clone.offsetWidth + 24; // add buffer/padding
      document.body.removeChild(clone);

      th.style.width = `${width}px`;
    }
  });
}

function customizeProjectStepForTFCCRF() {
  const originalSource = getControlValue({
    controlId: 'quartech_originalsource',
  });
  logger.info({
    fn: customizeProjectStepForTFCCRF,
    message: `found originalSource: ${originalSource}`,
  });
  if (originalSource && originalSource !== 'Import') {
    const element = document.getElementById(
      'TFCCRF_dateCropsPlantedInstructions'
    );
    if (!element) {
      logger.error({
        fn: customizeProjectStepForTFCCRF,
        message: `could not find element with ID: TFCCRF_dateCropsPlantedInstructions`,
      });
      return;
    }
    element.style.display = 'none';
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

function customizeProjectStepForNEFBA() {
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

function setProjectStepRequiredFields() {
  configureFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation === 'VLB') {
    customizeProjectStepForVLB();
  }

  // START NEFBA PROJECT STEP CUSTOMIZATION
  if (programAbbreviation && programAbbreviation === 'NEFBA') {
    customizeProjectStepForNEFBA();
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
