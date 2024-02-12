import { YES_VALUE } from "../../common/constants.js";
import { initOnChange_DependentRequiredField } from "../../common/fieldLogic.js";
import { observeIframeChanges } from "../../common/html.js";
import { initInputMasking } from "../../common/masking.js";
import { getProgramAbbreviation } from "../../common/program.ts";
import { setStepRequiredFields } from "../../common/setRequired.js";
import { customizeSingleOrGroupApplicantQuestions } from "../fieldLogic.js";

export function customizeProjectIndicatorStep(currentStep) {
  // initInputMasking();
  setStepRequiredFields(currentStep);

  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA') {
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_adoptedprojectresults',
      requiredFieldTag: 'quartech_adoptednumber',
    });
    // @ts-ignore
    initOnChange_DependentRequiredField({
      dependentOnValue: YES_VALUE,
      dependentOnElementTag: 'quartech_environmentallybeneficialadoptedresults',
      requiredFieldTag: 'quartech_environmentallybeneficialadoptednumber',
    });
  }

  if (programAbbreviation === 'ABPP2') {
    observeIframeChanges(
      customizeSingleOrGroupApplicantQuestions,
      'quartech_groupprojectsupportingsectorcapacitybuilding',
      'quartech_singleorgroupapplication'
    );
  }
}
