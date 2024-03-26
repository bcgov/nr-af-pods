import { YES_VALUE } from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldConditionalLogic.js';
import {
  addTextAboveField,
  addTextBelowField,
  addHtmlToSection,
} from '../../common/html.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { configureFields } from '../../common/fieldConfiguration.js';
import { validateStepFields } from '../../common/fieldValidation.js';

export function customizeEligibilityStep() {
  setupEligibilityStepFields();
}

function setupEligibilityStepFields() {
  configureFields();

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation && programAbbreviation === 'NEFBA2') {
    if (!document.querySelector('#envFarmPlanNotice')) {
      let htmlContentEnvFarmPlanNotice = `
        <div id="envFarmPlanNotice">
          <h4 style="font-weight: 600 !important;">Environmental Farm Plan Program</h4>
          <span>
            Participation in the EFP program is free and confidential. Applicants are encouraged to start the EFP process as soon as possible.
          </span>
        </div>
      `;
      addHtmlToSection(
        'eligibilitySection',
        htmlContentEnvFarmPlanNotice,
        'bottom'
      );
    }

    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_statementofcompletionfromefpp',
      requiredFieldTag: 'quartech_commitmenttoefp',
      customFunc: setShowOrHideEnvFarmPlanNotice,
    });

    setShowOrHideEnvFarmPlanNotice();
  }

  if (
    programAbbreviation &&
    (programAbbreviation.includes('ABPP') ||
      programAbbreviation === 'NEFBA' ||
      programAbbreviation === 'NEFBA2')
  ) {
    addHtmlToSection(
      'eligibilitySection',
      '<b>Please answer the following questions to confirm your eligibility for the program.</b><br/> Note that applicants may be audited and must be able to demonstrate the validity of information provided in this application form.<br /><br />',
      'top'
    );
  }

  if (programAbbreviation && programAbbreviation.includes('ABPP')) {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_abppsupportoverlimit',
      requiredFieldTag: 'quartech_abppsupportoverlimitdetail',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_supportreceivedduringscap',
      requiredFieldTag: 'quartech_supportduringscapdetails',
    });
  }

  if (programAbbreviation && programAbbreviation === 'NEFBA') {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: '255550001',
      dependentOnElementTag: 'quartech_bcregisteredbusinessentity',
      requiredFieldTag: 'quartech_committedbizregistrationbeforecompletion',
    });
  }
}

function setShowOrHideEnvFarmPlanNotice() {
  showOrHideEnvFarmPlanNotice();
  $('#quartech_tipreportenrolled').on('change', function () {
    showOrHideEnvFarmPlanNotice();
  });
}

function showOrHideEnvFarmPlanNotice() {
  const statementOfCompletionValue = document.querySelector(
    '#quartech_statementofcompletionfromefpp'
    // @ts-ignore
  )?.value;
  const envFarmPlanNoticeElement = document.querySelector('#envFarmPlanNotice');
  if (!envFarmPlanNoticeElement) return;
  if (statementOfCompletionValue === '255550001') {
    $(envFarmPlanNoticeElement).css({ display: '' });
  } else {
    $(envFarmPlanNoticeElement).css({ display: 'none' });
  }
}
