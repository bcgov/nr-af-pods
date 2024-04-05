import { doc } from '../common/constants.js';
import { getFormId } from '../common/form.js';
import {
  addHtmlToSection,
  addHtmlToTabDiv,
  observeChanges,
  observeIframeChanges,
  onDocumentReadyState,
} from '../common/html.js';
import { Logger } from '../common/logger.js';

// @ts-ignore
const logger = new Logger('claim/documents');

const MAXIMUM_FILE_SIZE_IN_KB = 15360;
const MAXIMUM_FILE_SIZE_TEXT = '15MB';
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
  'quartech_activityreport',
];
export const APPLICATION_FILE_UPLOAD_FILES = [
  'quartech_partialbudget',
  'quartech_relatedquotesandplans',
];
const ATTACH_FILE_SUFFIX = '_AttachFile';

export function customizeDocumentsControls(
  fieldsForFileUploadControls,
  context = null
) {
  addFileUploadControls(fieldsForFileUploadControls, context);

  const attachFileLabel = context
    ? // @ts-ignore
      context.querySelector('#AttachFileLabel')
    : document.querySelector('#AttachFileLabel');
  if (attachFileLabel) {
    logger.info({
      fn: addFileUploadControls,
      message: 'Hiding OOB upload control...',
      data: {
        fieldsForFileUploadControls,
        attachFileLabel,
      },
    });
    // @ts-ignore
    attachFileLabel.parentNode.parentNode.parentNode.hidden = true; // hide the oob attach file control.
  }
}

export function addFileUploadControls(
  fieldsForFileUploadControls,
  context = null
) {
  logger.info({
    fn: addFileUploadControls,
    message: 'Start initializing file upload controls',
    data: {
      fieldsForFileUploadControls,
      context,
    },
  });
  fieldsForFileUploadControls.forEach((fieldName) => {
    addFileUpload(fieldName, context);

    disableField(fieldName, context);
  });

  // only execute this if no context is passed
  if (!context) {
    addTitleToNotesControl();
    addDocumentUploadConfirmationIframe();
  }
}

function addTitleToNotesControl() {
  $(`#notescontrol`).prepend(`
    <div>
      <h4>New Files to Upload</h4>
      <style>
        sl-button.huge::part(base) {
          --sl-input-height-medium: 48px;
          font-size: 1.5rem;
        }
      </style>
      <sl-button id="quartechUploadBtn" class="huge" variant="primary" style="width: 100%;" loading disabled>
        Upload new files
      </sl-button>
      <h4>Documents Previously Uploaded</h4>
    </div>
  `);
}

function disableField(fieldName, context = null) {
  if (context) {
    $(context).find(`#${fieldName}`).attr('readonly', 'readonly');
  } else {
    $(`#${fieldName}`).attr('readonly', 'readonly');
  }
}

function calculateScrollHeightForText(text) {
  // Count the number of line breaks in the text
  var lineBreaks = (text.match(/\n/g) || []).length;

  // Calculate the scroll height based on the number of line breaks
  var scrollHeight = 55 + lineBreaks * 21;

  // Return the calculated scroll height
  return scrollHeight;
}

function updateUploadTextAreaFieldHeight(fieldId) {
  logger.info({
    fn: updateUploadTextAreaFieldHeight,
    message: `Update upload text area height of fieldId: ${fieldId}, document in state: ${doc.readyState}`,
  });
  const targetField = $(`#${fieldId}`);
  if (!targetField) {
    logger.error({
      fn: updateOobFileUpload,
      message: `Could not find target field`,
    });
    return;
  }
  const textAreaValue = targetField.val();
  const rawScrollHeight = targetField.prop('scrollHeight');

  if (textAreaValue?.length && rawScrollHeight) {
    const newHeight = targetField.prop('scrollHeight') + 'px';
    targetField.css('height', 'auto').css('height', newHeight);
    logger.info({
      fn: updateUploadTextAreaFieldHeight,
      message: `Successfully set textarea fieldId: ${fieldId} to newHeight: ${newHeight}`,
      data: { textAreaValue, rawScrollHeight },
    });
  } else if (textAreaValue?.length && rawScrollHeight === 0) {
    // there is text but the DOM hasn't updated the scrollHeight value, try to calculate one
    const calculatedHeight = calculateScrollHeightForText(textAreaValue);
    const newHeight = calculatedHeight + 'px';
    targetField.css('height', 'auto').css('height', newHeight);
    logger.info({
      fn: updateUploadTextAreaFieldHeight,
      message: `Calculated and set new scroll height`,
      data: { textAreaValue, rawScrollHeight, newHeight },
    });
  } else {
    logger.info({
      fn: updateUploadTextAreaFieldHeight,
      message: `Textarea is empty, no need to set height`,
      data: { textAreaValue, rawScrollHeight },
    });
  }
}

