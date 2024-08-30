import { Logger } from './logger.js';
import { POWERPOD, doc } from './constants.js';
import {
  deleteDocumentData,
  getDocumentsData,
  postDocumentData,
} from './fetch.js';
import { getCurrentUser } from './dynamics.js';
import { getCurrentTimeUTC } from './date.js';
import { getContactName } from './contacts.js';
import { getFieldLabel } from './html.js';
import { readFileAsBase64 } from './file.js';
import { getFormId } from './form.js';
import { getFormType } from './applicationUtils.js';
import { getGlobalConfigData } from './config.js';
import { getProgramAbbreviation } from './program.js';

const logger = Logger('common/documents');

POWERPOD.docUtils = {
  getFilenamesFromDocData,
  getFilenamesFromFieldData,
  compareDocDataToUploadFieldData,
  processDocumentsData,
  deleteDocuments,
  generateDocumentSubject,
  postDocument,
};

// once a document is uploaded, it will come with the relevant data below:
export type UploadedDoc = {
  filename: string;
  filesize: number; // size in bytes
  mimetype: string; // "image/png"
  status: string; // 'pending', 'failed', 'uploaded', 'deleting'
  subject: string | null; // "Note created on mm/dd/yyyy hh:mm:ss am UTC by John Doe [contact:${contactId}]"
  modifiedon: string | null; // formatted date time "5/1/2024 6:08 PM"
  documentbody: string | null;
  annotationid: string | null; // unique uuid for doc
  fileId: string | null; // unique identifier assigned by us upon selecting a file
};

export type UploadedDocBlob = {
  annotationid: string; // unique uuid for doc
  subject: string; // "Note created on mm/dd/yyyy hh:mm:ss am UTC by John Doe [contact:${contactId}]"
  filename: string;
  filesize: number; // size in bytes
  'modifiedon@OData.Community.Display.V1.FormattedValue': string; // formatted date time "5/1/2024 6:08 PM"
  documentbody: string | null;
  mimetype: string; // "image/png"
};

// before doc upload, documents are considered of type "File"
export type RawFile = {
  lastModified: number; // timestamp relative to epoch
  lastModifiedDate: Date; // Date object created
  name: string;
  type: string; // mimetype e.g. "image/png"
  webkitRelativePath: string;
  size: number; // size in bytes
};

export const MAXIMUM_FILE_SIZE_IN_KB = 15360;
export const MAXIMUM_FILE_SIZE_TEXT = '15MB';
export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
];
// not used here, but used in backend Dynamics config
// keeping here for reference as well:
export const MINIFIED_MIME_TYPES = [
  'text/csv',
  'application/msword',
  'application/vnd*',
  'application/pdf',
  'image/*',
];
export const ALLOWED_FILE_TYPES = [
  '.csv',
  '.doc',
  '.docx',
  '.odt',
  '.pdf',
  '.xls',
  '.xlsx',
  '.ods',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.tif',
];

export const CLAIM_FILE_UPLOAD_FIELDS = [
  'quartech_completedmeetingandserviceprovisionlog',
  'quartech_copyofconsultantfinalreportorbusinessplan',
  'quartech_invoices',
  'quartech_proofofpayment',
  'quartech_photosordocsofpurchase',
  'quartech_businessplan',
  'quartech_growthstrategy',
  'quartech_activityreport',
];
export const APPLICATION_FILE_UPLOAD_FILES = [
  'quartech_partialbudget',
  'quartech_relatedquotesandplans',
];

export function getFilenamesFromDocData(data, fieldName = 'ALL FIELDS') {
  const { value } = data;
  const filenames = value.map((item) => item.filename);

  logger.info({
    fn: getFilenamesFromDocData,
    message: `Returning filenames string from documents data for fieldName: ${fieldName}`,
    data: { data, filenames },
  });

  return filenames;
}

