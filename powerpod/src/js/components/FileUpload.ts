import shoelace from '../../assets/css/shoelace.css';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { useScript } from '../common/scripts';
import {
  ALLOWED_FILE_TYPES,
  RawFile,
  UploadedDoc,
  formatBytes,
  generateDocumentSubject,
  generateFileInputStr,
  processDocumentsData,
  readFileInputStr,
  validateFileUpload,
} from '../common/documents';
import {
  deleteDocumentData,
  getDocumentsData,
  postDocumentData,
} from '../common/fetch';
import { Logger } from '../common/logger';
import { readFileAsBase64 } from '../common/file';
import { getFormId } from '../common/form';
import { getCurrentTimeUTC } from '../common/date';
import { delay } from '../common/utils';
import { getFormType } from '../common/applicationUtils';

const logger = Logger('components/fileUpload');

@customElement('file-upload')
class FileUpload extends LitElement {
  @query('#fileUploadElement') fileUploadElement: HTMLDivElement | undefined;
  @query('#inputElement') inputElement: HTMLInputElement | undefined;
  @query('#dropElement') dropElement: HTMLDivElement | undefined;
  @property({ type: String }) fileInputStr: string = '';
  @property({ type: String }) formType: string = '';
  @property() fieldName = '';
  @property() customStyle = '';
  @property({ type: Array }) docs: UploadedDoc[] = [];
  @property() handleDropHandler: (e: any) => void = () => {};
  @property() highlightHandler: (e: any) => void = () => {};
  @property() unhighlightHandler: (e: any) => void = () => {};

  static styles = css`
    .file-upload-card {
      width: 100%;
    }

    .file-upload-card [slot='header'] {
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 600;
    }

    sl-tooltip::part(body) {
      font-size: 1.2rem;
    }

    .file-upload-card h3 {
      margin: 0;
    }

    .highlight {
      background-color: LightGray;
    }

    .file-upload-card sl-icon-button {
      font-size: var(--sl-font-size-medium);
    }

    sl-button.huge::part(base) {
      font-size: 1.5rem;
    }

    .documents > * {
      margin: 5px;
    }

    .doc-card > * {
      margin: 0 5px;
    }

    sl-icon.status {
      font-size: 16px;
    }

    sl-icon.status::part(svg) {
      margin-top: 3px;
    }

    sl-card.doc-card-failed::part(base) {
      background-color: var(--sl-color-danger-100);
    }

    sl-card.doc-card-uploaded::part(base) {
      background-color: var(--sl-color-success-100);
    }

    sl-card.doc-card-pending::part(base) {
      background-color: var(--sl-color-warning-100);
    }

    sl-alert::part(base) {
      font-size: 1.5rem;
    }
    sl-alert::part(icon) {
      font-size: 2rem;
    }
    ${unsafeCSS(shoelace)}
  `;

  // make fetch call as soon as component is mounted
  connectedCallback(): void {
    super.connectedCallback();
    useScript('shoelace');
    this.getDocuments(true);
  }

