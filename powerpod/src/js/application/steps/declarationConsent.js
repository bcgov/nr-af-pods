import {
  configureFields,
  setRequiredField,
} from '../../common/fieldConfiguration.js';
import {
  validateStepField,
  validateStepFields,
} from '../../common/fieldValidation.js';
import {
  addTextAboveField,
  hideFieldRow,
  hideFieldsAndSections,
} from '../../common/html.js';
import { Logger } from '../../common/logger.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { hidePageDescription } from '../../common/sections.js';
import store from '../../store/index.js';

const logger = Logger('application/steps/declarationConsent');

export function customizeDeclarationConsentStep(programData) {
  configureFields();
  hideFieldsAndSections(false);
  const programAbbreviation = getProgramAbbreviation();
  if (programAbbreviation === 'VVTS' || programAbbreviation === 'TFCR') {
    hidePageDescription(true);
  }
  if (
    programAbbreviation.includes('KTTP') ||
    programAbbreviation === 'TFCCRF'
  ) {
    // addConsentForKTTP(programData?.quartech_applicantportalprogramname);
    hideFieldRow({
      fieldName: 'quartech_consenttotestimonials',
    });

    // addTextAboveField('quartech_consenttotestimonials', 'Testimonials may be used in program reporting, promotional materials, or shared publicly if funding is awarded. Do you consent to providing a written testimonial (with 1 to 3 high-quality photos, if possible) once your project has been completed?')
  }
  if (programAbbreviation === 'TFCCRF') {
    addConsentForTFCCRF(programData?.quartech_applicantportalprogramname);
  } else if (programAbbreviation !== 'TFCR') {
    addConsent(programData?.quartech_applicantportalprogramname);
  } else {
    addConsentForTFCR(programData?.quartech_applicantportalprogramname);
  }

  if (programAbbreviation === 'TFCCRF') {
    setRequiredField('quartech_signature');
    validateStepFields();
    styleSignatureDivs();
  }
}

