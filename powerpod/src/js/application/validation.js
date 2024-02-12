// here goes validation logic specific to application
import {
  displayValidationErrors,
  validateStepFields,
} from '../common/validation.js';

export function validateIsConsultantEitherBciaOrCpa() {
  const bciaElement = document.querySelector(
    '#quartech_bciaregisteredconsultant'
  );
  const cpaElement = document.querySelector('#quartech_cpaconsultant');
  const projectCategoryElement = document.querySelector(
    '#quartech_completingcategory'
  );

  if (!bciaElement || !projectCategoryElement || !cpaElement) return '';

  // if "Self-developed Business Plan ($1,250 in funding)" selected or empty, exit early
  if (
    // @ts-ignore
    projectCategoryElement.value === '255550000' ||
    // @ts-ignore
    projectCategoryElement.value === ''
  )
    return '';

  if (
    // @ts-ignore
    bciaElement.value === '255550002' &&
    // @ts-ignore
    cpaElement.value === '255550002'
  ) {
    return '<div><span>You must select YES to either "Is the consultant registered with the BC Institute of Agrologists (BCIA)?" OR "If the consultant is NOT registered with the BC Institute of Agrologists (BCIA), is the consultant a Chartered Professional Accountant (CPA)?"</span><span style="color:red;"> The consultant must be registered with BCIA or CPA.</span></div>';
  }
  return '';
}

export function validateDemographicInfoRequiredFields() {
  let validationErrorHtml = validateStepFields('DemographicInfoStep', true);

  let demographicPercentageValidationError = validateDemographicPercentages();

  validationErrorHtml = validationErrorHtml.concat(
    demographicPercentageValidationError
  );

  displayValidationErrors(validationErrorHtml);
}

export function validateDemographicPercentages() {
  let indigenousTotal = 0;
  let womenTotal = 0;
  let youthTotal = 0;

  // Percentage of shares owned by Indigenous, First Nations (including status and non-status)
  const firstNationsElement = document.querySelector(
    '#quartech_firstnationssharepercentage'
  );
  const firstNationsElementValue = $(firstNationsElement).val();
  // @ts-ignore
  const firstNationsPercentage = parseFloat(firstNationsElementValue);
  indigenousTotal += !!firstNationsPercentage && firstNationsPercentage;

  // Inuk (Inuit) share percentage
  const inuitElement = document.querySelector(
    '#quartech_inukinuitsharepercentage'
  );
  const inuitElementValue = $(inuitElement).val();
  // @ts-ignore
  const inuitPercentage = parseFloat(inuitElementValue);
  indigenousTotal += !!inuitPercentage && inuitPercentage;

  // Métis share percentage
  const metisElement = document.querySelector('#quartech_mtissharepercentage');
  const metisElementValue = $(metisElement).val();
  // @ts-ignore
  const metisPercentage = parseFloat(metisElementValue);
  indigenousTotal += !!metisPercentage && metisPercentage;

  // Indigenous - Not specified share percentage
  const notSpecifiedElement = document.querySelector(
    '#quartech_indigenoussharepercentage'
  );
  const notSpecifiedElementValue = $(notSpecifiedElement).val();
  // @ts-ignore
  const notSpecifiedPercentage = parseFloat(notSpecifiedElementValue);
  indigenousTotal += !!notSpecifiedPercentage && notSpecifiedPercentage;

  // Women share percentage
  const womenElement = document.querySelector('#quartech_womensharepercentage');
  const womenElementValue = $(womenElement).val();
  // @ts-ignore
  const womenPercentage = parseFloat(womenElementValue);
  womenTotal += !!womenPercentage && womenPercentage;

  // Youth share percentage
  const youthElement = document.querySelector(
    '#quartech_youth40orundersharepercentage'
  );
  const youthElementValue = $(youthElement).val();
  // @ts-ignore
  const youthPercentage = parseFloat(youthElementValue);
  youthTotal += !!youthPercentage && youthPercentage;

  // Non-Indigenous, non-women, non-youth share percentage
  const nonElement = document.querySelector(
    '#quartech_nonindiginousnonwomennonyouthshare'
  );
  const nonElementValue = $(nonElement).val();
  // @ts-ignore
  const nonPercentage = parseFloat(nonElementValue);
  indigenousTotal += !!nonPercentage && nonPercentage;
  womenTotal += !!nonPercentage && nonPercentage;
  youthTotal += !!nonPercentage && nonPercentage;

  // Unable to answer/identify share percentage
  const unableToAnswerElement = document.querySelector(
    '#quartech_unabletoansweridentifysharepercentage'
  );
  const unableToAnswerElementValue = $(unableToAnswerElement).val();
  // @ts-ignore
  const unableToAnswerPercentage = parseFloat(unableToAnswerElementValue);
  indigenousTotal += !!unableToAnswerPercentage && unableToAnswerPercentage;
  womenTotal += !!unableToAnswerPercentage && unableToAnswerPercentage;
  youthTotal += !!unableToAnswerPercentage && unableToAnswerPercentage;

  let validationErrorHtml = '';
  const genericErrorMsg =
    'Please check your answers. The total of shares held by';
  const errorMessage = 'should NOT add up to more than 100%';
  if (indigenousTotal > 100) {
    validationErrorHtml += `<div><span>${genericErrorMsg} Indigenous owners + Not-Indigenous/Not-Women/Not-Youth + Unable to answer<span style="color:red;"> ${errorMessage}</span></div>`;
  }
  if (womenTotal > 100) {
    validationErrorHtml += `<div><span>${genericErrorMsg} Women owners + Not-Indigenous/Not-Women/Not-Youth + Unable to answer<span style="color:red;"> ${errorMessage}</span></div>`;
  }
  if (youthTotal > 100) {
    validationErrorHtml += `<div><span>${genericErrorMsg} Youth owners + Not-Indigenous/Not-Women/Not-Youth owners + Unable to answer<span style="color:red;"> ${errorMessage}</span></div>`;
  }
  return validationErrorHtml;
}