export function getFilenamesFromFieldData(fieldName) {
  const inputString = $(`#${fieldName}`)?.val();
  const regex = /^(.*?)\s+\(\d+\.\d+\s+KB\)$/gm;
  const fileNames = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    fileNames.push(match[1]);
  }

  const filePath = $(`#${fieldName}_AttachFile`)?.val();
  const fileName = filePath?.substring(filePath?.lastIndexOf('\\') + 1);

  if (fileName && !fileNames.includes(fileName)) {
    fileNames.push(fileName);
  }

  logger.info({
    fn: getFilenamesFromFieldData,
    message: `Returning filename list from upload field content for fieldName: ${fieldName}`,
    data: { fileNames },
  });

  return fileNames;
}

export function compareDocDataToUploadFieldData(fieldName, data) {
  const fieldFilenames = getFilenamesFromFieldData(fieldName);
  const docFilenames = getFilenamesFromDocData(data, fieldName);

  const verifiedUploadedDocs = [];
  const unverifiedDocs = [];

  fieldFilenames.forEach((fileName) => {
    if (docFilenames.includes(fileName)) {
      verifiedUploadedDocs.push(fileName);
    } else {
      unverifiedDocs.push(fileName);
    }
  });

  return [verifiedUploadedDocs, unverifiedDocs];
}

export function formatBytes(
  bytes,
  decimals = 2,
  forceFormat = null,
  returnFloat = false
) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let i;

  if (forceFormat && sizes.includes(forceFormat)) {
    i = sizes.indexOf(forceFormat);
  } else {
    i = Math.floor(Math.log(bytes) / Math.log(k));
  }

  const number = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  if (returnFloat) {
    return number;
  }

  return `${number} ${sizes[i]}`;
}

function mapDataToUploadedDoc(docData: UploadedDocBlob): UploadedDoc {
  const { annotationid, subject, filename, filesize, documentbody, mimetype } =
    docData;

  // returns format "4/25/2024 7:04 PM"
  const modifiedon =
    docData['modifiedon@OData.Community.Display.V1.FormattedValue'];

  // here we will parse subject and extract the fieldName it was assigned to

  return {
    annotationid,
    subject,
    filename,
    filesize,
    modifiedon,
    documentbody,
    mimetype,
    status: 'uploaded',
  };
}

export function readFileInputStr(
  fileInputStr: string,
  docs: UploadedDoc[]
): UploadedDoc[] {
  const fileStrings = fileInputStr.split('\n'); // Splitting fileInputStr into an array of individual file strings

  const regexFileId = /\[fileId:(.*?)\]/; // Regex to extract fileId values within [fileId:...] brackets

  const matchingDocs: UploadedDoc[] = [];

  // Iterating over each file string to extract fileId values and find matching documents
  fileStrings.forEach((fileString) => {
    let fileIdMatch = fileString.match(regexFileId);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      const matchingDoc = docs.find((doc) => doc.subject.includes(fileId));
      if (matchingDoc) {
        matchingDocs.push(matchingDoc);
      }
    } else {
      // Extract filename and filesize from the file string
      const endIndex = fileString.lastIndexOf(')'); // Find the last closing parenthesis
      const startIndex = fileString.lastIndexOf('(', endIndex); // Find the preceding opening parenthesis
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const filename = fileString.substring(0, startIndex).trim(); // Extract filename
        logger.info({
          fn: readFileInputStr,
          message: `Found filename: ${filename}`,
        });
        const matchingDoc = docs.find((doc) => doc.filename === filename);
        if (matchingDoc) {
          matchingDocs.push(matchingDoc);
        }
      }
    }
  });

  logger.info({
    fn: readFileInputStr,
    message: `Found ${matchingDocs?.length ?? 0} matching docs`,
    data: { fileInputStr, docs, matchingDocs },
  });

  return matchingDocs;
}

export function generateFileInputStr(docs: UploadedDoc[]): string {
  logger.info({
    fn: generateFileInputStr,
    message: 'Start generating file input str',
    data: { docs },
  });

  let inputStr = '';

  docs.forEach((doc) => {
    const { filename, fileId, filesize, status } = doc;

    if (status !== 'uploaded') {
      logger.warn({
        fn: generateFileInputStr,
        message: `File not uploaded yet, filename: ${filename}`,
        data: { doc },
      });
      return;
    }
    const sizeStr = formatBytes(filesize);
    let fileStr = `${filename} (${sizeStr})`;
    if (fileId) {
      fileStr += ` [fileId:${fileId}]`;
    }
    inputStr += fileStr + '\n';
  });

  logger.info({
    fn: generateFileInputStr,
    message: 'Successfully generated file input str',
    data: { docs, inputStr },
  });
  return inputStr;
}

