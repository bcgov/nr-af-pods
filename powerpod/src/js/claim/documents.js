import { doc, POWERPOD } from '../common/constants.js';
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_MIME_TYPES,
  CLAIM_FILE_UPLOAD_FIELDS,
  MAXIMUM_FILE_SIZE_IN_KB,
  MAXIMUM_FILE_SIZE_TEXT,
  compareDocDataToUploadFieldData,
  formatBytes,
  getFilenamesFromDocData,
  validateFileUpload,
} from '../common/documents.ts';
import { getDocumentsData } from '../common/fetch.js';
import { validateRequiredFields } from '../common/fieldValidation.js';
import { getFieldsBySectionClaim } from '../common/fields.js';
import { getFormId } from '../common/form.js';
import {
  addHtmlToSection,
  addHtmlToTabDiv,
  getFieldNameLabel,
  hideSection,
  hideTable,
  listenForIframeReadyStateChanges,
  observeChanges,
  observeIframeChanges,
  onDocumentReadyState,
  showSection,
  showTable,
} from '../common/html.js';
import { Logger } from '../common/logger.js';
import { getCurrentStep } from '../common/program.ts';
import { sha256 } from '../common/utils.js';
import store from '../store/index.js';

POWERPOD.documents = {
  initialIframeLoad: true,
  isSubmitting: false,
  iframeLoading: true,
  filesToUpload: {},
  filesLastUploaded: {},
  confirmedFilesUploaded: [],
  uploadedDocsString: '',
  observer: null,
  observerSet: false, // used to wait for iframe notes to finish loading
  getDocumentsConfirmationIframe,
  validateFilesUploadedForField,
  docData: null,
};

// @ts-ignore
const logger = Logger('claim/documents');

const DEVELOPMENT_MODE_ENABLED = false;

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
    // addTitleToNotesControl();
    addLoadingSpinner();
    addDocumentUploadConfirmationIframe();
  }
}

function addLoadingSpinner() {
  hideTable('supportingDocumentsSection');

  $('#supportingDocumentationNote').css({
    display: 'flex',
    flexDirection: 'column',
  });

  $('#supportingDocumentationNote').append(`
    <br/>
    <sl-spinner 
      id="quartechDocumentsSpinner" 
      style="font-size: 50px; --track-width: 10px; margin: 20px auto;">
    </sl-spinner>
  `);
}

function hideLoadingSpinner() {
  showTable('supportingDocumentsSection');

  $('sl-spinner[id="quartechDocumentsSpinner"]').remove();

  addTitleToNotesControl();
}

function addNotesSpinner() {
  const notes = doc.getElementById('notescontrol');
  const entityNotes = notes?.querySelector('.entity-notes');

  if (entityNotes && entityNotes.style) {
    entityNotes.style.display = 'none';
  }

  $('#notescontrol').append(`
    <br/>
    <sl-spinner 
      id="quartechNotesSpinner" 
      style="font-size: 50px; --track-width: 10px; margin: 20px auto;">
    </sl-spinner>
  `);
}

function hideNotesSpinner() {
  const notes = doc.getElementById('notescontrol');
  const entityNotes = notes?.querySelector('.entity-notes');

  if (entityNotes && entityNotes.style) {
    entityNotes.style.display = '';
  }

  $('sl-spinner[id="quartechNotesSpinner"]').remove();
}

const NO_NEW_FILES_HTML = `
  <sl-alert id="docStatusAlert" variant="primary" open>
    <sl-icon slot="icon" name="info-circle"></sl-icon>
    <strong>No new files have been selected for upload</strong><br />
    Please click "Choose Files" or Drag & Drop files into the grey box.
  </sl-alert>
`;

const NOT_YET_UPLOADED_HTML = `
  <sl-alert id="docStatusAlert" variant="warning" open>
    <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
    <strong>Please make sure to click "Upload new files"</strong><br />
    This will ensure that your files are uploaded successfully before continuing.
  </sl-alert>
`;

