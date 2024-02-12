export const win: Window & typeof globalThis;
export const doc: Document;
export namespace Environment {
    let DEV: string;
    let TEST: string;
    let PROD: string;
}
export const Hosts: {
    [x: string]: string;
};
export const ClaimPaths: string[];
export const ApplicationPaths: string[];
export namespace Form {
    let Application: string;
    let Claim: string;
}
export namespace HtmlElementType {
    let Input: string;
    let FileInput: string;
    let SingleOptionSet: string;
    let MultiOptionSet: string;
    let DropdownSelect: string;
    let DatePicker: string;
}
export namespace FormStep {
    let Documents: string;
    let DeclarationAndConsent: string;
    let ApplicantInfo: string;
    let Eligibility: string;
    let Project: string;
    let DeliverablesBudget: string;
    let DemographicInfo: string;
    let ClaimInfo: string;
    let ProjectIndicators: string;
    let Consent: string;
    let Unknown: string;
}
export const TabNames: {
    [x: string]: string;
};
export const YES_VALUE: "255550000";
export const NO_VALUE: "255550001";
export const OTHER_VALUE: "255550010";
export const GROUP_APPLICATION_VALUE: "255550001";
export const SECTOR_WIDE_ID_VALUE: "6ce2584f-4740-ee11-be6e-000d3af3ac95";
export namespace POWERPOD {
    let test: {};
    let shared: {};
}
