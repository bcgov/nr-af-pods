import { hideFieldsAndSections } from "../../common/html.js";

export function customizeDeclarationConsentStep(programData) {
  hideFieldsAndSections(false);
  addConsent(programData?.quartech_applicantportalprogramname);
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

  $("[data-name='tab_ApplicationDeclarationandConsent']").parent().prepend(div);
}