function addTitleToNotesControl() {
  $(`#notescontrol`).prepend(`
    <div>
      <style>
        sl-button.huge::part(base) {
          --sl-input-height-medium: 48px;
          font-size: 1.5rem;
        }
        sl-tooltip::part(body) {
          font-size: 1.2rem;
        }
        sl-alert::part(base) {
          font-size: 1.5rem;
        }
        sl-alert::part(icon) {
          font-size: 2rem;
        }
        .card-basic {
          max-width: 300px;
          margin: 5px;
        }
        .card-header [slot='header'] {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: bold;
        }
        .card-header {
          --border-color: black;
          --border-width: 1px;
        }
        .card-header h3 {
          margin: 0;
        }
        sl-card {
          margin-bottom: 20px;
        }
      </style>
      <h4>New Files to Upload</h4>
      <div id="filesToUpload" style="padding:10px;">
        ${NO_NEW_FILES_HTML}
      </div>
      <sl-button id="quartechUploadBtn" class="huge" variant="primary" style="width: 100%;" loading disabled>
        Upload new files
      </sl-button>
      <h4>Documents Previously Uploaded</h4>
    </div>
  `);

  const emptyNotesMsgDiv = doc.querySelector(
    '#notescontrol > div.col-md-8.entity-notes > div.notes-empty.message > div'
  );

  if (emptyNotesMsgDiv)
    emptyNotesMsgDiv.textContent = 'There are no documents to display.';
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
      message: `Could not find target fieldId: ${fieldId}`,
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

  attachFileField.on('change', async function (e) {
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

    const state = getCurrentState();

    const uploadBtn = $('sl-button[id="quartechUploadBtn"]');
    const isUploadBtnDisabled = uploadBtn.attr('disabled') !== undefined;

    // add file to 'filesToUpload' div section
    const filesToUploadDiv = $('#filesToUpload');
    if (!filesToUploadDiv) {
      logger.error({
        fn: addFileUpload,
        message: 'Could not find filesToUpload div',
        data: { filesToUploadDiv },
      });
    }

    const fieldCardId = `filesToUpload-${fieldName}-card`;
    const fieldDivId = `filesToUpload-${fieldName}`;

    if (!doc.getElementById(fieldDivId)) {
      filesToUploadDiv.append(`
        <sl-card id='${fieldCardId}' class="card-header">
          <div slot="header">
            ${getFieldNameLabel(fieldName)}
          </div>
          <div id="${fieldDivId}"></div>
        </sl-card>
      `);
    }

    const fieldCard = $(`#${fieldCardId}`);
    const fieldDiv = $(`#${fieldDivId}`);

    if (!fieldDiv || !fieldCard) {
      logger.error({
        fn: addFileUpload,
        message: `Unable to get field filesToUpload div/card for fieldName: ${fieldName}`,
        data: {
          fieldDivId,
          fieldDiv,
          filesToUploadDiv,
          fieldCardId,
          fieldCard,
        },
      });
      return;
    }

    fieldDiv.html('');

    let chosenFiles = '';
    let invalidFilesPresent = false;
    let validFilePresent = false;

    logger.info({
      fn: addFileUpload,
      message: 'Start for loop for upload files',
      data: { eventTargetFiles: e.target.files },
    });

    if (e.target.files.length === 0) {
      const newFilesToUploadState = POWERPOD.documents.filesToUpload;
      delete newFilesToUploadState[fieldName];
      POWERPOD.documents.filesToUpload = newFilesToUploadState;
      fieldDiv.remove();
      fieldCard.remove();
      logger.warn({
        fn: addFileUpload,
        message: 'No files selected, updating POWERPOD.documents state',
        data: {
          fieldName,
          filesToUpload: POWERPOD.documents.filesToUpload,
        },
      });
      attachFileField.val('');
      iframeAttachFileField?.val('');
      textareaFileField.val('');
      iframeTextareaField?.val('');
      getDocumentsData({
        id: getFormId(),
        onSuccess: (data) => {
          POWERPOD.documents.docData = data;
          validateRequiredFields();
        },
      });
    }

    const newFilesToUploadState = POWERPOD.documents.filesToUpload;
    delete newFilesToUploadState[fieldName];
    POWERPOD.documents.filesToUpload = newFilesToUploadState;

    if (e.target.files & e.target.files.length) {
      logger.info({
        fn: addFileUpload,
        message: 'Logging e.target.files data:',
        data: { files: e.target?.files },
      });
    }

    for (let i = 0; i < e.target.files.length && !invalidFilesPresent; i++) {
      const file = e.target.files[i];
      const isValidFileUpload = validateFileUpload(file);

      if (isValidFileUpload) {
        validFilePresent = true;
        const fileInfoString = `${file.name} (${formatBytes(file.size)})`;
        chosenFiles += fileInfoString + '\n';
        logger.info({
          fn: addFileUpload,
          message: `Valid file selected for upload, setting toFieldId: ${fieldName} chosen files value...`,
          data: {
            state,
            chosenFiles,
            uploadBtn,
            isUploadBtnDisabled,
            fileInfoString,
          },
        });

        const filenameHash = await sha256(file.name);
        fieldDiv?.append(`
          <sl-card class="card-basic">
            ${fileInfoString}
            <sl-tooltip id="${filenameHash}-tooltip" content='Press "Upload new files" to confirm' style="--max-width: 200px;">
              <sl-icon id="${filenameHash}-icon" name="exclamation-circle" style="color: red;"></sl-icon>
            </sl-tooltip>
          </sl-card>
        `);

        const fieldFilesToUploadArr =
          // @ts-ignore
          POWERPOD.documents.filesToUpload[fieldName] || [];
        fieldFilesToUploadArr.push(file.name);

        POWERPOD.documents.filesToUpload = {
          [fieldName]: fieldFilesToUploadArr,
          ...POWERPOD.documents.filesToUpload,
        };

        // set textarea new text value for files
        textareaFileField.val(chosenFiles);

        // set textarea field new height
        updateUploadTextAreaFieldHeight(fieldName);

        // set iframe file field for background uploading
        iframeTextareaField?.val(chosenFiles);

        // if upload btn hasn't been enabled yet, enable it so user can upload, only if iframe finished loading first
        setUploadButtonState();
        getDocumentsData({
          id: getFormId(),
          onSuccess: (data) => {
            POWERPOD.documents.docData = data;
            validateRequiredFields();
          },
        });

        updateOobFileUpload(iframeDoc);
      } else {
        // breaks for loop
        invalidFilesPresent = true;

        logger.error({
          fn: addFileUpload,
          message: `Invalid files selected for fieldFileUploadId: ${attachFileFieldId}, and toFieldId: ${fieldName}`,
          data: { chosenFiles },
        });
        attachFileField.val('');
        iframeAttachFileField?.val('');
        textareaFileField.val('');
        iframeTextareaField?.val('');

        fieldDiv.remove();
        fieldCard.remove();

        const hasSelectedAnyNewFilesToUpload =
          hasUserSelectedAnyNewFilesToUpload();

        logger.info({
          fn: addFileUpload,
          message: 'Removing field div, checking filesToUploadDiv for status',
          data: {
            filesToUploadDiv,
            html: filesToUploadDiv.html(),
            hasSelectedAnyNewFilesToUpload,
          },
        });

        POWERPOD.documents.filesToUpload = {
          [fieldName]: [],
          ...POWERPOD.documents.filesToUpload,
        };

        // disable upload btn since invalid files selected
        setUploadButtonState();
        getDocumentsData({
          id: getFormId(),
          onSuccess: (data) => {
            POWERPOD.documents.docData = data;
            validateRequiredFields();
          },
        });

        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }

    logger.info({
      fn: addFileUpload,
      message: 'Determining what notice to show for file upload',
      data: {
        hasUserSelectedAnyNewFilesToUpload:
          hasUserSelectedAnyNewFilesToUpload(),
      },
    });

    if (!hasUserSelectedAnyNewFilesToUpload()) {
      $(`sl-alert[id="docStatusAlert"]`)?.remove();
      filesToUploadDiv.append(NO_NEW_FILES_HTML);
    } else if (validFilePresent) {
      $(`sl-alert[id="docStatusAlert"]`)?.remove();
      filesToUploadDiv.append(NOT_YET_UPLOADED_HTML);
    }

    setUploadButtonState();

    logger.info({
      fn: addFileUpload,
      message: 'Finished running on attach file handler',
      data: { filesToUpload: POWERPOD.documents.filesToUpload },
    });

    getDocumentsData({
      id: getFormId(),
      onSuccess: (data) => {
        POWERPOD.documents.docData = data;
        validateRequiredFields();
      },
    });
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
    logger.info({
      fn: updateOobFileUpload,
      message: `Updating OOB file upload field for fieldName: ${fieldName}`,
    });
    let fileUploadId = fieldName + ATTACH_FILE_SUFFIX;

    const fieldFileUploadCtr = document.getElementById(fileUploadId);

    for (let i = 0; i < fieldFileUploadCtr.files.length; i++) {
      const file = fieldFileUploadCtr.files[i];
      selectedFiles.push(file);
    }

    logger.info({
      fn: updateOobFileUpload,
      message: `Updated filesList for files from fieldName: ${fieldName}`,
      data: { fieldFileUploadCtrFiles: fieldFileUploadCtr.files },
    });
  });

  const fileList = fileListFrom(selectedFiles);

  // Disabling otherwise upload happens twice
  // const attachFileCtr = document.getElementById('AttachFile');
  // attachFileCtr.onchange = console.log;
  // attachFileCtr.files = fileList;

  // @ts-ignore
  const iframeAttachFileCtr = context?.getElementById('AttachFile');
  if (iframeAttachFileCtr) {
    logger.info({
      fn: updateOobFileUpload,
      message: `Successfully set iframe attach files control`,
      data: { selectedFiles, fileList },
    });
    iframeAttachFileCtr.files = fileList;
  }

  logger.info({
    fn: updateOobFileUpload,
    message: 'Set attach file control files attribute, attachFileCtr.files',
    data: { files: fileList, selectedFiles, context, iframeAttachFileCtr },
  });
}

/** @params {File[]} files - Array of files to add to the FileList */
function fileListFrom(files) {
  const b = new ClipboardEvent('').clipboardData || new DataTransfer();

  for (const file of files) b.items.add(file);
  logger.info({
    fn: fileListFrom,
    message: 'Successfully generated file list from files',
    data: { files, fileList: b.files },
  });
  return b.files;
}

function hasUserSelectedAnyNewFilesToUpload() {
  const combinedFilesToUploadArr =
    Object.values(POWERPOD.documents.filesToUpload).flat(1) || [];
  const res = combinedFilesToUploadArr.length > 0;
  logger.info({
    fn: hasUserSelectedAnyNewFilesToUpload,
    message: 'Determining if user has selected any new files to upload...',
    data: {
      filesToUpload: POWERPOD.documents.filesToUpload,
      combinedFilesToUploadArr,
      hasUserSelectedAnyNewFilesToUpload: res,
    },
  });
  return res;
}

function getCurrentState() {
  let state = '';
  const iframeLoading = POWERPOD.documents.iframeLoading;
  const initialIframeLoad = POWERPOD.documents.initialIframeLoad;
  const isSubmitting = POWERPOD.documents.isSubmitting;
  const userHasFilesSelectedToUpload = hasUserSelectedAnyNewFilesToUpload();

  logger.info({
    fn: getCurrentState,
    message: 'Try to determine current state',
    data: {
      iframeLoading,
      initialIframeLoad,
      isSubmitting,
      userHasFilesSelectedToUpload,
    },
  });

  if (iframeLoading && initialIframeLoad) {
    state = 'initial';
  } else if (iframeLoading && !isSubmitting && !initialIframeLoad) {
    state = 'loading';
  } else if (!iframeLoading && !userHasFilesSelectedToUpload) {
    state = 'ready';
  } else if (!iframeLoading && userHasFilesSelectedToUpload) {
    state = 'set';
  } else if (isSubmitting && iframeLoading && !initialIframeLoad) {
    state = 'go';
  }

  if (!state) {
    logger.error({
      fn: getCurrentState,
      message: 'Could not determine current state',
      data: {
        iframeLoading,
        initialIframeLoad,
        isSubmitting,
        userHasFilesSelectedToUpload,
      },
    });
  }

  logger.info({
    fn: getCurrentState,
    message: `Current state determined to be: ${state}`,
  });

  return state;
}

// upload button has these states:
// State 1 (initial): Initial load state, disabled and loading
// State 2 (ready): Disabled state, no files selected, ready to accept files
// State 3 (set): Enabled state, files selected
// State 4 (go): Submitting state, disabled and loading
function setUploadButtonState(state = '') {
  const uploadBtn = $('sl-button[id="quartechUploadBtn"]');

  if (!uploadBtn) {
    logger.error({
      fn: setUploadButtonState,
      message: 'Could not find update button',
    });
    return;
  }

  if (!state) {
    state = getCurrentState();
  }

  logger.info({
    fn: setUploadButtonState,
    message: `Setting state: ${state}`,
  });

  if (state === 'initial' || state === 'go' || state === 'loading') {
    uploadBtn.attr('loading', 'loading');
    uploadBtn.attr('disabled', 'disabled');
  } else if (state === 'ready') {
    uploadBtn.removeAttr('loading');
    uploadBtn.attr('disabled', 'disabled');
  } else if (state === 'set') {
    uploadBtn.removeAttr('loading');
    uploadBtn.removeAttr('disabled');
  }
}

function setUploadBtnOnClick(context) {
  logger.info({
    fn: setUploadBtnOnClick,
    message: 'Setting upload button on click handler for new iframe',
  });
  const uploadBtn = $('sl-button[id="quartechUploadBtn"]');

  if (!uploadBtn) {
    logger.error({
      fn: setUploadBtnOnClick,
      message: 'Could not find update button',
    });
    return;
  }
  // remove any previous onclick handlers (no longer referencing the right iframe btn)
  uploadBtn.off('click');

  // add on-click handler for upload referencing newly loaded iframe submit btn
  uploadBtn.on('click', function () {
    const observer = POWERPOD.documents.observer;
    if (observer && observer.disconnect) {
      logger.info({
        fn: setUploadBtnOnClick,
        message: 'Disconnecting observer from documents iframe...',
      });
      observer.disconnect();
      POWERPOD.documents.observer = null;
      POWERPOD.documents.observerSet = false;
    }
    // @ts-ignore
    const iframeSubmitBtn = context?.getElementById('UpdateButton');

    if (!iframeSubmitBtn) {
      logger.error({
        fn: setUploadBtnOnClick,
        message: 'Failed to find iframe submit btn',
      });
      return;
    }

    logger.info({
      fn: updateOobFileUpload,
      message: 'Submitting newly selected files...',
    });

    POWERPOD.documents.iframeLoading = true;
    POWERPOD.documents.isSubmitting = true;

    setUploadButtonState();

    logger.info({
      fn: setUploadBtnOnClick,
      message: 'Clicking iframe submit btn...',
      data: { iframeSubmitBtn },
    });
    iframeSubmitBtn.click();
  });
}

function cloneNotesContent() {
  const iframe = getDocumentsConfirmationIframe();
  // @ts-ignore
  const context = iframe?.contentWindow?.document;
  const notes = context?.getElementById('notescontrol');

  if (!iframe || !context || !notes) {
    logger.warn({
      fn: cloneNotesContent,
      message: 'Prereq: Unable to get iframe or context or notes',
    });
    return;
  }
  const parentNotes = doc.getElementById('notescontrol');
  const parentEntityNotes = parentNotes?.querySelector('.entity-notes');

  const entityNotes = notes.querySelector('.entity-notes');

  if (entityNotes && parentEntityNotes) {
    parentEntityNotes.parentNode?.replaceChild(
      entityNotes.cloneNode(true),
      parentEntityNotes
    );

    // remove any dropdown selectors
    // @ts-ignore
    doc.getElementsByClassName('toolbar dropdown')?.forEach((e) => e.remove());

    const emptyNotesMsgDiv = doc.querySelector(
      '#notescontrol > div.col-md-8.entity-notes > div.notes-empty.message > div'
    );

    if (emptyNotesMsgDiv)
      emptyNotesMsgDiv.textContent = 'There are no documents to display.';

    logger.info({
      fn: cloneNotesContent,
      message:
        'Final step: Successfully replaced parent notes with iframe notes',
      data: { documents: POWERPOD.documents },
    });
  } else {
    logger.warn({
      fn: cloneNotesContent,
      message: 'Final step: Could not find parentNotes or notes',
      data: { parentEntityNotes, entityNotes, documents: POWERPOD.documents },
    });
  }
}

function setupNotesContentObserver() {
  const observerAlreadySet = POWERPOD.documents.observerSet;
  const isSubmitting = POWERPOD.documents.isSubmitting;

  if (isSubmitting) {
    if (DEVELOPMENT_MODE_ENABLED) {
      logger.info({
        fn: setupNotesContentObserver,
        message: 'Do not setup content observers while submitting...',
        data: { observerAlreadySet, isSubmitting },
      });
    }
    return;
  }

  // if observer is already, nothing to do
  if (observerAlreadySet) {
    if (DEVELOPMENT_MODE_ENABLED) {
      logger.info({
        fn: setupNotesContentObserver,
        message: 'No need to setup notes content observer, already set',
        data: { observerAlreadySet },
      });
    }
    return;
  }

  const iframe = getDocumentsConfirmationIframe();
  // @ts-ignore
  const context = iframe?.contentWindow?.document;
  const body = context?.body;
  const notes = context?.getElementById('notescontrol');

  if (!iframe || !context || !notes || !body) {
    logger.warn({
      fn: setupNotesContentObserver,
      message: 'Prereq: Unable to get iframe or context or notes or body',
    });
    return;
  }

  logger.info({
    fn: setupNotesContentObserver,
    message: 'Step 1: Check if observer set',
    data: {
      observerAlreadySet,
      notes,
      context,
      body,
    },
  });

  if (!observerAlreadySet) {
    logger.info({
      fn: setupNotesContentObserver,
      message:
        'Step 2: Observer not set yet, try to observe iframe notes for changes',
      data: {
        observerAlreadySet,
        notes,
        context,
        body,
      },
    });
    const observer = observeChanges(body, () => {
      logger.info({
        fn: setupNotesContentObserver,
        message:
          'Observer: Changes in doc iframe noted, calling cloneNotesContent(context)',
        data: {
          observerAlreadySet,
          notes,
          context,
          body,
        },
      });
      cloneNotesContent();
    });
    if (observer) {
      logger.info({
        fn: setupNotesContentObserver,
        message:
          'Finally: Successfully assigned observer to iframe notescontrol',
        data: {
          observerAlreadySet,
          notes,
          context,
          body,
        },
      });
      POWERPOD.documents.observerSet = true;
      POWERPOD.documents.observer = observer;
    }
    return;
  }
}

function isNotesStillLoading(context) {
  const loadingElement = context.querySelector(
    '#notescontrol > div > div.notes-loading.message.text-center'
  );
  const loadingMoreElement = context.querySelector(
    '#notescontrol > div > div.notes-loading-more.message.text-center'
  );

  const loadingElDisplayStyle = loadingElement?.style?.display;
  const loadingMoreElDisplayStyle = loadingMoreElement?.style?.display;

  logger.info({
    fn: isNotesStillLoading,
    message: 'Checking if notes is still loading or not...',
    data: {
      context,
      loadingElement,
      loadingMoreElement,
      loadingElDisplayStyle,
      loadingMoreElDisplayStyle,
    },
  });

  if (
    !loadingElement ||
    !loadingMoreElement ||
    !loadingElDisplayStyle ||
    !loadingMoreElDisplayStyle ||
    loadingElDisplayStyle === '' ||
    loadingMoreElDisplayStyle === ''
  ) {
    logger.warn({
      fn: isNotesStillLoading,
      message: 'Notes is still loading',
      data: {
        context,
        loadingElement,
        loadingMoreElement,
        loadingElDisplayStyle,
        loadingMoreElDisplayStyle,
      },
    });
    return true;
  }
  return false;
}

async function checkForFilesToUpload(context, uploadedFilesString = []) {
  const userHasFilesSelectedToUpload = hasUserSelectedAnyNewFilesToUpload();

  logger.info({
    fn: checkForFilesToUpload,
    message: 'Checking if any selected files have been uploaded',
    data: {
      userHasFilesSelectedToUpload,
      documents: POWERPOD.documents,
    },
  });

  if (userHasFilesSelectedToUpload) {
    let notes = null;
    if (uploadedFilesString.length === 0) {
      notes = context?.getElementById('notescontrol');

      if (!notes || !notes.textContent) {
        logger.error({
          fn: checkForFilesToUpload,
          message: 'Could not find notes or notes.textContent in iframe',
          data: { documents: POWERPOD.documents },
        });
        return;
      }

      logger.info({
        fn: checkForFilesToUpload,
        message: 'Found notes and notes.textContent',
        data: { notesTextContent: notes.textContent },
      });
    }

    const failedToUpload = [];
    // @ts-ignore
    const uploadedSuccessfully = [];

    // @ts-ignore
    const filenameArray = Object.values(POWERPOD.documents.filesToUpload).flat(
      1
    );
    // @ts-ignore
    POWERPOD.documents.confirmedFilesUploaded = [];

    const promises = filenameArray.map(async (filename) => {
      const filenameHash = await sha256(filename);
      const fileIcon = $(`sl-icon[id="${filenameHash}-icon"]`);
      if (!fileIcon) {
        logger.error({
          fn: checkForFilesToUpload,
          message: 'Could not find file icon for uploaded file',
          data: { documents: POWERPOD.documents, filename, filenameHash },
        });
      }

      const fileTooltip = $(`sl-tooltip[id="${filenameHash}-tooltip"]`);
      if (!fileTooltip) {
        logger.error({
          fn: checkForFilesToUpload,
          message: 'Failed to find file icon for uploaded file',
          data: { documents: POWERPOD.documents, filename, filenameHash },
        });
      }

      // If the Notes timeline  contains the filename, we can be sure the
      // upload was successful, and the file is confirmed uploaded.
      if (
        (uploadedFilesString && uploadedFilesString.length > 0) ||
        (notes && notes.textContent.includes(filename))
      ) {
        logger.info({
          fn: checkForFilesToUpload,
          message: `Found that selected file has been uploaded already, filename: ${filename}`,
          data: {
            documents: POWERPOD.documents,
            userHasFilesSelectedToUpload,
            notes,
            uploadedFilesString,
            filenameArray,
            filename,
            filenameHash,
          },
        });

        fileIcon.attr('name', 'check-circle');
        fileIcon.attr('style', 'color: green;');
        fileTooltip.attr('content', 'File successfuly uploaded!');

        logger.info({
          fn: checkForFilesToUpload,
          message: `Successfully updated state for filename: ${filename}`,
          data: { documents: POWERPOD.documents, filename, filenameHash },
        });

        uploadedSuccessfully.push(filename);
      } else {
        logger.warn({
          fn: checkForFilesToUpload,
          message: `Failed to successfully upload filename: ${filename}`,
          data: { documents: POWERPOD.documents, filename, filenameHash },
        });

        failedToUpload.push(filename);

        fileIcon.attr('name', 'exclamation-circle');
        fileIcon.attr('style', 'color: red;');
        fileTooltip.attr(
          'content',
          'File failed to upload, please try uploading this file again.'
        );
      }
    });

    await Promise.all(promises);

    // add success/error to 'filesToUpload' div section
    const filesToUploadDiv = $('#filesToUpload');
    if (!filesToUploadDiv) {
      logger.error({
        fn: addFileUpload,
        message: 'Could not find filesToUpload div',
        data: { filesToUploadDiv },
      });
    }

    if (
      failedToUpload.length > 0 ||
      filenameArray.length !== uploadedSuccessfully.length
    ) {
      logger.warn({
        fn: checkForFilesToUpload,
        message: 'Some files not uploaded',
        data: {
          failedToUpload,
          filenameArray,
          uploadedSuccessfully,
          documents: POWERPOD.documents,
        },
      });
      $(`sl-alert[id="docStatusAlert"]`)?.remove();
      filesToUploadDiv.append(`
        <sl-alert id="docStatusAlert" variant="danger" open>
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          <strong>Some files may not have uploaded correctly</strong><br />
          Please click "Choose Files" or drag & drop your files, and try uploading them again.
        </sl-alert>
      `);
    } else if (
      failedToUpload.length === 0 &&
      filenameArray.length === uploadedSuccessfully.length
    ) {
      logger.info({
        fn: checkForFilesToUpload,
        message: 'Success, updating info',
        data: {
          failedToUpload,
          filenameArray,
          uploadedSuccessfully,
          documents: POWERPOD.documents,
        },
      });
      $(`sl-alert[id="docStatusAlert"]`)?.remove();
      filesToUploadDiv.append(`
        <sl-alert id="docStatusAlert" variant="success" open>
          <sl-icon slot="icon" name="check2-circle"></sl-icon>
          <strong>Your documents have been uploaded successfully</strong><br />
          You can safely continue now. If you have more documents to upload, feel free to upload more.
        </sl-alert>
      `);
    }
    // @ts-ignore
    POWERPOD.documents.confirmedFilesUploaded = uploadedSuccessfully;
    POWERPOD.documents.filesLastUploaded = POWERPOD.documents.filesToUpload;
    POWERPOD.documents.filesToUpload = {};

    getDocumentsData({
      id: getFormId(),
      onSuccess: (data) => {
        POWERPOD.documents.docData = data;
        validateRequiredFields();
      },
    });

    setUploadButtonState();
  }
}

export function validateFilesUploadedForField(fieldName, data) {
  const filesLastUploaded = POWERPOD.documents.filesLastUploaded;
  const filesToUpload = POWERPOD.documents.filesToUpload;
  const confirmedFilesUploaded = POWERPOD.documents.confirmedFilesUploaded;

  const [verifiedUploadedDocs, unverifiedDocs] =
    compareDocDataToUploadFieldData(fieldName, data);

  const logData = {
    filesLastUploaded,
    filesToUpload,
    confirmedFilesUploaded,
    verifiedUploadedDocs,
    unverifiedDocs,
  };

  if (!verifiedUploadedDocs || verifiedUploadedDocs?.length === 0) {
    logger.info({
      fn: validateFilesUploadedForField,
      message: `No docs verified uploaded for fieldName: ${fieldName}`,
      data: logData,
    });
  } else {
    logger.info({
      fn: validateFilesUploadedForField,
      message: `Found successfully uploaded & verified docs for fieldName: ${fieldName}`,
      data: logData,
    });
    return true;
  }

  logger.info({
    fn: validateFilesUploadedForField,
    message: `Starting to validate single file upload for fieldName: ${fieldName}`,
    data: logData,
  });

  const filesForFieldName =
    filesLastUploaded[fieldName] || filesToUpload[fieldName];

  if (!filesForFieldName) {
    logger.info({
      fn: validateFilesUploadedForField,
      message: `No files selected for required fieldName: ${fieldName}`,
      data: logData,
    });
    return false;
  }

  logger.info({
    fn: validateFilesUploadedForField,
    message: `Checking if fieldName: ${fieldName} already has fields uploaded`,
    data: logData,
  });

  const doesFieldNameHaveUploadedFilesAlready = filesForFieldName.some((file) =>
    confirmedFilesUploaded.includes(file)
  );

  if (doesFieldNameHaveUploadedFilesAlready) {
    logger.info({
      fn: validateFilesUploadedForField,
      message: `Files uploaded successfully for required fieldName: ${fieldName}`,
      data: logData,
    });
    return true;
  } else {
    logger.info({
      fn: validateFilesUploadedForField,
      message: `File not uploaded yet for fieldName: ${fieldName}`,
      data: logData,
    });
    return false;
  }
}

function validateFileUploads() {
  const filesLastUploaded = POWERPOD.documents.filesLastUploaded;
  const filesToUpload = POWERPOD.documents.filesToUpload;
  const confirmedFilesUploaded = POWERPOD.documents.confirmedFilesUploaded;

  const fieldNames =
    (filesLastUploaded?.length && Object.keys(filesLastUploaded)) ??
    Object.keys(filesToUpload);

  if (!fieldNames || !fieldNames.length || fieldNames.length === 0) {
    logger.warn({
      fn: validateFileUploads,
      message: 'No file fields to validate',
      data: {
        filesLastUploaded,
        filesToUpload,
        confirmedFilesUploaded,
        fieldNames,
      },
    });
    return;
  }

  const stepName = getCurrentStep();
  const fieldsConfig = getFieldsBySectionClaim(stepName);

  let missingRequiredFields = [];
  let validatedFields = [];

  fieldNames.forEach((fieldName) => {
    const fieldConfig = fieldsConfig.find((f) => f.name === fieldName);
    if (!fieldConfig) {
      logger.error({
        fn: validateFileUploads,
        message: `Could not find field config for ${fieldName}`,
      });
      return;
    }
    if (fieldConfig && !fieldConfig.required) {
      logger.warn({
        fn: validateFileUploads,
        message: `File upload field not required for fieldName: ${fieldName}`,
      });
      validatedFields.push(fieldName);
      return;
    }
    const filesForFieldName =
      filesLastUploaded[fieldName] || filesToUpload[fieldName];
    logger.info({
      fn: validateFileUploads,
      message: `Checking if fieldName: ${fieldName} already has fields uploaded`,
      data: {
        filesLastUploaded,
        filesToUpload,
        confirmedFilesUploaded,
        fieldNames,
        filesForFieldName,
      },
    });
    const doesFieldNameHaveUploadedFilesAlready = filesForFieldName.some(
      (file) => confirmedFilesUploaded.includes(file)
    );
    if (doesFieldNameHaveUploadedFilesAlready) {
      logger.info({
        fn: validateFileUploads,
        message: `Files uploaded successfully for required fieldName: ${fieldName}`,
      });
      validatedFields.push(fieldName);
      return;
    }
    if (!filesForFieldName) {
      logger.info({
        fn: validateFileUploads,
        message: `No files selected for required fieldName: ${fieldName}`,
        data: {
          filesLastUploaded,
          confirmedFilesUploaded,
          fieldNames,
          fieldConfig,
        },
      });
      if (missingRequiredFields.includes(fieldName)) {
        logger.info({
          fn: validateFileUploads,
          message: `Missing required fields already contains fieldName: ${fieldName}`,
        });
        return;
      }
    }
    missingRequiredFields.push(fieldName);
  });

  if (!missingRequiredFields) {
    logger.info({
      fn: validateFileUploads,
      message: `Nothing to do, all required file uploads provided`,
      data: {
        filesLastUploaded,
        confirmedFilesUploaded,
        fieldNames,
      },
    });
  }

  let errorText =
    'IS REQUIRED. Please ensure at least one file per required upload field is confirmed & uploaded successfully.';
  let errorMessage = '';

  const fieldErrorMessage = (fieldName) =>
    `<div><span>"${fieldName}"</span><span style="color:red;"> ${errorText}</span></div>`;
  missingRequiredFields.forEach((fieldName) => {
    // store.dispatch('addValidationError', fieldErrorMessage(fieldName));
    errorMessage = errorMessage.concat(fieldErrorMessage(fieldName));
  });

  // validatedFields.forEach((fieldName) => {
  //   store.dispatch('removeValidationError', fieldErrorMessage(fieldName));
  // });

  logger.info({
    fn: validateFileUploads,
    message: 'Finished validating fields',
    data: {
      filesLastUploaded,
      confirmedFilesUploaded,
      fieldNames,
      missingRequiredFields,
      validatedFields,
    },
  });
}

function getDocumentsConfirmationIframe() {
  // @ts-ignore
  const iframe = doc.getElementById('documentsConfirmation');

  // @ts-ignore
  if (!iframe || !iframe?.contentWindow) {
    logger.error({
      fn: getDocumentsConfirmationIframe,
      message:
        'Could not find documentsConfirmation iframe or iframe content window',
      // @ts-ignore
      data: { iframe, contentWindow: iframe?.contentWindow || null },
    });
    return;
  }
  logger.info({
    fn: getDocumentsConfirmationIframe,
    message: 'Successfully found documents confirmation iframe',
    // @ts-ignore
    data: { iframe, contentWindow: iframe?.contentWindow || null },
  });
  return iframe;
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
    <iframe 
      id="documentsConfirmation" 
      src="${iframeSrc}" 
      title="Document Upload Confirmation" 
      aria-hidden="true" 
      tabindex="-1" 
      ${
        DEVELOPMENT_MODE_ENABLED
          ? 'style="width:100%; height:1000px; border:0;"'
          : `style="position: absolute; width:0; height:0; border:0;"`
      }
    >
    </iframe>
  `;
  addHtmlToTabDiv('documentsTab', htmlContentToAdd, 'bottom');

  // @ts-ignore
  const iframe = getDocumentsConfirmationIframe();

  // @ts-ignore
  if (!iframe || !iframe?.contentWindow) {
    logger.error({
      fn: addDocumentUploadConfirmationIframe,
      message: 'Could not find documentsConfirmation iframe',
    });
    return;
  }

  // @ts-ignore
  iframe.onload = function () {
    // POWERPOD.documents.observerSet = false;
    const prevIframeLoading = POWERPOD.documents.iframeLoading;
    const iframeLoading = (POWERPOD.documents.iframeLoading = false);

    const initialIframeLoad = POWERPOD.documents.initialIframeLoad;
    const isSubmitting = POWERPOD.documents.isSubmitting;

    const state = getCurrentState();

    logger.info({
      fn: addDocumentUploadConfirmationIframe,
      message: 'Documents confirmation iframe finished loading.',
      data: {
        state,
        prevIframeLoading,
        iframeLoading,
        initialIframeLoad,
        isSubmitting,
      },
    });

    // this logic only runs once on initial iframe load
    if (initialIframeLoad) {
      logger.info({
        fn: addDocumentUploadConfirmationIframe,
        message: 'Initial load for iframe, hide loading spinner',
      });
      hideLoadingSpinner();
      POWERPOD.documents.initialIframeLoad = false;

      getDocumentsData({
        id: getFormId(),
        onSuccess: (data) => {
          POWERPOD.documents.docData = data;
          validateRequiredFields();
        },
      });
    }

    // @ts-ignore
    const context = iframe?.contentWindow?.document;
    if (!context) {
      logger.error({
        fn: addDocumentUploadConfirmationIframe,
        message: 'Unable to get iframe document context',
      });
      return;
    }

    // if we're not in the process of submitting, then that means iframe contains upload
    // page and we need to do all the setup required to do "ghost" uploading in the background
    if (!isSubmitting) {
      // setup the iframe to match the user's UI dialogs (custom upload fields)
      customizeDocumentsControls(CLAIM_FILE_UPLOAD_FIELDS, context);

      setUploadButtonState();

      setUploadBtnOnClick(context);
    }

    if (isSubmitting) {
      const messageLabel = context.getElementById('MessageLabel');

      // Handle when iframe is submitted (submitted correctly page)
      // In this case, we just refresh to reload the documents page and get
      // previously uploaded documents
      if (
        messageLabel &&
        messageLabel.innerHTML === 'Submission completed successfully.'
      ) {
        logger.info({
          fn: addDocumentUploadConfirmationIframe,
          message:
            'Files uploaded successfully! Reload iframe OR fetching uploading documents...',
        });
        // @ts-ignore
        iframe.src = iframeSrc;
        POWERPOD.documents.iframeLoading = true;
        POWERPOD.documents.isSubmitting = false;
        POWERPOD.documents.observerSet = false;
        POWERPOD.documents.observer = null;
        setInterval(() => setupNotesContentObserver(), 1000);

        const formId = getFormId();
        getDocumentsData({
          id: formId,
          onSuccess: (data) => {
            logger.info({
              fn: addDocumentUploadConfirmationIframe,
              message: 'Successfully fetched data for uploaded documents',
              data: { data },
            });

            POWERPOD.documents.docData = data;
            validateRequiredFields();

            const filenamesString = getFilenamesFromDocData(data);

            // overriding iframe loading, since we no longer need to load iframe a 2nd time
            // POWERPOD.documents.iframeLoading = false;
            checkForFilesToUpload(context, filenamesString);
          },
          skipCache: true,
        });
      }
    }
  };
}
