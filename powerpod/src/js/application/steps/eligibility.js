import { YES_VALUE } from "../../common/constants.js";
import { initOnChange_DependentRequiredField } from "../../common/fieldLogic.js";
import { addTextAboveField } from "../../common/html.js";
import { getProgramAbbreviation } from "../../common/program.ts";
import { configureFields } from "../../common/fieldConfiguration.js";
import { validateStepFields } from "../../common/validation.js";

export function customizeEligibilityStep(programData) {
  setupEligibilityStepFields();
}

function setupEligibilityStepFields() {
  configureFields('EligibilityStep');

  const programAbbreviation = getProgramAbbreviation();

  if (
    programAbbreviation &&
    (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA')
  ) {
    let fieldToAddElgibilityNote = '';
    if (programAbbreviation === 'ABPP1') {
      fieldToAddElgibilityNote = 'quartech_primaryproducer100or51percent';
    } else if (programAbbreviation === 'ABPP2') {
      fieldToAddElgibilityNote =
        'quartech_farmbusinesscapacityevaluationriskplan';
    } else if (programAbbreviation === 'NEFBA') {
      fieldToAddElgibilityNote =
        'quartech_isaprimaryproducergrowingsellingproducts';
    }
    addTextAboveField(
      fieldToAddElgibilityNote,
      '<b>Please answer the following questions to confirm your eligibility for the program.</b><br/> Note that applicants may be audited and must be able to demonstrate the validity of information provided in this application form.<br /><br />'
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
      validationFunc: validateStepFields,
    });
  }
}