function addFileUpload(fieldName, context = null) {
  const attachFileFieldId = fieldName + ATTACH_FILE_SUFFIX;
  logger.info({
    fn: addFileUpload,
    message: `Start addFileUpload toFieldId: ${fieldName}...`,
    data: {
      toFieldId: fieldName,
      fieldFileUploadId: attachFileFieldId,
    },
  });
  const fileUploadHtml = `<input type="file" multiple="multiple" id="${attachFileFieldId}" accept="${ALLOWED_FILE_TYPES.join(
    ','
  )}" aria-label="Attach files..." style='height: 50px; background: lightgrey; width: 100%; padding: 10px 0 0 10px;'>`;

  const divControl = context
    ? $(context).find(`#${fieldName}`).parent()
    : $(`#${fieldName}`).parent();

  divControl.append(fileUploadHtml);

  if (context) {
    $(context)
      .find('#AttachFile')
      .attr(
        'accept',
        ALLOWED_FILE_TYPES.join(',') + ',' + ALLOWED_MIME_TYPES.join(',')
      );
  } else {
    $('#AttachFile').attr(
      'accept',
      ALLOWED_FILE_TYPES.join(',') + ',' + ALLOWED_MIME_TYPES.join(',')
    );
  }

  // don't need the rest of the logic to execute for the iframe config
  if (context) return;

  const attachFileField = $(`#${attachFileFieldId}`);

  // update height of text area for initial value
  updateUploadTextAreaFieldHeight(fieldName);

  attachFileField.on('change', function (e) {
    logger.info({
      fn: addFileUpload,
      message: `fieldFileUpload on change called for fieldFileUploadId: ${attachFileFieldId}`,
      // @ts-ignore
      data: { files: e.target.files, context },
    });

    const textareaFileField = $(`#${fieldName}`);

    const iframe = doc.getElementById('documentsConfirmation');
    // @ts-ignore
    const iframeDoc = iframe?.contentWindow?.document;
    const iframeAttachFileField = $(iframeDoc)?.find(`#${attachFileFieldId}`);
    const iframeTextareaField = $(iframeDoc)?.find(`#${fieldName}`);

    if (iframeAttachFileField || iframeTextareaField) {
      logger.info({
        fn: addFileUpload,
        message: `Found iframe file upload fields for fieldFileUploadId: ${attachFileFieldId}`,
      });
    } else {
      logger.info({
        fn: addFileUpload,
        message: `No iframe file upload fields found, so skipping set files data...`,
      });
    }

    const uploadBtn = $('sl-button[id="quartechUploadBtn"]');
    const isUploadBtnDisabled = uploadBtn.attr('disabled') !== undefined;

    let chosenFiles = '';
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const isValidFileUpload = validateFileUpload(file);

      if (isValidFileUpload) {
        chosenFiles += `${file.name} (${formatBytes(file.size)})\n`;
        logger.info({
          fn: addFileUpload,
          message: `Valid file selected for upload, setting toFieldId: ${fieldName} chosen files value...`,
          data: { chosenFiles, uploadBtn, isUploadBtnDisabled },
        });

        // set textarea new text value for files
        textareaFileField.val(chosenFiles);

        // set textarea field new height
        updateUploadTextAreaFieldHeight(fieldName);

        // set iframe file field for background uploading
        iframeTextareaField?.val(chosenFiles);

        // if upload btn hasn't been enabled yet, enable it so user can upload.
        if (isUploadBtnDisabled) {
          uploadBtn.removeAttr('disabled');
        }

        updateOobFileUpload(iframeDoc);
      } else {
        logger.error({
          fn: addFileUpload,
          message: `Invalid files selected for fieldFileUploadId: ${attachFileFieldId}, and toFieldId: ${fieldName}`,
          data: { chosenFiles },
        });
        attachFileField.val('');
        iframeAttachFileField?.val('');
        textareaFileField.val('');
        iframeTextareaField?.val('');

        // disable upload btn since invalid files selected
        uploadBtn.attr('disabled', 'disabled');

        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }
  });
}

