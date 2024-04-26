import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/fetch');

POWERPOD.fetch = {
  getEnvVarsData,
  getApplicationFormData,
  getClaimFormData,
  getMunicipalData,
  getExpenseTypeData,
  getOrgbookAutocompleteData,
  getOrgbookTopicData,
  getOrgbookCredentialsData,
  getDocuments,
  CACHED_RESULTS: {},
};

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
  get_documents: (id) =>
    `/_api/annotations?$filter=_objectid_value%20eq%20${id}&$select=filename,filesize,modifiedon,subject,isdocument,objecttypecode`,
  get_orgbook_autocomplete_data:
    'https://orgbook.gov.bc.ca/api/v3/search/autocomplete',
  get_orgbook_topic_data: 'https://orgbook.gov.bc.ca/api/v4/search/topic',
  get_orgbook_credentials_data: (topicId) =>
    `https://orgbook.gov.bc.ca/api/v4/topic/${topicId}/credential-set`,
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

// Note: Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation
// async: false with jqXHR ($.Deferred) is deprecated; you must use the success/error/complete
// callback options instead of the corresponding methods of the jqXHR object such as jqXHR.done().

// TODO: cleanup usage of ".done()" deprecated method in project, functions still using:
// e.g. "getTopic" & "getTopicCredentials" in src/js/application/steps/applicantInfo.js
export async function fetch(params) {
  const {
    method = 'GET',
    url,
    beforeSend,
    onSuccess,
    onError,
    async = true,
    data = {},
    datatype, // request data type
    contentType, // expected response content type
    includeODataHeaders = false,
    skipCache = false,
    returnData = false, // return the data directly, skips having to pass onSuccess handler
  } = params;
  // check cache if used
  const paramsToHash = params;
  delete paramsToHash.skipCache;
  const reqHash = JSON.stringify(paramsToHash);
  logger.info({
    fn: fetch,
    message: 'Starting fetch request...',
    data: { ...params, fetch: POWERPOD.fetch },
  });
  if (!skipCache && POWERPOD.fetch.CACHED_RESULTS[reqHash]) {
    const { data, textStatus, xhr } = POWERPOD.fetch.CACHED_RESULTS[reqHash];
    logger.info({
      fn: fetch,
      message: `returning cached data for url: ${url}`,
      data: {
        data,
        params,
      },
    });
    if (returnData) return Promise.resolve(data);
    return Promise.resolve(onSuccess(data, textStatus, xhr));
  }
  // @ts-ignore
  return $.ajax({
    method,
    url,
    contentType,
    datatype,
    data,
    async,
    beforeSend: function (XMLHttpRequest) {
      if (includeODataHeaders) setODataHeaders(XMLHttpRequest);
      if (beforeSend && typeof beforeSend === 'function') beforeSend();
    },
    success: function (data, textStatus, xhr) {
      logger.info({
        fn: fetch,
        message: 'success handler called',
        data: {
          data,
          params,
        },
      });
      // always cache data
      POWERPOD.fetch.CACHED_RESULTS[reqHash] = { data, textStatus, xhr };

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
        onSuccess(data, textStatus, xhr);
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      logger.error({
        fn: fetch,
        message: xhr?.responseText,
        data: { xhr, textStatus, errorThrown },
      });
      if (onError && typeof onError === 'function') {
        onError(xhr, textStatus, errorThrown);
      }
    },
  }).then((data) => {
    if (returnData && data) {
      logger.info({
        fn: fetch,
        message: `returning data for url: ${url}`,
        data: {
          data,
          params,
        },
      });
      return Promise.resolve(data);
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

export async function getDocuments({ id, ...options }) {
  return fetch({
    url: ENDPOINT_URL.get_documents(id),
    ...options,
  });
}
