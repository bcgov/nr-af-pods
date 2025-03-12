import { configureFields } from '../../common/fieldConfiguration.js';
import {
  addTextAboveField,
  hideFieldRow,
  hideFieldsAndSections,
} from '../../common/html.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import { hidePageDescription } from '../../common/sections.js';

export function customizeDeclarationConsentStep(programData) {
  configureFields();
  hideFieldsAndSections(false);
  const programAbbreviation = getProgramAbbreviation();
  if (programAbbreviation === 'VVTS' || programAbbreviation === 'TFCR') {
    hidePageDescription(true);
  }
  if (programAbbreviation !== 'TFCR') {
    addConsent(programData?.quartech_applicantportalprogramname);
  } else {
    addConsentForTFCR(programData?.quartech_applicantportalprogramname);
  }

  if (programAbbreviation.includes('KTTP')) {
    hideFieldRow({
      fieldName: 'quartech_declarationandconsent',
      doNotBlank: true,
    });
    addTextAboveField(
      'quartech_declarationandconsent',
      'Testimonials may be used in program reporting, promotional materials, or shared publicly if funding is awarded. Do you consent to providing a written testimonial (with 1 to 3 high-quality photos, if possible) once your project has been completed?'
    );
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
