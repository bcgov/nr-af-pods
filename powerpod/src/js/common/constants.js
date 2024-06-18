export const win = window;
export const doc = document;

export const Environment = {
  DEV: 'dev',
  TEST: 'test',
  PROD: 'prod',
};

export const Hosts = {
  [Environment.DEV]: [
    'af-pods-dev.powerappsportals.com',
    'af-pods-dev.crm3.dynamics.com',
  ],
  [Environment.TEST]: ['af-pods-test.powerappsportals.com'],
  [Environment.PROD]: ['af-pods.powerappsportals.com'],
};
export const ClaimPaths = ['/claim/', '/claim-dev/'];
export const ApplicationPaths = ['/application/', '/application-dev/'];

export const Form = {
  Application: 'Application',
  Claim: 'Claim',
  StaffPortalClaim: 'StaffPortalClaim',
};

export const HtmlElementType = {
  Input: 'Input',
  CurrencyInput: 'CurrencyInput',
  TextArea: 'TextArea',
  FileInput: 'FileInput',
  SingleOptionSet: 'SingleOptionSet',
  MultiOptionSet: 'MultiOptionSet',
  DropdownSelect: 'DropdownSelect',
  DatePicker: 'DatePicker',
  Checkbox: 'Checkbox',
  Unknown: 'Unknown',
};

export const FormStep = {
  // Shared Steps:
  Documents: 'DocumentsStep',
  DeclarationAndConsent: 'DeclarationAndConsentStep',
  // Application Steps:
  ApplicantInfo: 'ApplicantInfoStep',
  Eligibility: 'EligibilityStep',
  Project: 'ProjectStep',
  DeliverablesBudget: 'DeliverablesBudgetStep',
  DemographicInfo: 'DemographicInfoStep',
  // Claim Steps:
  ProjectResults: 'ProjectResultsStep',
  ClaimInfo: 'ClaimInfoStep',
  // Unknown
  Unknown: 'UnknownStep',
};

export const TabDisplayNames = {
  // Shared Steps:
  [FormStep.Documents]: 'Documents',
  [FormStep.DeclarationAndConsent]: [
    'Application Declaration and Consent',
    'Declaration and Consent',
  ],
  // Application Steps:
  [FormStep.ApplicantInfo]: 'Applicant Information',
  [FormStep.Eligibility]: 'Eligibility',
  [FormStep.Project]: 'Project',
  [FormStep.DeliverablesBudget]: 'Deliverables & Budget',
  [FormStep.DemographicInfo]: 'Demographic Information',
  // Claim Steps:
  [FormStep.ClaimInfo]: 'Claim Information',
  [FormStep.ProjectResults]: 'Project Results',
};

export const TabNames = {
  // Shared Steps:
  [FormStep.Documents]: 'tab_Supporting_Documentation',
  [FormStep.DeclarationAndConsent]: ['tab_Declaration_Consent', 'consentTab'],
  // Application Steps:
  [FormStep.ApplicantInfo]: ['tab_ApplicantInfo', 'applicantInfoTab'],
  [FormStep.Eligibility]: 'tab_eligibility',
  [FormStep.Project]: 'tab_Project',
  [FormStep.DeliverablesBudget]: 'tab_Deliverables_Budget',
  // [FormStep.DemographicInfo]: '', // no tab name declared
  // Claim Steps:
  [FormStep.ClaimInfo]: 'claimInfoTab',
  [FormStep.ProjectResults]: 'projectResultsTab',
};

export const YES_VALUE = '255550000';
export const NO_VALUE = '255550001';
export const OTHER_VALUE = '255550010';
export const GROUP_APPLICATION_VALUE = '255550001';
export const SECTOR_WIDE_ID_VALUE = '6ce2584f-4740-ee11-be6e-000d3af3ac95';

// TODO: move this to some kind of state management module
// cache common elements
export const POWERPOD = {
  state: {},
  program: {},
  applicationUtils: {},
  test: {},
  shared: {},
  validation: {
    enableIntervalBased: true,
    errorHtml: '',
  },
  fieldValidation: {},
  documents: {},
  docUtils: {},
  fetch: {},
  dynamics: {},
  options: {},
  logger: {},
  saveButton: {},
  doNotUnhideLoader: false,
  redirectToNewId: false,
  components: {},
};
