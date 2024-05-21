import { POWERPOD } from './constants.js';
import { getRequestVerificationToken } from './dynamics.js';
import { Logger } from './logger.js';

const logger = Logger('common/fetch');

export const ENDPOINT_URL = {
  get_env_vars_data:
    "/_api/environmentvariabledefinitions?$filter=contains(schemaname,'quartech_')&$select=schemaname,environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)",
  get_application_form_data: (programId) =>
    `/_api/msgov_programs(${programId})?$select=msgov_programid, quartech_disabledchefsdemographicinfo, msgov_programname, quartech_applicantportalprogramname, quartech_applicantportalprogramstreamjsonconfig, quartech_portalapplicationpagetitle, quartech_portalapplicationpagesubtitle, quartech_portalapplicationpagedescription, quartech_programabbreviation, quartech_programemailaddress, quartech_portalappactivityinfohiddenfields, quartech_portalappprojectdeschiddenfields, quartech_portalappfieldsdisplaynamesmapping, quartech_typesofbusinesstodisplay, quartech_applicantportalapplicationformconfigjson, quartech_activitiestypestodisplay&$expand=quartech_ApplicantPortalConfig($select=quartech_name,quartech_configdata)`,
  get_claim_form_data: (programId) =>
    `/_api/msgov_programs(${programId})?$select=msgov_programid, msgov_programname, quartech_applicantportalprogramname, quartech_claimformheaderhtmlcontent, quartech_applicantportalclaimformjson, quartech_applicantportalprogramstreamjsonconfig, quartech_portalapplicationpagetitle, quartech_portalapplicationpagesubtitle, quartech_portalapplicationpagedescription, quartech_programabbreviation, quartech_programemailaddress, quartech_portalappactivityinfohiddenfields, quartech_portalappprojectdeschiddenfields, quartech_portalappfieldsdisplaynamesmapping, quartech_typesofbusinesstodisplay, quartech_applicantportalapplicationformconfigjson, quartech_activitiestypestodisplay&$expand=quartech_ApplicantPortalConfig($select=quartech_name,quartech_configdata)`,
  get_municipal_data:
    '/_api/quartech_municipals?$select=quartech_name,quartech_municipalid&$expand=quartech_RegionalDistrict($select=quartech_name,quartech_regionaldistrictid,_quartech_censusofagricultureregion_value)',
  get_expense_type_data:
    '/_api/quartech_expensetypes?$select=quartech_expensetypeid,quartech_expensetype',
  get_documents_data: (formId) =>
    `/_api/annotations?$filter=_objectid_value%20eq%20${formId}&$select=filename,filesize,modifiedon,subject,isdocument,objecttypecode,annotationid,mimetype`,
  get_document_data: (annotationId) =>
    `/_api/annotations?$filter=annotationid%20eq%20${annotationId}&$select=filename,filesize,modifiedon,subject,isdocument,objecttypecode,documentbody,annotationid`,
  post_document_data: `/_api/annotations`,
  delete_document_data: (annotationId) => `/_api/annotations(${annotationId})`,
  get_contact_data: (contactId) =>
    `/_api/contacts?$filter=contactid%20eq%20${contactId}&$select=fullname`,
  get_orgbook_autocomplete_data:
    'https://orgbook.gov.bc.ca/api/v3/search/autocomplete',
  get_orgbook_topic_data: 'https://orgbook.gov.bc.ca/api/v4/search/topic',
  get_orgbook_credentials_data: (topicId) =>
    `https://orgbook.gov.bc.ca/api/v4/topic/${topicId}/credential-set`,
  patch_quartech_claim_data: (id) => `/_api/quartech_claims(${id})`,
};

POWERPOD.fetch = {
  fetch,
  CACHED_RESULTS: {},
  ENDPOINT_URL,
  getEnvVarsData,
  getApplicationFormData,
  getClaimFormData,
  getMunicipalData,
  getExpenseTypeData,
  getOrgbookAutocompleteData,
  getOrgbookTopicData,
  getOrgbookCredentialsData,
  getDocumentsData,
  getDocumentData,
  postDocumentData,
  deleteDocumentData,
  getContactData,
  patchClaimData,
};