  firstUpdated(props: Map<string, string>): void {
    if (this.dropElement) {
      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
        this.dropElement?.addEventListener(
          eventName,
          this.preventDefaults,
          false
        );
      });
      // Highlight drop area when a file is dragged over it
      this.highlightHandler = this.highlight.bind(this);
      ['dragenter', 'dragover'].forEach((eventName) => {
        this.dropElement?.addEventListener(
          eventName,
          this.highlightHandler,
          false
        );
      });
      // Unhighlight drop area when a file is dragged out of it
      this.unhighlightHandler = this.unhighlight.bind(this);
      ['dragleave', 'drop'].forEach((eventName) => {
        this.dropElement?.addEventListener(
          eventName,
          this.unhighlightHandler,
          false
        );
      });
      // Handle dropped files
      this.handleDropHandler = this.handleDrop.bind(this);
      this.dropElement.addEventListener('drop', this.handleDropHandler, false);
    }
  }

  async getDocuments(emitEvent = false) {
    logger.info({
      fn: 'getDocuments',
      message: 'Calling getDocuments task',
      data: { fileInputStr: this.fileInputStr },
    });
    const { data } = await getDocumentsData({ formId: getFormId() });
    if (!data) {
      throw new Error('Get docs task failed');
    }
    const allDocs = processDocumentsData(data);
    this.docs = readFileInputStr(this.fileInputStr, allDocs);
    if (emitEvent) this.emitEvent();
  }

  async getDocument(fileId: string) {
    logger.info({
      fn: 'getDocument',
      message: 'Calling getDocument task',
      data: { fileId },
    });
    try {
      const { data } = await getDocumentsData({ formId: getFormId() });
      if (!data) {
        throw new Error('Get docs task failed');
      }
      const allDocs = processDocumentsData(data);
      const doc = allDocs.find((doc) => doc.subject.includes(fileId));

      if (!doc) {
        logger.error({
          fn: 'getDocument',
          message: `Could not find doc to delete by fileId: ${fileId}`,
        });
        return;
      }
      return doc;
    } catch (e) {
      logger.error({
        fn: 'getDocument',
        message: 'getDocument task failed',
        data: { e, fileId },
      });
    }
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight() {
    if (this.dropElement) {
      console.log('adding highlight class');
      this.dropElement.classList.add('highlight');
    }
  }

  unhighlight() {
    if (this.dropElement) {
      console.log('removing highlight class');
      this.dropElement.classList.remove('highlight');
    }
  }

  handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    this.handleFiles(files);
  }

  handleFileSelect(e) {
    logger.info({
      fn: 'handleFileSelect',
      message: 'Start handling file select',
      data: { e },
    });
    var files = e.target.files;
    this.handleFiles(files);
    this.inputElement.value = null;
  }

  handleFiles(files) {
    [...files].forEach((file) => {
      const isValidFileUpload = validateFileUpload(file);
      if (isValidFileUpload) {
        this.uploadFile(file, this.fieldName);
      }
    });
  }

  async uploadFile(file: RawFile, fieldName: string) {
    logger.info({
      fn: 'uploadFile',
      message: `Start uploading file for fieldName: ${fieldName}`,
      data: { file, fieldName },
    });
    const { name, type, size } = file;

    const docIndex =
      this.docs.push({
        filename: name,
        filesize: size,
        mimetype: type,
        status: 'pending',
        subject: null,
        modifiedon: null,
        documentbody: null,
        annotationid: null,
        fileId: null,
        formType: this.formType,
      }) - 1;

    this.emitEvent();

    logger.info({
      fn: 'uploadFile',
      message: `Added pending file to docs array for fieldName: ${fieldName}`,
      data: { file, fieldName, docs: this.docs, docIndex },
    });

    try {
      const documentbody = await readFileAsBase64(file);
      const { subject, fileId } = await generateDocumentSubject(
        file,
        this.fieldName
      );
      const formId = getFormId();

      if (!documentbody?.length || !subject?.length || !formId?.length) {
        logger.error({
          fn: 'uploadFile',
          message: `Failed to postDocument for fieldName: ${fieldName}`,
          data: {
            file,
            fieldName,
            documentbody,
            subject,
            formId,
          },
        });
        return;
      }

      const formType = getFormType();

      const payload = {
        formId,
        subject,
        filename: name,
        documentbody,
        mimetype: type,
      };

      logger.info({
        fn: this.uploadFile,
        message: `Posting document for fieldName: ${fieldName}`,
        data: { payload, file, fieldName, formType },
      });

      this.docs[docIndex] = {
        fileId,
        filesize: size,
        modifiedon: getCurrentTimeUTC(),
        status: 'pending',
        annotationid: '',
        ...payload,
      };

      const response = await postDocumentData({
        ...payload,
        formType,
        timeout: 120 * 1000, // for file uploads allow 120 seconds
      });

      if (!response || response.jqXHR?.status !== 204) {
        logger.error({
          fn: this.uploadFile,
          message: 'Failed to post document',
          data: { payload, response, file, fieldName },
        });
        this.docs[docIndex].status = 'failed';
        this.emitEvent();
        return;
      }

      this.docs[docIndex].status = 'uploaded';

      logger.info({
        fn: 'uploadFile',
        message: 'Successfully posted document',
        data: {
          payload,
          response,
          file,
          fieldName,
          uploadedDocs: this.docs,
        },
      });
      this.emitEvent();
    } catch (e) {
      logger.error({
        fn: 'uploadFile',
        message: 'File upload encountered an error',
        data: { e },
      });
      this.docs[docIndex].status = 'failed';
      this.emitEvent();
    }
  }

  async deleteDocument(doc: UploadedDoc, docIndex: number) {
    logger.info({
      fn: 'deleteDocument',
      message: `Start deleting document...`,
      data: { doc, docIndex },
    });
    this.docs[docIndex].status = 'deleting';
    this.emitEvent();

    const { fileId } = doc;
    let annotationId = doc.annotationid;
    const startTime = Date.now();
    try {
      if (!annotationId && fileId) {
        const documentToDelete = await this.getDocument(fileId);
        annotationId = documentToDelete?.annotationid;
      }

      if (!annotationId) {
        let errorMsg =
          'Could not find annotationid, likely file does not exist in dynamics';
        logger.error({
          fn: 'deleteDocument',
          message: errorMsg,
          data: { doc, docIndex, fileId },
        });
        throw new Error(errorMsg);
      }

      logger.info({
        fn: 'deleteDocument',
        message: `Start deleting document for for annotationId: ${annotationId}`,
        data: { doc },
      });
      const response = await deleteDocumentData({
        annotationId,
        returnData: true,
      });
      // purposely do not "return" on fail, remove file from list of user's file, even if hard delete fails
      if (!response || response.jqXHR?.status !== 204) {
        logger.error({
          fn: 'deleteDocument',
          message: `Failed to delete document for annotationId: ${annotationId}`,
          data: { response, doc, annotationId },
        });
      }
      const elapsedTime = Date.now() - startTime;
      logger.info({
        fn: 'deleteDocument',
        message: `Done deleting document for annotationId: ${annotationId}, took ${elapsedTime} ms`,
        data: { response, doc, annotationId },
      });
    } catch (e) {
      logger.error({
        fn: 'deleteDocument',
        message: 'File delete encountered an error, remove document anyway',
        data: { e },
      });
    } finally {
      this.docs.splice(docIndex, 1); // 2nd parameter means remove one item only
      this.emitEvent();
    }
  }

  emitEvent() {
    let event = new CustomEvent('onChangeFileUpload', {
      detail: {
        message: 'File upload value has changed',
        // @ts-ignore
        id: this.id,
        value: JSON.stringify(this.docs),
        fileInputStr: generateFileInputStr(this.docs),
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  handleEmitEvent(event: Event) {
    const { target } = event;
    if (target) this.fileInputStr = (target as HTMLSelectElement).value ?? '';
    this.emitEvent();
  }

  // footerElement = () => `
  //   <div slot='footer'>
  //     <sl-button id='quartechUploadBtn' class='huge' variant='success'>
  //       Add
  //     </sl-button>
  //     <sl-button id='quartechUploadBtn' class='huge' variant='danger'>
  //       Cancel
  //     </sl-button>
  //   </div>
  // `;

  render() {
    return html`
      <sl-card class="file-upload-card">
        <div slot="header" id="dropElement">
          <div>
            <sl-icon
              name="upload"
              style="font-size: 24px; vertical-align: -5px; padding-right: 5px;"
            ></sl-icon>
            <span>Drag and drop files here or Choose Files</span>
          </div>
          <input
            type="file"
            multiple="multiple"
            aria-label="Choose files"
            accept="${ALLOWED_FILE_TYPES.join(',')}"
            id="inputElement"
            style="display: none;"
            @change=${this.handleFileSelect}
          />
          <sl-button
            class="huge"
            variant="primary"
            @click="${() => this.inputElement?.click()}"
          >
            Choose files
          </sl-button>
        </div>

        <div class="documents">
          ${!this.docs?.length
            ? html`
                <sl-alert id="docStatusAlert" variant="primary" open>
                  <sl-icon slot="icon" name="info-circle"></sl-icon>
                  <strong>No new files have been selected for upload</strong
                  ><br />
                  Please click "Choose Files" or Drag & Drop files into the box
                  above.
                </sl-alert>
              `
            : html``}
          ${this.docs?.map((doc, docIndex) => {
            const { filename, fileId, status, filesize } = doc;
            let statusText = '',
              statusIcon = '',
              statusColor = '';
            if (status === 'pending') {
              statusText = 'Upload in progress...';
              statusIcon = 'exclamation-triangle';
              statusColor = 'orange';
            } else if (status === 'uploaded' || status === 'deleting') {
              statusText = 'Successfully uploaded!';
              statusIcon = 'check2-circle';
              statusColor = 'green';
            } else if (status === 'failed') {
              statusText = 'Uploaded failed, please try again.';
              statusIcon = 'exclamation-circle';
              statusColor = 'red';
            }
            return html`
              <sl-card class="doc-card doc-card-${status}" id="${fileId}">
                ${filename} (${formatBytes(filesize)})
                <sl-tooltip
                  id="${fileId}-status-tooltip"
                  content="${statusText}"
                  style="--max-width: 200px;"
                >
                  ${status === 'pending'
                    ? html` <sl-spinner
                        style="font-size: 24px; --track-width: 5px; vertical-align: -8px"
                      ></sl-spinner>`
                    : html` <sl-button variant="default" circle>
                        <sl-icon
                          id="${fileId}-icon"
                          name="${statusIcon}"
                          class="status"
                          style="color: ${statusColor};"
                        ></sl-icon>
                      </sl-button>`}
                </sl-tooltip>
                <sl-tooltip
                  id="${fileId}-tooltip"
                  content="Remove file"
                  style="--max-width: 200px;"
                >
                  ${status === 'deleting'
                    ? html` <sl-spinner
                        style="--indicator-color: var(--sl-color-danger-600); --track-color: var(--sl-color-danger-400); font-size: 24px; --track-width: 5px; vertical-align: -8px"
                      ></sl-spinner>`
                    : html`<sl-button
                        class="huge"
                        variant="default"
                        circle
                        @click="${() => {
                          this.deleteDocument(doc, docIndex);
                        }}"
                      >
                        <sl-icon
                          name="x"
                          style="vertical-align: -5px; font-size: 20px; color: var(--sl-color-danger-400);"
                        ></sl-icon>
                      </sl-button>`}
                </sl-tooltip>
              </sl-card>
            `;
          })}
        </div>

        ${this.docs?.some((doc) => doc.status === 'pending')
          ? html`
              <div slot="footer">
                <sl-alert id="docStatusAlert" variant="primary" open>
                  <sl-spinner
                    slot="icon"
                    style="font-size: 50px; --track-width: 10px;"
                  ></sl-spinner>

                  <strong>Please wait while files are uploading...</strong>
                  <br />
                  Interupting this process may result in a failed upload.
                </sl-alert>
              </div>
            `
          : html``}
        ${this.docs?.some((doc) => doc.status === 'failed')
          ? html`
              <div slot="footer">
                <sl-alert id="docStatusAlert" variant="danger" open>
                  <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                  <strong>Some files may not have uploaded correctly:</strong
                  ><br />
                  ${this.docs.map((doc) => {
                    if (doc.status === 'failed')
                      return html`${doc.filename}<br />`;
                  })}
                  Please click "Choose Files" or drag & drop your files, and try
                  uploading them again.
                </sl-alert>
              </div>
            `
          : html``}
        ${this.docs?.length &&
        !this.docs.some(
          (doc) => doc.status === 'failed' || doc.status === 'pending'
        )
          ? html`
              <div slot="footer">
                <sl-alert id="docStatusAlert" variant="success" open>
                  <sl-icon slot="icon" name="check2-circle"></sl-icon>
                  <strong>Your documents have been uploaded successfully</strong
                  ><br />
                  You can safely continue now. If you have more documents to
                  upload, feel free to upload more.
                </sl-alert>
              </div>
            `
          : html``}
      </sl-card>
    `;
  }
}
