// @ts-nocheck
import {
  getApplicationConfigData,
  getClaimConfigData,
  getGlobalConfigData,
} from './config.js';
import {
  combineElementsIntoOneRowNew,
  disableSingleLine,
  relocateField,
  showFieldRow,
} from './html.js';
import { Logger } from './logger.js';
import { getCurrentStep, getProgramAbbreviation } from './program.ts';
import { POWERPOD, FormStep, HtmlElementType } from './constants.js';
import { mergeFieldArrays } from './utils.js';
import { configureSections } from './sections.js';
import { hideTabs } from './tabs.js';
import store from '../store/index.js';

POWERPOD.fields = {
  loading: true,
  getFieldsBySectionApplication,
  getFieldsBySectionClaim,
  getFieldConfig,
};

const logger = Logger('common/fields');

// To be used with new global & application level configs
export function getFieldsBySectionApplication(stepName, forceRefresh = false) {
  let programName = getProgramAbbreviation();

  // load cached results unless forceRefresh flag is passed
  if (!forceRefresh) {
    const savedData = localStorage.getItem(
      `fieldsData-${programName}-${stepName}`
    );
    if (savedData) {
      return JSON.parse(savedData);
    }
  }

  const globalConfigData = getGlobalFieldsConfig();
  logger.info({
    fn: getFieldsBySectionApplication,
    message: 'globalConfigData:',
    data: globalConfigData,
  });
  const applicationConfigData = getApplicationConfigData();
  logger.info({
    fn: getFieldsBySectionApplication,
    message: 'applicationConfigData:',
    data: applicationConfigData,
  });

  const globalSections = globalConfigData?.sections;
  const applicationSections = applicationConfigData?.sections;

  // only supports configuration from application json level
  configureSections(applicationSections);

  // hide tabs if 'hiddenSteps' is passed in JSON config
  const hiddenSteps = applicationConfigData.hiddenSteps;
  if (hiddenSteps) hideTabs(hiddenSteps);

  const applicationSection = applicationSections?.find(
    (s) => s.name === stepName
  );
  const globalSection = globalSections.find((s) => s.name === stepName);

  let fields = [];

  if (!applicationSection && !globalSection) {
    logger.warn({
      fn: getFieldsBySectionApplication,
      message: `no configuration section found by sectionName: ${stepName}`,
      data: {
        sectionName: stepName,
        forceRefresh,
        globalSections,
        applicationSections,
      },
    });
    return;
  }

  if (!applicationSection || !applicationSection.fields?.length) {
    logger.warn({
      fn: getFieldsBySectionApplication,
      message: `no applicationSection section found by sectionName: ${stepName}`,
      data: {
        sectionName: stepName,
        forceRefresh,
        globalSections,
        applicationSections,
      },
    });
  } else if (applicationSection.fields?.length) {
    fields.push(...applicationSection.fields);
  }

  if (!globalSection || !globalSection.fields?.length) {
    logger.warn({
      fn: getFieldsBySectionApplication,
      message: `no globalSection section found by sectionName: ${stepName}`,
      data: {
        sectionName: stepName,
        forceRefresh,
        globalSections,
        applicationSections,
      },
    });
  } else if (globalSection.fields?.length) {
    // if so, merge them, with application-level config taking precedence
    const globalFields = globalSection.fields;
    fields = mergeFieldArrays(globalFields, fields, 'name');
  }

  fields.forEach((s) => {
    if (s.type === 'SectionTitle') {
      return;
    }
    // TODO: Improve this as we do regression testing
    // Only enable for NEFBA2 and appropriate steps right now.
    if (
      s.type !== 'SectionTitle' &&
      !s.disableSingleLine &&
      ![
        FormStep.Documents,
        FormStep.DeclarationAndConsent,
        FormStep.Unknown,
      ].includes(stepName)
    ) {
      combineElementsIntoOneRowNew(s.name);
    }
    if (s.disableSingleLine) {
      disableSingleLine(s.name);
    }
    store.dispatch('addFieldData', { ...s, loading: true, touched: false });
    if (s.relocateField) {
      logger.info({
        fn: getFieldsBySectionApplication,
        message: `relocating field name: ${s.name}`,
      });
      relocateField(s);
    }
    // if (s.visibleIf) {
    //   logger.warn({
    //     fn: getFieldsBySectionApplication,
    //     message: `NOT showing field since conditionally defined visibleIf, name: ${s.name}`,
    //   });
    //   return;
    // }
    // if (s.type !== 'SectionTitle') {
    //   logger.info({
    //     fn: getFieldsBySectionApplication,
    //     message: `showing field name: ${s.name}, s: ${JSON.stringify(s)}`,
    //   });
    //   showFieldRow(s.name);
    // }
  });
  localStorage.setItem(
    `fieldsData-${programName}-${stepName}`,
    JSON.stringify(fields)
  );

  logger.info({
    fn: getFieldsBySectionApplication,
    message: 'fieldsData:',
    data: fields,
  });

  POWERPOD.fields.loading = false;

  return fields;
}

