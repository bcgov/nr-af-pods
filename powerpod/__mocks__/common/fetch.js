import { delay } from '../../src/js/common/utils.js';

import getMunicipalDataJson from '../../src/test/mock/api/get_municipal_data.json';
import getExpenseTypeDataJson from '../../src/test/mock/api/get_expense_type_data.json';
import getDocumentsDataJson from '../../src/test/mock/api/get_documents_data.json';
import postDocumentDataJson from '../../src/test/mock/api/post_document_data.json';
import getContactDataJson from '../../src/test/mock/api/get_contact_data.json';
import deleteDocumentDataJson from '../../src/test/mock/api/delete_document_data.json';

export function getMunicipalData() {
  return getMunicipalDataJson;
}

export function getExpenseTypeData() {
  return getExpenseTypeDataJson;
}

export function getDocumentsData() {
  return getDocumentsDataJson;
}

export async function postDocumentData() {
  await delay(3000);
  return postDocumentDataJson;
}

export function getContactData() {
  return getContactDataJson;
}

export function deleteDocumentData() {
  return deleteDocumentDataJson;
}
