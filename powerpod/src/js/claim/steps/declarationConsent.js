import { hideFieldsAndSections } from '../../common/html.js';
import { getProgramData } from '../../common/program.ts';

export function customizeDeclarationConsentStep() {
  hideFieldsAndSections(false);
  addConsent();
}

function addConsent() {
  const programName = getProgramData()?.quartech_applicantportalprogramname;
  const programNameTag = '%%ProgramName%%';

  let htmlConsent = `
    <div style='font-style: italic;'>
      <span>BY SUBMITTING THIS CLAIM FOR PAYMENT FORM TO %%ProgramName%% (the "Program"), I:</span>
      <u style='text-decoration:none;'>
          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
          <li>declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this claim for payment form and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
          <li>acknowledge the information provided on this claim for payment and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
          <li>understand that failing to comply with all application requirements may delay the processing of the application or make the applicant ineligible to receive funding under the Program;</li>
          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>
          <li>understand that the Program covers costs up to the maximum Approved amount. Any additional fees over and above the approved amount are the responsibility of the applicant and will not be covered by the B.C. Ministry of Agriculture and Food.</li>
          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
      </u>
      <br/>
  </div>`;
  htmlConsent = htmlConsent.replace(programNameTag, programName);

  let consentDiv = document.createElement('div');
  consentDiv.innerHTML = htmlConsent;

  const applicantDeclarationSection = $(
    "[data-name='applicantDeclarationSection']"
  );

  $("[data-name='applicantDeclarationSection']").parent().prepend(consentDiv);
}