export async function generateDocumentSubject(
  file: RawFile,
  fieldName: string = ''
): Promise<{ subject: string; fileId: string }> {
  const { name, size, type } = file;

  const filename = convertExtensionToLowerCase(name);

  const { contactId } = getCurrentUser();

  if (!contactId) {
    logger.error({
      fn: generateDocumentSubject,
      message: 'Could not find contactId for user',
    });
    return;
  }

  let fullname = 'Storybook User';
  if (window.location.hostname !== 'localhost') {
    fullname = await getContactName(contactId);
  }

  if (!fullname) {
    logger.error({
      fn: generateDocumentSubject,
      message: 'Could not find fullname for user',
    });
    return;
  }

  const formattedTimeUTC = getCurrentTimeUTC();
  const fileId = crypto.randomUUID();

  let subject = `${filename} (${formatBytes(
    size
  )}) [fileId:${fileId}] uploaded on ${formattedTimeUTC} by ${fullname} [contactId:${contactId}]`;

  if (fieldName && fieldName.length) {
    const label = getFieldLabel(fieldName);
    subject += ` for field: ${label} [field:${fieldName}]`;
  }

  return { subject, fileId };
}

export async function postDocument(file: RawFile, fieldName: string) {
  logger.info({
    fn: postDocument,
    message: `Start uploading file for fieldName: ${fieldName}`,
    data: { file, fieldName },
  });
  const { name, type } = file;
  const filename = convertExtensionToLowerCase(name);
  const documentbody = await readFileAsBase64(file);

  const { subject, fileId } = await generateDocumentSubject(file, fieldName);

  const formId = getFormId();

  if (!documentbody?.length || !subject?.length || !formId?.length) {
    logger.error({
      fn: postDocument,
      message: `Failed to postDocument for fieldName: ${fieldName}`,
      data: { file, fieldName, documentbody, subject, formId },
    });
    return;
  }

  const formType = getFormType();

  const payload = {
    formId,
    subject,
    filename,
    documentbody,
    mimetype: type,
    formType,
  };

  logger.info({
    fn: postDocument,
    message: `Posting document for fieldName: ${fieldName}`,
    data: { payload, file, fieldName, formType },
  });

  const response = await postDocumentData(payload);

  if (!response || response.jqXHR?.status !== 204) {
    logger.error({
      fn: postDocument,
      message: 'Failed to post document',
      data: { payload, response, file, fieldName },
    });
    return;
  }

  logger.info({
    fn: postDocument,
    message: 'Successfully posted document',
    data: { payload, response, file, fieldName },
  });
}

export function processDocumentsData(data) {
  logger.info({
    fn: processDocumentsData,
    message: 'Start processing retrieved documents data',
    data: { data },
  });

  const { value: documentsDataArray } = data;

  const documents = documentsDataArray.map((docData) =>
    mapDataToUploadedDoc(docData)
  );

  logger.info({
    fn: processDocumentsData,
    message: 'Successfully parsed documents data',
    data: { documents },
  });

  return documents;
}

export async function deleteDocuments(formId, documents = []) {
  if (!documents || !documents.length) {
    logger.warn({
      fn: deleteDocuments,
      message: 'No documents found to delete',
      data: { formId },
    });
    return;
  }

  const startTime = Date.now();
  logger.info({
    fn: deleteDocuments,
    message: `Start deleting all documents for formId: ${formId}`,
    data: { formId, documents },
  });

  documents.forEach(async (doc) => {
    const { annotationid: annotationId } = doc;
    const startTime = Date.now();
    logger.info({
      fn: deleteDocuments,
      message: `Start deleting document for for annotationId: ${annotationId}`,
      data: { formId, doc },
    });
    const response = await deleteDocumentData({
      annotationId,
      returnData: true,
    });
    if (!response || response.jqXHR?.status !== 204) {
      logger.error({
        fn: deleteDocuments,
        message: `Failed to delete document for annotationId: ${annotationId}`,
        data: { response, doc, formId, annotationId },
      });
      return;
    }
    const elapsedTime = Date.now() - startTime;
    logger.info({
      fn: deleteDocuments,
      message: `Successfully deleted document for annotationId: ${annotationId}, took ${elapsedTime} ms`,
      data: { response, doc, formId, annotationId },
    });
  });

  const elapsedTime = Date.now() - startTime;
  logger.info({
    fn: deleteDocuments,
    message: `Successfully deleted all documents for formId: ${formId}, took ${elapsedTime} ms`,
    data: { formId, documents },
  });
}

