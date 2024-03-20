/*
  -------------------
  FILE INFO
  -------------------
  tags: ["Documents", "Application", "JS"]
  version: 1.0.0
  name: Documents
  type: JS Script
  description: This is the JS script for the Documents step in APPLICATION form.
*/
if (window.jQuery) {
  (function ($) {
    const MAXIMUM_FILE_SIZE_IN_KB = 25600;
    const allowedMimeTypes = [
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
    const minifiedMimeTypes = [
      'text/csv',
      'application/msword',
      'application/vnd*',
      'application/pdf',
      'image/*',
    ];
    const allowedFileTypes = [
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
    var fieldsForFileUploadControls = [
      "quartech_partialbudget",
      "quartech_relatedquotesandplans",
    ];
    const FILE_UPLOAD_ID_SUFFIX = "_AttachFile";

    $(document).ready(function () {
      customizeDocumentsControls()
    });

    this.customizeDocumentsControls = function() {
      displayInstructions()

      addFileUploadControls(fieldsForFileUploadControls)
      
      // initFileUpload(); // This version was for ABPP S1 and S2. These 2 programs have been closed

      const attachFileLabel = document.querySelector('#AttachFileLabel')
      if (attachFileLabel) {
        attachFileLabel.parentNode.parentNode.parentNode.hidden = true // hide the oob attach file control.
      }
    }

    this.displayInstructions = function() {
      if (!document.querySelector('#supportingDocumentationNote')) {
        const supportingDocumentationNoteHtmlContent = `
        <div id="supportingDocumentationNote" style="padding-bottom: 20px;">
          Please Choose or Drag & Drop files to the grey box below to upload the following documents as attachments (as applicable)
        </div>`;
  
        $('fieldset[aria-label="Supporting Documents"] > legend').after(
          supportingDocumentationNoteHtmlContent
        );
  
        const beforeContinuingNoteHtmlContent = `
          <div id="beforeContinuingNote" style="padding-bottom: 20px;">
            Please ensure you have the correct files before clicking "Next". If you move to the next stage of the form you can no longer delete uploaded files. However, you can always add new files.<br />
            <br />
            If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement.
          </div>
        `;
  
        $('fieldset[aria-label="Supporting Documents"]').after(beforeContinuingNoteHtmlContent);
      }
    }
    
    this.addFileUploadControls = function (fieldsForFileUploadControls) {
      fieldsForFileUploadControls.forEach((fieldName) => {
        addFileUpload(fieldName);

        disableField(fieldName);
      });

      addTitleToNotesControl();
    };
    
    this.addTitleToNotesControl = function () {
      $(`#notescontrol`).prepend(
        "<div><h4>Documents Previously Uploaded</h4></div>"
      );
    };

    this.disableField = function (fieldName) {
      $(`#${fieldName}`).attr("readonly", "readonly");
    };

    this.addFileUpload = function (toFieldId) {
      const fieldFileUploadId = toFieldId + FILE_UPLOAD_ID_SUFFIX;
      const fileUploadHtml = `<input type="file" multiple="multiple" id="${fieldFileUploadId}" accept="${allowedFileTypes.join(
        ","
      )}" aria-label="Attach files..." style='height: 50px; background: lightgrey; width: 100%; padding: 10px 0 0 10px;'>`;

      const divControl = $(`#${toFieldId}`).parent();

      divControl.append(fileUploadHtml);

      $("#AttachFile").attr(
        "accept",
        allowedFileTypes.join(",") + "," + allowedMimeTypes.join(",")
      );
      $(`#${fieldFileUploadId}`).change(function (e) {
        const targetFieldId = fieldFileUploadId.replace(
          FILE_UPLOAD_ID_SUFFIX,
          ""
        );

        let chosenFiles = "";
        for (var i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const isValidFileUpload = validateFileUpload(file);

          if (isValidFileUpload) {
            chosenFiles += `${file.name} (${formatBytes(file.size)})\n`;
            $(`#${targetFieldId}`).val(chosenFiles);
          } else {
            $(`#${fieldFileUploadId}`).val("");
            $(`#${targetFieldId}`).val("");
          }
        }

        updateOobFileUpload();
      });
    };

    this.updateOobFileUpload = function () {
      let selectedFiles = [];

      fieldsForFileUploadControls.forEach((fieldName) => {
        let fileUploadId = fieldName + FILE_UPLOAD_ID_SUFFIX;

        const fieldFileUploadCtr = document.getElementById(fileUploadId);

        for (var i = 0; i < fieldFileUploadCtr.files.length; i++) {
          const file = fieldFileUploadCtr.files[i];
          selectedFiles.push(file);
        }
      });

      const fileList = fileListFrom(selectedFiles);

      const attachFileCtr = document.getElementById("AttachFile");
      attachFileCtr.onchange = console.log;
      attachFileCtr.files = fileList;
      

      console.log(attachFileCtr.files);
    };
    
    /** @params {File[]} files - Array of files to add to the FileList */
    this.fileListFrom = function (files) {
      const b = new ClipboardEvent("").clipboardData || new DataTransfer();

      for (const file of files) b.items.add(file);
      return b.files;
    };

    // binary conversion of bytes
    this.formatBytes = function (
      bytes,
      decimals = 2,
      forceFormat,
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
    };

    this.validateFileUpload = function (file) {
      const re = /(?:\.([^.]+))?$/; // regex to pull file extension string
      const ext = re.exec(file.name)[1];

      // note: microsoft seems to use binary system for byte conversion
      const fileSizeInKB = formatBytes(file.size, 2, 'KB', true);

      const isValidFileSize = fileSizeInKB <= MAXIMUM_FILE_SIZE_IN_KB; // 10 MB size limit
      const isValidFileType = allowedFileTypes.includes(`.${ext}`);

      const isValidUpload = isValidFileSize && isValidFileType;

      if (isValidUpload) {
        return true;
      }

      let alertStr = '';
      if (!isValidFileType && !isValidFileSize) {
        alertStr = `Selected file(s) do not match the allowed file extensions and exceed file size limit of 10MB. Please upload a valid file size & file type of: ${allowedFileTypes.join(
          ', '
        )}.`;
      } else if (!isValidFileType) {
        alertStr = `Selected file(s) do not match the allowed file extensions. Please upload a file type of: ${allowedFileTypes.join(
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
    };

    this.initFileUpload = function () {
      $('#AttachFile').attr(
        'accept',
        allowedFileTypes.join(',') + ',' + allowedMimeTypes.join(',')
      );
      $('#AttachFile').change(function (e) {
        for (var i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const isValidFileUpload = validateFileUpload(file);

          if (!isValidFileUpload) {
            $('#AttachFile').val('');
            populateSelectedFiles([]);
            e.preventDefault();
            return;
          }
        }
        populateSelectedFiles(e.target.files);
      });

      const fileControlDiv = $('#AttachFile').parent();
      fileControlDiv.prepend(`
        <div>
          <div>Please Choose or Drag&Drop files to the grey box below to upload the following documents as attachments (as applicable)</div>
          <ul>
            <li>Learning/event budget</li>
            <li title='Consultant resume outlining any educational accomplishments and relevant certifications'>Consultant resume</li>
            <li>Supporting consultant resume (if applicable)</li>
            <li>Verification of the last year of farming income</li>
            <li>Direct Deposit Application (template available on program webpage)</li>
          </ul>
          <div>Please ensure you have the correct files before clicking “Next” on the application.  If you move to the next stage of the application you can no longer delete uploaded files. However, you can always add new files.</div>
          <div>If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").</div>
        </div>
      `);

      $('#AttachFile')[0].style =
        'height: 80px; background: lightgrey; width: 100%; padding: 10px 0 0 10px;';
    };

    this.populateSelectedFiles = function (filesArray) {
      let selectedFilesDiv = document.querySelector('#selected_files');

      // if "Selected Files" is shown but there are no files, remove the div
      if (selectedFilesDiv && (!filesArray || !filesArray?.length)) {
        selectedFilesDiv.parentNode.removeChild(selectedFilesDiv);
      }

      if (!selectedFilesDiv) {
        selectedFilesDiv = document.createElement('div');
        selectedFilesDiv.id = `selected_files`;

        const fileCellDiv = $('#AttachFile').parent().parent();
        fileCellDiv.prepend(selectedFilesDiv);
      }

      let selectedFilesHtml = '';

      for (var i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        selectedFilesHtml += `<div><span class="fa fa-file"></span><span>&nbsp;${
          file.name
        } (${formatBytes(file.size)})</span></div>`;
      }

      if (selectedFilesHtml != '') {
        selectedFilesHtml = `<div><h5>Selected files to be uploaded</h5></div> ${selectedFilesHtml}`;
      }
      selectedFilesDiv.innerHTML = selectedFilesHtml;
    };
  })(window.jQuery);
}
