/*
  -------------------
  FILE INFO
  -------------------
  tags: ["Documents", "Claim", "JS"]
  version: 1.0.3
  name: Documents
  type: JS Script
  description: This is the JS script for the Documents step in CLAIM form.
*/
if (window.jQuery) {
  (function ($) {
    const MAXIMUM_FILE_SIZE_IN_KB = 15360;
    const MAXIMUM_FILE_SIZE_TEXT = '15MB';
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
    const fieldsForFileUploadControls = [
      'quartech_completedmeetingandserviceprovisionlog',
      'quartech_copyofconsultantfinalreportorbusinessplan',
      'quartech_invoices',
      'quartech_proofofpayment',
      'quartech_businessplan',
      'quartech_growthstrategy',
      'quartech_activityreport',
    ];
    const FILE_UPLOAD_ID_SUFFIX = '_AttachFile';

    $(document).ready(function () {
      customizeDocumentsControls();
    });

    this.customizeDocumentsControls = function () {}
      addFileUploadControls(fieldsForFileUploadControls);

      const attachFileLabel = document.querySelector('#AttachFileLabel');
      if (attachFileLabel) {
        attachFileLabel.parentNode.parentNode.parentNode.hidden = true; // hide the oob attach file control.
      }
    };

    this.addFileUploadControls = function (fieldsForFileUploadControls) {
      fieldsForFileUploadControls.forEach((fieldName) => {
        addFileUpload(fieldName);

        disableField(fieldName);
      });

      addTitleToNotesControl();
    };

    this.addTitleToNotesControl = function () {
      $(`#notescontrol`).prepend(
        '<div><h4>Documents Previously Uploaded</h4></div>'
      );
    };

    this.disableField = function (fieldName) {
      $(`#${fieldName}`).attr('readonly', 'readonly');
    };

    this.addFileUpload = function (toFieldId) {
      const fieldFileUploadId = toFieldId + FILE_UPLOAD_ID_SUFFIX;
      const fileUploadHtml = `<input type="file" multiple="multiple" id="${fieldFileUploadId}" accept="${allowedFileTypes.join(
        ','
      )}" aria-label="Attach files..." style='height: 50px; background: lightgrey; width: 100%; padding: 10px 0 0 10px;'>`;

      const divControl = $(`#${toFieldId}`).parent();

      divControl.append(fileUploadHtml);

      $('#AttachFile').attr(
        'accept',
        allowedFileTypes.join(',') + ',' + allowedMimeTypes.join(',')
      );
      $(`#${fieldFileUploadId}`).change(function (e) {
        const targetFieldId = fieldFileUploadId.replace(
          FILE_UPLOAD_ID_SUFFIX,
          ''
        );

        let chosenFiles = '';
        for (var i = 0; i < e.target.files.length; i++) {
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

      const attachFileCtr = document.getElementById('AttachFile');
      attachFileCtr.onchange = console.log;
      attachFileCtr.files = fileList;

      console.log(attachFileCtr.files);
    };

    /** @params {File[]} files - Array of files to add to the FileList */
    this.fileListFrom = function (files) {
      const b = new ClipboardEvent('').clipboardData || new DataTransfer();

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
        alertStr = `Selected file(s) do not match the allowed file extensions and exceed file size limit of ${MAXIMUM_FILE_SIZE_TEXT}. Please upload a valid file size & file type of: ${allowedFileTypes.join(
          ', '
        )}.`;
      } else if (!isValidFileType) {
        alertStr = `Selected file(s) do not match the allowed file extensions. Please upload a file type of: ${allowedFileTypes.join(
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
    };
  })(window.jQuery);
}