export function validateFileUpload(file) {
  logger.info({
    fn: validateFileUpload,
    message: 'Validating file upload file',
    data: { file },
  });
  const re = /(?:\.([^.]+))?$/; // regex to pull file extension string
  const ext = re.exec(file.name)[1]?.toLowerCase();

  // note: microsoft seems to use binary system for byte conversion
  const fileSizeInKB = formatBytes(file.size, 2, 'KB', true);

  const isValidFileSize = fileSizeInKB <= MAXIMUM_FILE_SIZE_IN_KB; // 10 MB size limit
  const isValidFileType = ALLOWED_FILE_TYPES.includes(`.${ext}`);

  const isValidUpload = isValidFileSize && isValidFileType;

  if (isValidUpload) {
    return true;
  }

  let alertStr = '';
  if (!isValidFileType && !isValidFileSize) {
    alertStr = `Selected file(s) do not match the allowed file extensions and exceed file size limit of ${MAXIMUM_FILE_SIZE_TEXT}. Please upload a valid file size & file type of: ${ALLOWED_FILE_TYPES.join(
      ', '
    )}.`;
  } else if (!isValidFileType) {
    alertStr = `Selected file(s) do not match the allowed file extensions. Please upload a file type of: ${ALLOWED_FILE_TYPES.join(
      ', '
    )}.`;
  } else if (!isValidFileSize) {
    alertStr = `Selected file(s) exceeds the allowed file upload limit of ${MAXIMUM_FILE_SIZE_TEXT}. Please upload a file with a size of ${MAXIMUM_FILE_SIZE_TEXT} or less.`;
  }

  if (alertStr) {
    alert(alertStr);
    return false;
  }

  return false;
}

