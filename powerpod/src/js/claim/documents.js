import { Logger } from '../common/logger.js';

const logger = new Logger('claim/documents');

const MAXIMUM_FILE_SIZE_IN_KB = 15360;
const ALLOWED_MIME_TYPES = [
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
const MINIFIED_MIME_TYPES = [
  'text/csv',
  'application/msword',
  'application/vnd*',
  'application/pdf',
  'image/*',
];
const ALLOWED_FILE_TYPES = [
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
  'quartech_businessplan',
  'quartech_growthstrategy',
];
const FILE_UPLOAD_ID_SUFFIX = '_AttachFile';

// TODO: move to document step setup
// $(document).ready(function () {
//   addFileUploadControls(CLAIM_FILE_UPLOAD_FIELDS);
// });

export function addFileUploadControls(fieldsForFileUploadControls) {
  logger.info({
    fn: addFileUploadControls,
    message: 'Start initializing file upload controls',
    data: {
      fieldsForFileUploadControls,
    },
  });
  fieldsForFileUploadControls.forEach((fieldName) => {
    addFileUpload(fieldName);

    disableField(fieldName);
  });

  addTitleToNotesControl();
}

function addTitleToNotesControl() {
  $(`#notescontrol`).prepend(
    '<div><h4>Documents Previously Uploaded</h4></div>'
  );
}

function disableField(fieldName) {
  $(`#${fieldName}`).attr('readonly', 'readonly');
}

// binary conversion of bytes
function formatBytes(bytes, decimals = 2, forceFormat, returnFloat = false) {
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

function validateFileUpload(file) {
  const re = /(?:\.([^.]+))?$/; // regex to pull file extension string
  const ext = re.exec(file.name)[1];

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
    alertStr = `Selected file(s) do not match the allowed file extensions and exceed file size limit of 10MB. Please upload a valid file size & file type of: ${ALLOWED_FILE_TYPES.join(
      ', '
    )}.`;
  } else if (!isValidFileType) {
    alertStr = `Selected file(s) do not match the allowed file extensions. Please upload a file type of: ${ALLOWED_FILE_TYPES.join(
      ', '
    )}.`;
  } else if (!isValidFileSize) {
    alertStr =
      'Selected file(s) exceeds the allowed file upload limit of 10MB. Please upload a file with a size of 10MB or less.';
  }

  if (alertStr) {
    alert(alertStr);
    return false;
  }

  return false;
}

function addFileUpload(toFieldId) {
  const fieldFileUploadId = toFieldId + FILE_UPLOAD_ID_SUFFIX;
  logger.info({
    fn: addFileUpload,
    message: `Start addFileUpload toFieldId: ${toFieldId}`,
    data: {
      toFieldId,
      fieldFileUploadId,
    },
  });
  const fileUploadHtml = `<input type="file" multiple="multiple" id="${fieldFileUploadId}" accept="${ALLOWED_FILE_TYPES.join(
    ','
  )}" aria-label="Attach files..." style='height: 50px; background: lightgrey; width: 100%; padding: 10px 0 0 10px;'>`;

  const divControl = $(`#${toFieldId}`).parent();

  divControl.append(fileUploadHtml);

  $('#AttachFile').attr(
    'accept',
    ALLOWED_FILE_TYPES.join(',') + ',' + ALLOWED_MIME_TYPES.join(',')
  );
  $(`#${fieldFileUploadId}`).change(function (e) {
    const targetFieldId = fieldFileUploadId.replace(FILE_UPLOAD_ID_SUFFIX, '');

    let chosenFiles = '';
    for (const i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const isValidFileUpload = validateFileUpload(file);

      if (isValidFileUpload) {
        chosenFiles += `${file.name} (${formatBytes(file.size)})\n`;
        $(`#${targetFieldId}`).val(chosenFiles);
      } else {
        $(`#${fieldFileUploadId}`).val('');
        $(`#${targetFieldId}`).val('');
      }
    }

    updateOobFileUpload();
  });
}

function updateOobFileUpload() {
  let selectedFiles = [];

  CLAIM_FILE_UPLOAD_FIELDS.forEach((fieldName) => {
    let fileUploadId = fieldName + FILE_UPLOAD_ID_SUFFIX;

    const fieldFileUploadCtr = document.getElementById(fileUploadId);

    for (const i = 0; i < fieldFileUploadCtr.files.length; i++) {
      const file = fieldFileUploadCtr.files[i];
      selectedFiles.push(file);
    }
  });

  const fileList = fileListFrom(selectedFiles);

  const attachFileCtr = document.getElementById('AttachFile');
  attachFileCtr.onchange = console.log;
  attachFileCtr.files = fileList;

  logger.info({
    fn: updateOobFileUpload,
    message: 'Set attach file control files attribute, attachFileCtr.files',
    data: { fileList },
  });
}

/** @params {File[]} files - Array of files to add to the FileList */
function fileListFrom(files) {
  const b = new ClipboardEvent('').clipboardData || new DataTransfer();

  for (const file of files) b.items.add(file);
  return b.files;
}
