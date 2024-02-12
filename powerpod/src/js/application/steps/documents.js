import { getProgramAbbreviation } from "../../common/program.ts";

export function customizeDocumentsStep() {
  const programAbbreviation = getProgramAbbreviation();

  if (programAbbreviation && programAbbreviation.includes("ABPP")) {
    let documentsHtml = "";
    if (programAbbreviation === "ABPP1") {
      documentsHtml =
        '<div><div>Please Choose or Drag &amp; Drop files to the grey box below to upload the following documents as attachments (as applicable)</div><ul><li>Event/training budget (if not outlined in Deliverables & Budget tab)​</li><li>Verification of the last year of farming income (T2042, T1273, or Schedule 125 – Farm Revenue) detailing sales by commodity revenue code) or business income if applying as a food processor</li><li>Direct Deposit Application (template available on program webpage)</li></ul><div>Please ensure you have the correct files before clicking “Next” on the application. If you move to the next stage of the application you can no longer delete uploaded files. However, you can always add new files.</div><div>If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").</div></div>';
    } else {
      documentsHtml =
        '<div><div>Please Choose or Drag &amp; Drop files to the grey box below to upload the following documents as attachments (as applicable)</div><ul><li>Project budget</li><li title="Consultant resume outlining any educational accomplishments and relevant certifications">Consultant resume</li><li>Supporting consultant resume (if applicable)</li><li>Verification of the last year of farming income</li><li>Direct Deposit Application (template available on program webpage)</li></ul><div>Please ensure you have the correct files before clicking “Next” on the application. If you move to the next stage of the application you can no longer delete uploaded files. However, you can always add new files.</div><div>If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").</div></div>';
    }
    const existingDocumentsHtml = document.querySelector(
      "#EntityFormView > div.tr > div > div.control > div"
    );
    $(existingDocumentsHtml).replaceWith(documentsHtml);
  }
}