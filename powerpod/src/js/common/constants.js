export const win = window;
export const doc = document;

export const Environment = {
  DEV: 'dev',
  TEST: 'test',
  PROD: 'prod',
};

export const Hosts = {
  [Environment.DEV]: 'af-pods-dev.powerappsportals.com',
  [Environment.TEST]: 'af-pods-test.powerappsportals.com',
  [Environment.PROD]: 'af-pods.powerappsportals.com',
};
export const ClaimPaths = ['/claim/', '/claim-dev/'];
export const ApplicationPaths = ['/application/', '/application-dev/'];

export const Form = {
  Application: 'Application',
  Claim: 'Claim',
};

export const HtmlElementType = {
  Input: 'Input',
  FileInput: 'FileInput',
  SingleOptionSet: 'SingleOptionSet',
  MultiOptionSet: 'MultiOptionSet',
  DropdownSelect: 'DropdownSelect',
  DatePicker: 'DatePicker',
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
  Consent: 'ConsentStep',
  // Unknown
  Unknown: 'UnknownStep',
};

export const TabNames = {
  // Shared Steps:
  [FormStep.Documents]: 'Documents',
  [FormStep.DeclarationAndConsent]: 'Application Declaration and Consent',
  // Application Steps:
  [FormStep.ApplicantInfo]: 'Applicant Information',
  [FormStep.Eligibility]: 'Eligibility',
  [FormStep.Project]: 'Project',
  [FormStep.DeliverablesBudget]: 'Deliverables & Budget',
  [FormStep.DemographicInfo]: 'Demographic Information',
  // Claim Steps:
  // [FormStep.ClaimInfo]: 'Claim Information', // NOTE: renamed to ApplicantInfoStep
  [FormStep.ProjectResults]: 'Project Results',
};

export const YES_VALUE = '255550000';
export const NO_VALUE = '255550001';
export const OTHER_VALUE = '255550010';
export const GROUP_APPLICATION_VALUE = '255550001';
export const SECTOR_WIDE_ID_VALUE = '6ce2584f-4740-ee11-be6e-000d3af3ac95';

// TODO: move this to some kind of state management module
// cache common elements
export const POWERPOD = {
  programId: null,
  test: {},
  shared: {},
};