const CONTENT_TYPE = {
  json: 'application/json; charset=utf-8',
};

const DATATYPE = {
  json: 'json',
};

const setODataHeaders = (XMLHttpRequest) => {
  XMLHttpRequest.setRequestHeader('Accept', 'application/json');
  XMLHttpRequest.setRequestHeader('OData-MaxVersion', '4.0');
  XMLHttpRequest.setRequestHeader('OData-Version', '4.0');
  XMLHttpRequest.setRequestHeader('Prefer', 'odata.include-annotations="*"');
};

const setReqVerificationHeaderToken = (XMLHttpRequest) => {
  const requestVerificationToken = getRequestVerificationToken();
  if (!requestVerificationToken) {
    logger.warn({
      fn: setReqVerificationHeaderToken,
      message: 'Failed to set request verification token header',
    });
  }
  XMLHttpRequest.setRequestHeader(
    '__RequestVerificationToken',
    requestVerificationToken
  );
  logger.info({
    fn: setReqVerificationHeaderToken,
    message: `Successfully set header __RequestVerificationToken=${requestVerificationToken}`,
  });
};

// Note: Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation
// async: false with jqXHR ($.Deferred) is deprecated; you must use the success/error/complete
// callback options instead of the corresponding methods of the jqXHR object such as jqXHR.done().

// TODO: cleanup usage of ".done()" deprecated method in project, functions still using:
// e.g. "getTopic" & "getTopicCredentials" in src/js/application/steps/applicantInfo.js
export async function fetch(params) {
  const {
    method = 'GET',
    url: endpointUrl,
    beforeSend,
    onSuccess,
    onError,
    async = true,
    data = {},
    processData = true, // whether to automatically convert data obj to application/x-www-form-urlencoded
    datatype, // request data type
    contentType, // expected response content type
    includeODataHeaders = false,
    skipCache = false,
    returnData = false, // return the data directly, skips having to pass onSuccess handler
    addRequestVerificationToken = false, // needed for post reqs
    timeout = 60 * 1000, // default to 60 second timeout
  } = params;
  // check cache if used
  const paramsToHash = params;
  delete paramsToHash.skipCache;
  const reqHash = JSON.stringify(paramsToHash);
  let url = endpointUrl;
  if (window.location.hostname === 'localhost') {
    url = 'https://af-pods-dev.powerappsportals.com' + endpointUrl;
  }
  logger.info({
    fn: fetch,
    message: 'Starting fetch request...',
    data: { ...params, fetch: POWERPOD.fetch, url },
  });
  // caching is only supported for GET requests
  if (
    method === 'GET' &&
    !skipCache &&
    POWERPOD.fetch.CACHED_RESULTS[reqHash]
  ) {
    const { data, textStatus, jqXHR } = POWERPOD.fetch.CACHED_RESULTS[reqHash];
    logger.info({
      fn: fetch,
      message: `returning cached data for url: ${url}`,
      data: {
        data,
        params,
      },
    });
    if (returnData) {
      return Promise.resolve({
        data,
        textStatus,
        jqXHR,
      });
    }
    return Promise.resolve(onSuccess(data, textStatus, jqXHR));
  }
  // @ts-ignore
  return $.ajax({
    method,
    url,
    contentType,
    datatype,
    data,
    processData,
    async,
    timeout,
    beforeSend: function (XMLHttpRequest) {
      if (addRequestVerificationToken) {
        setReqVerificationHeaderToken(XMLHttpRequest);
      }
      if (includeODataHeaders) setODataHeaders(XMLHttpRequest);
      if (beforeSend && typeof beforeSend === 'function') beforeSend();
    },
    success: function (data, textStatus, jqXHR) {
      logger.info({
        fn: fetch,
        message: 'success handler called',
        data: {
          data,
          params,
        },
      });
      // always cache data
      POWERPOD.fetch.CACHED_RESULTS[reqHash] = { data, textStatus, jqXHR };

      if (returnData) {
        logger.info({
          fn: fetch,
          message: `skipping onSuccess handler call: ${url}`,
          data: {
            data,
            params,
          },
        });
        return;
      }
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(data, textStatus, jqXHR);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      logger.error({
        fn: fetch,
        message: `Error handler called for url: ${url}`,
        data: { jqXHR, textStatus, errorThrown },
      });
      if (onError && typeof onError === 'function') {
        onError(jqXHR, textStatus, errorThrown);
      }
    },
  }).then((data, textStatus, jqXHR) => {
    if (returnData) {
      logger.info({
        fn: fetch,
        message: `returning data for url: ${url}`,
        data: {
          data,
          textStatus,
          jqXHR,
          params,
        },
      });
      return Promise.resolve({ data, textStatus, jqXHR });
    }
  });
}

