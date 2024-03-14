import {
  getApplicationConfigData,
  getClaimConfigData,
  getGlobalConfigData,
} from './config.js';
import { showFieldRow, showFieldsetElement } from './html.js';
import { Logger } from './logger.js';
import { getProgramAbbreviation } from './program.ts';
import { POWERPOD } from './constants.js';
import { mergeFieldArrays } from './utils.js';
import { configureSections } from './sections.js';

POWERPOD.fields = {
  getFieldsBySectionApplication,
  getFieldsBySectionClaim,
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
    logger.info({
      fn: getFieldsBySectionApplication,
      message: `showing field name: ${s.name}`,
    });
    showFieldRow(s.name);
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
      message: `showing field name: ${s.name}`,
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
  // @ts-ignore
  logger.info({ fn: getGlobalConfigData, data: getGlobalConfigData() });
  return getGlobalConfigData()?.FieldsConfig?.programs?.find(
    (program) => program.name === 'ALL'
  );
}