function updateOobFileUpload(context = null) {
  logger.info({
    fn: updateOobFileUpload,
    message: 'Updating OOB file upload field',
    data: { context },
  });
  let selectedFiles = [];

  CLAIM_FILE_UPLOAD_FIELDS.forEach((fieldName) => {
    let fileUploadId = fieldName + ATTACH_FILE_SUFFIX;

    const fieldFileUploadCtr = document.getElementById(fileUploadId);

    for (let i = 0; i < fieldFileUploadCtr.files.length; i++) {
      const file = fieldFileUploadCtr.files[i];
      selectedFiles.push(file);
    }
  });

  const fileList = fileListFrom(selectedFiles);

  const attachFileCtr = document.getElementById('AttachFile');
  // @ts-ignore
  const iframeAttachFileCtr = context?.getElementById('AttachFile');
  attachFileCtr.onchange = console.log;
  attachFileCtr.files = fileList;

  if (iframeAttachFileCtr) {
    logger.info({
      fn: updateOobFileUpload,
      message: `Successfully set iframe attach files control`,
      data: { fileList },
    });
    iframeAttachFileCtr.files = fileList;
  }

  logger.info({
    fn: updateOobFileUpload,
    message: 'Set attach file control files attribute, attachFileCtr.files',
    data: { fileList, context, iframeAttachFileCtr },
  });
}

/** @params {File[]} files - Array of files to add to the FileList */
function fileListFrom(files) {
  const b = new ClipboardEvent('').clipboardData || new DataTransfer();

  for (const file of files) b.items.add(file);
  return b.files;
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

function addDocumentUploadConfirmationIframe() {
  logger.info({
    fn: addDocumentUploadConfirmationIframe,
    message: 'Start adding document upload confirmation iframe...',
  });
  const formId = getFormId();

  if (!formId) {
    logger.error({
      fn: addDocumentUploadConfirmationIframe,
      message:
        'Unable to get form id needed to build documents confirmation iframe',
    });
    return;
  }

  const iframeSrc = `/claim-documents/?id=${formId}`;
  const htmlContentToAdd = `
    <iframe id="documentsConfirmation" src="${iframeSrc}" height="800" width="100%" title="Document Upload Confirmation">
    </iframe>
  `;
  addHtmlToTabDiv('documentsTab', htmlContentToAdd, 'bottom');

  // @ts-ignore
  const iframe = doc.getElementById('documentsConfirmation');

  // @ts-ignore
  iframe.onload = function () {
    logger.info({
      fn: addDocumentUploadConfirmationIframe,
      message: 'Documents confirmation iframe finished loading.',
    });

    // @ts-ignore
    const context = iframe.contentWindow?.document;
    if (!context) {
      logger.error({
        fn: addDocumentUploadConfirmationIframe,
        message: 'Unable to get iframe document context',
      });
      return;
    }

    const uploadBtn = $('sl-button[id="quartechUploadBtn"]');
    const isLoading = uploadBtn.attr('loading') !== undefined;

    if (uploadBtn && isLoading) {
      logger.info({
        fn: addDocumentUploadConfirmationIframe,
        message:
          'Uploading document upload button to loading/disabled state = false',
      });
      uploadBtn.removeAttr('loading');
      uploadBtn.on('click', function () {
        // @ts-ignore
        const iframeSubmitBtn = context?.getElementById('UpdateButton');
        if (iframeSubmitBtn) {
          logger.info({
            fn: updateOobFileUpload,
            message: 'Submitting newly selected files...',
          });
          iframeSubmitBtn.click();
        } else {
          logger.warn({
            fn: updateOobFileUpload,
            message: 'Failed to find iframe submit btn',
          });
        }
      });
    } else {
      logger.warn({
        fn: addDocumentUploadConfirmationIframe,
        message: 'Upload button not found or not in loading state',
        data: { uploadBtn, isLoading },
      });
    }

    const messageLabel = context.getElementById('MessageLabel');

    if (
      messageLabel &&
      messageLabel.innerHTML === 'Submission completed successfully.'
    ) {
      alert('Files uploaded successfully! Reload iframe...');
      // @ts-ignore
      iframe.src = iframeSrc;
    } else {
      // @ts-ignore
      customizeDocumentsControls(CLAIM_FILE_UPLOAD_FIELDS, context);
    }
  };
}