function styleSignatureDivs(retries = 10, delay = 500) {
  const divs = document.querySelectorAll(
    '[id^="SignatureControl"][id$="_outer"]'
  );

  if (divs.length === 0 && retries > 0) {
    setTimeout(() => styleSignatureDivs(retries - 1, delay), delay);
    return;
  }

  if (divs.length === 0) {
    console.warn('No matching SignatureControl divs found after retrying.');
    return;
  }

  divs.forEach((div) => {
    if (div?.style) {
      div.style.border = '1px solid black';
      div.style.maxWidth = '500px';
    }
  });

  const confirmButton = document.querySelector('.confirmButton');
  const confirmButtonText = confirmButton?.querySelector('.confirmButtonTick');
  const clearButton = document.querySelector('.clearButton');
  const clearButtonText = clearButton?.querySelector('.clearButtonCaption');

  if (
    (!confirmButton ||
      !confirmButtonText ||
      !clearButton ||
      !clearButtonText) &&
    retries > 0
  ) {
    setTimeout(() => styleSignatureDivs(retries - 1, delay), delay);
    return;
  }

  if (!confirmButton || !confirmButtonText) {
    console.warn('Confirm button or text not found after retrying.');
  }

  if (!clearButton || !clearButtonText) {
    console.warn('Clear button or text not found after retrying.');
  }

  try {
    // Style Confirm Button
    if (confirmButton && confirmButtonText) {
      confirmButtonText.textContent = 'Save signature';
      confirmButton.style.width = '175px';
      confirmButton.style.borderRadius = '0';
      confirmButton.style.display = 'inline-flex';
      confirmButton.style.justifyContent = 'center';
      confirmButton.style.alignItems = 'center';
      confirmButton.style.padding = '8px 12px';
      confirmButton.style.backgroundColor = '#3E9327';
      confirmButton.style.color = '#FFFFFF';
      confirmButton.style.marginRight = '10px';

      confirmButton.onclick = function () {
        store.dispatch('addFieldData', {
          name: 'quartech_signature',
          signatureSaved: true,
        });

        validateStepField('quartech_signature');
      };
    }

    // Style Clear Button
    if (clearButton && clearButtonText) {
      clearButtonText.textContent = 'Clear';
      clearButton.style.width = '100px';
      clearButton.style.borderRadius = '0';
      clearButton.style.display = 'inline-flex';
      clearButton.style.justifyContent = 'center';
      clearButton.style.alignItems = 'center';
      clearButton.style.padding = '8px 12px';
      clearButton.style.backgroundColor = '#CCCCCC';
      clearButton.style.color = '#000000';
      clearButton.style.marginLeft = '10px';
    }

    // Hide the ::before icon on the confirm button
    const style = document.createElement('style');
    style.textContent = `
      .signatureControl.editmode .inkControl .inkControlCommandBar .confirmButtonTick::before {
        content: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  } catch (e) {
    console.error('Error styling signature buttons:', e);
  }
}

function addConsent(programName) {
  const programNameTag = '%%ProgramName%%';

  let htmlConsent = `<div style='font-style: italic;'>
      <span>BY SUBMITTING THIS APPLICATION FORM TO %%ProgramName%% (the "Program"), I:</span>
      <u style='text-decoration:none;'>
          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
          <li>
              declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this application and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
          <li>acknowledge the information provided on this application form and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
          <li>understand that failing to comply with all application requirements may delay the processing of this application or make the applicant ineligible to receive funding under the Program;</li>
          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>        
          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
      </u>
      <br/>
  </div>`;
  htmlConsent = htmlConsent.replace(programNameTag, programName);

  let div = document.createElement('div');
  div.innerHTML = htmlConsent;

  $("[data-name='declarationAndConsentSection']").parent().prepend(div);

  $('#quartech_declarationandconsent_label').text(
    'I / We agree to the above statement.'
  );
}

function addConsentForTFCCRF(programName) {
  const programNameTag = '%%ProgramName%%';

  let htmlConsent = `<div style='font-style: italic;'>
      <span>BY SUBMITTING THIS APPLICATION FORM TO %%ProgramName%% (the "Program"), I:</span>
      <u style='text-decoration:none;'>
          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
          <li>
              declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this application and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
          <li>acknowledge the information provided on this application form and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
          <li>understand that failing to comply with all application requirements may delay the processing of this application or make the applicant ineligible to receive funding under the Program;</li>
          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>        
          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
          <li>expressly authorizes the Ministry to share basic farm details including contact details and apple acreage with a third party for the purpose of contacting the Applicant regarding participation in a vote on the establishment of a BC Apple Marketing Commission.</li>
      </u>
      <br/>
  </div>`;
  htmlConsent = htmlConsent.replace(programNameTag, programName);

  let div = document.createElement('div');
  div.innerHTML = htmlConsent;

  $("[data-name='declarationAndConsentSection']").parent().prepend(div);

  $('#quartech_declarationandconsent_label').text(
    'I / We agree to the above statement.'
  );
}

function addConsentForKTTP(programName) {
  const programNameTag = '%%ProgramName%%';

  let htmlConsent = `<div style='font-style: italic;'>
      <span>BY SUBMITTING THIS APPLICATION FORM TO %%ProgramName%% (the "Program"), I:</span>
      <u style='text-decoration:none;'>
          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
          <li>
              declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this application and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
          <li>acknowledge the information provided on this application form and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
          <li>understand that failing to comply with all application requirements may delay the processing of this application or make the applicant ineligible to receive funding under the Program;</li>
          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>        
          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
      </u>
      <br/>
      <p>Testimonials may be used in program reporting, promotional materials, or shared publicly if funding is awarded. Do you consent to providing a written testimonial (with 1 to 3 high-quality photos, if possible) once your project has been completed?</p>
  </div>`;
  htmlConsent = htmlConsent.replace(programNameTag, programName);

  let div = document.createElement('div');
  div.innerHTML = htmlConsent;

  $("[data-name='declarationAndConsentSection']").parent().prepend(div);

  $('#quartech_declarationandconsent_label').text(
    'I / We agree to the above statement.'
  );
}

function addConsentForTFCR(programName) {
  const programNameTag = '%%ProgramName%%';

  let htmlConsent = `<div style='font-style: italic;'>
      <span>BY SUBMITTING THIS APPLICATION FORM TO %%ProgramName%% (the "Program"), I:</span>
      <u style='text-decoration:none;'>
          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
          <li>
              declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this application and attachments are true and correct in every respect to the best of my/the applicant's knowledge;</li>
          <li>acknowledge the information provided on this application form and attachments will be used by program staff to assess the applicant's eligibility for funding from the Program;</li>
          <li>understand that failing to comply with all application requirements may delay the processing of this application or make the applicant ineligible to receive funding under the Program;</li>
          <li>represent that I have/the applicant has read and understood the Program Guide and agree(s) to be bound by the Program Guide;</li>
          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Guide, and in this document;</li>
          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>        
          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry and/or a contractor retained by the Ministry to administer the Program under the authority of the Income Tax Act for the purpose of reporting income.</li>
      </u>
      <br/>
  </div>`;
  htmlConsent = htmlConsent.replace(programNameTag, programName);

  let div = document.createElement('div');
  div.innerHTML = htmlConsent;

  $("[data-name='declarationAndConsentSection']").parent().prepend(div);

  $('#quartech_declarationandconsent_label').text(
    'I / We agree to the above statement.'
  );
}
