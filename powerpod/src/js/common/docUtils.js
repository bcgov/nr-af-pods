import { Logger } from './logger.js';
import { POWERPOD } from '../common/constants.js';

const logger = new Logger('common/documents');

POWERPOD.docUtils = {
  getFilenamesFromDocData,
  getFilenamesFromFieldData,
  compareDocDataToUploadFieldData,
};

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