export async function getEnvVarsData({ ...options } = {}) {
  return fetch({
    url: ENDPOINT_URL.get_env_vars_data,
    contentType: CONTENT_TYPE.json,
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    async: false,
    returnData: true,
    ...options,
  });
}

export async function getApplicationFormData({
  programId,
  beforeSend,
  onSuccess,
  ...options
}) {
  return fetch({
    url: ENDPOINT_URL.get_application_form_data(programId),
    contentType: CONTENT_TYPE.json,
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    async: false,
    beforeSend,
    onSuccess,
    ...options,
  });
}

export async function getClaimFormData({
  programId,
  beforeSend,
  onSuccess,
  ...options
}) {
  if (!programId) {
    logger.error({
      fn: getClaimFormData,
      message: 'Missing required params',
      data: {
        programId,
      },
    });
    return;
  }
  return fetch({
    url: ENDPOINT_URL.get_claim_form_data(programId),
    contentType: CONTENT_TYPE.json,
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    async: false,
    beforeSend,
    onSuccess,
    ...options,
  });
}

export async function getMunicipalData({ onSuccess = null, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_municipal_data,
    contentType: CONTENT_TYPE.json,
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    async: false,
    onSuccess,
    ...options,
  });
}

export async function getExpenseTypeData({ ...options } = {}) {
  return fetch({
    url: ENDPOINT_URL.get_expense_type_data,
    contentType: CONTENT_TYPE.json,
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    async: false,
    returnData: true,
    ...options,
  });
}

export async function getOrgbookAutocompleteData({
  searchStr,
  onSuccess,
  ...options
}) {
  return fetch({
    url: ENDPOINT_URL.get_orgbook_autocomplete_data,
    data: { q: searchStr, inactive: 'false', revoked: 'false', latest: 'true' },
    onSuccess,
    ...options,
  });
}

export async function getOrgbookTopicData({ topicSourceId, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_orgbook_topic_data,
    data: { q: topicSourceId },
    ...options,
  });
}

export async function getOrgbookCredentialsData({ topicId, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_orgbook_credentials_data(topicId),
    ...options,
  });
}

export async function getDocumentsData({ formId, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_documents_data(formId),
    returnData: true,
    skipCache: true,
    ...options,
  });
}

export async function getDocumentData({ annotationId, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_document_data(annotationId),
    returnData: true,
    ...options,
  });
}

export async function postDocumentData({
  formId,
  subject,
  filename,
  documentbody,
  mimetype,
  ...options
}) {
  return fetch({
    method: 'POST',
    url: ENDPOINT_URL.post_document_data,
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    addRequestVerificationToken: true,
    processData: false,
    returnData: true,
    data: JSON.stringify({
      subject,
      filename,
      objecttypecode: 'quartech_claim',
      'objectid_quartech_claim@odata.bind': `/quartech_claims(${formId})`,
      documentbody,
      mimetype,
    }),
    ...options,
  });
}

export async function deleteDocumentData({ annotationId, ...options }) {
  return fetch({
    method: 'DELETE',
    url: ENDPOINT_URL.delete_document_data(annotationId),
    addRequestVerificationToken: true,
    returnData: true,
    ...options,
  });
}

export async function getContactData({ contactId, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_contact_data(contactId),
    returnData: true,
    ...options,
  });
}

export async function patchClaimData({ id, fieldData, ...options }) {
  return fetch({
    method: 'PATCH',
    url: ENDPOINT_URL.patch_quartech_claim_data(id),
    datatype: DATATYPE.json,
    includeODataHeaders: true,
    addRequestVerificationToken: true,
    processData: false,
    returnData: true,
    data: JSON.stringify({
      ...fieldData,
    }),
    ...options,
  });
}