export function addDocumentsStepText(
  overrideWithElement = null,
  overrideWithPrepend = false
) {
  const allowedDocumentsTooltipText =
    getGlobalConfigData()?.AllowedDocumentsTooltipText;

  if (!allowedDocumentsTooltipText) {
    logger.error({
      fn: addDocumentsStepText,
      message: 'Failed to fetch AllowedDocumentsTooltipText',
    });
  }
  if (!document.querySelector('#supportingDocumentationNote')) {
    let supportingDocumentationNoteHtmlContent = ``;

    const programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation.includes('ABPP')) {
      if (programAbbreviation === 'ABPP1') {
        supportingDocumentationNoteHtmlContent = `
          <style>
            sl-tooltip::part(body) {
              font-size: 1.2rem;
            }
          </style>
          <div id="supportingDocumentationNote" style="padding-bottom: 20px">
            You <b>MUST</b> Attach the following in ${
              allowedDocumentsTooltipText
                ? `<sl-tooltip>
              <div slot="content">${allowedDocumentsTooltipText}</div>
              <a href="" style="font-size: 15px">supported file formats</a>. </sl-tooltip
            >`
                : 'supported file formats.'
            } <br /><br />
            <ul>
              <li>Event/training budget</li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/agriculture-and-seafood/programs/agribusiness-planning/learning_action_plan_fillable_form.docx"
                  style="font-size: unset; color:blue; margin-left: 0px;"
                  target="_blank"
                >
                Learning Action Plan
                </a>
              </li>
              <li>
                Verification of farming income - Canada Revenue Agency (CRA) Summary/Proof of Gross Income as last reported to the CRA
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/agriculture-and-seafood/programs/agribusiness-planning/direct_deposit_application.pdf"
                  style="font-size: unset; color:blue; margin-left: 0px;"
                  target="_blank"
                >
                  Direct Deposit Application
                </a>
              </li>
              <li>
                Copy of Void Cheque and/or Bank Confirmation Letter confirming bank account information of the business
              </li>
            </ul>
            <br />
            Drag and drop files here or Choose Files <b>up to 15MB each.</b>
          </div>
        `;
      } else if (programAbbreviation === 'ABPP2') {
        supportingDocumentationNoteHtmlContent = `
          <style>
            sl-tooltip::part(body) {
              font-size: 1.2rem;
            }
          </style>
          <div id="supportingDocumentationNote" style="padding-bottom: 20px">
            You <b>MUST</b> Attach the following in ${
              allowedDocumentsTooltipText
                ? `<sl-tooltip>
              <div slot="content">${allowedDocumentsTooltipText}</div>
              <a href="" style="font-size: 15px">supported file formats</a>. </sl-tooltip
            >`
                : 'supported file formats.'
            } <br /><br />
            <ul>
              <li>
                <a
                  href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/agriculture-and-seafood/programs/agribusiness-planning/letter_of_engagement_for_services_fillable_form.docx"
                  style="font-size: unset; color:blue; margin-left: 0px;"
                  target="_blank"
                >
                Letter of engagement
                </a>
              </li>
              <li>
                Consultant(s) resume(s)
              </li>
              <li>
                Verification of farming income - Canada Revenue Agency (CRA) Summary/Proof of Gross Income as last reported to the CRA
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/agriculture-and-seafood/programs/agribusiness-planning/direct_deposit_application.pdf"
                  style="font-size: unset; color:blue; margin-left: 0px;"
                  target="_blank"
                >
                  Direct Deposit Application
                </a>
              </li>
              <li>
                Copy of Void Cheque and/or Bank Confirmation Letter confirming bank account information of the business
              </li>
            </ul>
            <br />
            Drag and drop files here or Choose Files <b>up to 15MB each.</b>
          </div>
        `;
      }
    } else {
      supportingDocumentationNoteHtmlContent = `
    <style>
      sl-tooltip::part(body) {
        font-size: 1.2rem;
      }
    </style>
    <div id="supportingDocumentationNote" style="padding-bottom: 20px;">
      Please choose or drag & drop files to the box below to upload the following documents as attachments (as applicable).
      <br /><br />
      You can upload a file up to 15MB each in the 
      ${
        allowedDocumentsTooltipText
          ? `<sl-tooltip>
          <div slot="content">
            ${allowedDocumentsTooltipText}
          </div>
          <a href="" style="font-size: 15px">supported file formats</a>.
        </sl-tooltip>`
          : 'supported file formats.'
      }
    </div>`;
    }

    if (!overrideWithPrepend) {
      (
        overrideWithElement ??
        $('fieldset[aria-label="Supporting Documents"] > legend')
      ).after(supportingDocumentationNoteHtmlContent);
    } else {
      (
        overrideWithElement ??
        $('fieldset[aria-label="Supporting Documents"] > legend')
      ).prepend(supportingDocumentationNoteHtmlContent);
    }
  }
}

export function separateFileNameAndExtension(fileName) {
  // Split the file name by the last dot
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === -1) {
    // No dot found, return the original fileName and an empty extension
    return {
      name: fileName,
      extension: '',
    };
  }

  // Extract the file name and extension
  const name = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex);

  return {
    name: name,
    extension: extension,
  };
}

export function convertExtensionToLowerCase(fileName) {
  // Split the file name by the last dot
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === -1) {
    // No dot found, return the original fileName
    return fileName;
  }

  // Extract the file name and extension
  const name = fileName.substring(0, lastDotIndex);
  let extension = fileName.substring(lastDotIndex);

  // Convert the extension to lowercase
  extension = extension.toLowerCase();

  // Return the file name with the converted extension
  return name + extension;
}

export function cleanString(inputString) {
  // Remove anything inside the square brackets and the brackets themselves
  inputString = inputString.replace(/\[.*?\]/g, '');
  // Remove extra spaces but retain newline characters
  inputString = inputString
    .replace(/[ \t]+/g, ' ')
    .replace(/ \n/g, '\n')
    .replace(/\n /g, '\n');
  // Trim whitespace at the start and end
  return inputString.trim();
}
