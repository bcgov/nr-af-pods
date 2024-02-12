export function fetch(params: any): Promise<any>;
export function getEnvVarsData({ ...options }?: {}): Promise<any>;
export function getApplicationFormData({ programId, beforeSend, onSuccess, ...options }: {
    [x: string]: any;
    programId: any;
    beforeSend: any;
    onSuccess: any;
}): Promise<any>;
export function getClaimFormData({ programId, beforeSend, onSuccess, ...options }: {
    [x: string]: any;
    programId: any;
    beforeSend: any;
    onSuccess: any;
}): Promise<any>;
export function getMunicipalData({ onSuccess, ...options }: {
    [x: string]: any;
    onSuccess?: null | undefined;
}): Promise<any>;
export function getOrgbookAutocompleteData({ searchStr, onSuccess, ...options }: {
    [x: string]: any;
    searchStr: any;
    onSuccess: any;
}): Promise<any>;
export function getOrgbookTopicData({ topicSourceId, ...options }: {
    [x: string]: any;
    topicSourceId: any;
}): Promise<any>;
export function getOrgbookCredentialsData({ topicId, ...options }: {
    [x: string]: any;
    topicId: any;
}): Promise<any>;
export namespace ENDPOINT_URL {
    let get_env_vars_data: string;
    function get_application_form_data(programId: any): string;
    function get_claim_form_data(programId: any): string;
    let get_municipal_data: string;
    let get_orgbook_autocomplete_data: string;
    let get_orgbook_topic_data: string;
    function get_orgbook_credentials_data(topicId: any): string;
}
