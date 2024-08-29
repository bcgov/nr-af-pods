import { addDocumentsStepText } from '../../common/documents.ts';
import { configureFields } from '../../common/fieldConfiguration.js';
import { Logger } from '../../common/logger.js';
import { getProgramAbbreviation } from '../../common/program.ts';

const logger = Logger('steps/documents');

export function customizeDocumentsStep() {
  const programAbbreviation = getProgramAbbreviation();
  logger.info({
    fn: customizeDocumentsStep,
    message: `Start customizing documents step`,
  });
  if (
    programAbbreviation.includes('ABPP') ||
    programAbbreviation === 'NEFBA2' ||
    programAbbreviation === 'VLB' ||
    programAbbreviation.includes('KTTP')
  ) {
    addDocumentsStepText();
  }
  configureFields();

  logger.info({
    fn: customizeDocumentsStep,
    message: `Configuring documents label for programAbbreviation: ${programAbbreviation}`,
  });

  // if (programAbbreviation && programAbbreviation.includes('ABPP')) {
  //   let documentsHtml = '';
  //   if (programAbbreviation === 'ABPP1') {
  //     documentsHtml = `
  //       <div>
  //         <br><br>
  //         <ul>
  //           <li>Event/training budget (if not outlined in Deliverables & Budget tab)</li>
  //           <li>
  //             Verification of the last year of farming income (T2042, T1273, or Schedule 125 - 
  //             Farm Revenue) detailing sales by commodity revenue code) or business income 
  //             if applying as a food processor
  //           </li>
  //           <li>Direct Deposit Application (template available on program webpage)</li>
  //         </ul>
  //       </div>
  //     `;
  //   }
  //   if (programAbbreviation === 'ABPP2') {
  //     documentsHtml = `
  //       <div>
  //         <br><br>
  //         <ul>
  //           <li>Project budget</li>
  //           <li 
  //             title="Consultant resume outlining any educational accomplishments and relevant certifications"
  //           >
  //             Consultant resume
  //           </li>
  //           <li>Supporting consultant resume (if applicable)</li>
  //           <li>Verification of the last year of farming income</li>
  //           <li>Direct Deposit Application (template available on program webpage)</li>
  //         </ul>
  //       </div>
  //     `;
  //   }
  //   const fileUploadLabel = document.querySelector(
  //     '#quartech_relatedquotesandplans_label'
  //   );
  //   logger.info({
  //     fn: customizeDocumentsStep,
  //     message: `Setting documents label html for fileUploadLabel: ${fileUploadLabel}`,
  //   });
  //   // @ts-ignore
  //   $(fileUploadLabel).after(documentsHtml);
  // }
}
