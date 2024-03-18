import { YES_VALUE } from '../../common/constants.js';
import { initOnChange_DependentRequiredField } from '../../common/fieldConditionalLogic.js';
import { observeIframeChanges } from '../../common/html.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { configureFields } from '../../common/fieldConfiguration.js';
import { customizeSingleOrGroupApplicantQuestions } from '../fieldLogic.js';

export function customizeProjectResultsStep() {
  // initInputMasking();
  configureFields();

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