export function getFieldsBySectionClaim(stepName, forceRefresh = false) {
  let programName = getProgramAbbreviation();

  // load cached results unless forceRefresh flag is passed
  if (!forceRefresh) {
    const savedData = localStorage.getItem(
      `fieldsData-${programName}-${stepName}`
    );
    if (savedData) {
      return JSON.parse(savedData);
    }
  }

  const claimConfigData = getClaimConfigData();
  logger.info({
    fn: getFieldsBySectionClaim,
    message: 'claimConfigData:',
    data: claimConfigData,
  });

  const claimSections = claimConfigData?.sections;

  const claimSection = claimSections?.find((s) => s.name === stepName);

  if (!claimSection || !claimSection?.fields?.length) {
    logger.warn({
      fn: getFieldsBySectionClaim,
      message: `no configuration section found by sectionName: ${stepName}`,
      data: {
        sectionName: stepName,
        forceRefresh,
        claimSections,
      },
    });
    return;
  }

  let fields = claimSection.fields;

  fields.forEach((s) => {
    logger.info({
      fn: getFieldsBySectionClaim,
      message: `Getting field with fieldName: ${s.name}...`,
      data: { programName, stepName, fieldName: s.name, field: s },
    });
    // TODO: Improve this as we do regression testing
    // Only enable for VVTS and appropriate steps right now.
    if (
      programName === 'VVTS' &&
      s.elementType !== 'FileInput' &&
      ![
        FormStep.ProjectResults,
        FormStep.ApplicantInfo,
        FormStep.DeclarationAndConsent,
        FormStep.Unknown,
        FormStep.DemographicInfo,
      ].includes(stepName)
    ) {
      combineElementsIntoOneRowNew(s.name);
    }
    store.dispatch('addFieldData', { ...s, touched: false });
    if (s.visibleIf) {
      logger.warn({
        fn: getFieldsBySectionClaim,
        message: `NOT showing field since conditionally defined visibleIf, name: ${s.name}`,
      });
      return;
    }
    logger.info({
      fn: getFieldsBySectionClaim,
      message: `showing field name: ${s.name}, for programName: ${programName}, stepName: ${stepName}`,
    });
    showFieldRow(s.name);
  });

  localStorage.setItem(
    `fieldsData-${programName}-${stepName}`,
    JSON.stringify(fields)
  );

  logger.info({
    fn: getFieldsBySectionClaim,
    message: 'fieldsData:',
    data: fields,
  });

  return fields;
}

export function getGlobalFieldsConfig() {
  logger.info({ fn: getGlobalConfigData, data: getGlobalConfigData() });
  return getGlobalConfigData()?.FieldsConfig?.programs?.find(
    (program) => program.name === 'ALL'
  );
}

export function getFieldConfig(fieldName) {
  let fieldConfig;
  if (POWERPOD.state?.fields?.[fieldName]) {
    fieldConfig = POWERPOD.state?.fields?.[fieldName];
  } else {
    logger.error({
      fn: getFieldConfig,
      message: `Could not find field config in state, trying local storage`,
    });
    return;
    let programName = getProgramAbbreviation();
    let stepName = getCurrentStep();

    const fieldsConfig = JSON.parse(
      localStorage.getItem(`fieldsData-${programName}-${stepName}`)
    );

    fieldConfig = fieldsConfig.first((f) => f.name === fieldName);
  }

  if (!fieldConfig) {
    logger.error({
      fn: getFieldConfig,
      message: `Could not find fieldConfig for fieldName: ${fieldName}`,
    });
    return;
  }

  logger.info({
    fn: getFieldConfig,
    message: `Retrieved field config for name: ${fieldName}`,
    data: { fieldConfig },
  });

  return fieldConfig;
}
