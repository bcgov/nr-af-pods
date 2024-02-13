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

POWERPOD.fields = {
  getFieldsBySection,
  getFieldsBySectionOld,
  getFieldsBySectionNew,
};

const logger = Logger('common/fields');

// To be used with new global & application level configs
export function getFieldsBySectionNew(stepName, forceRefresh = false) {
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
    fn: getFieldsBySectionNew,
    message: 'globalConfigData:',
    data: globalConfigData,
  });
  const applicationConfigData = getApplicationConfigData();
  logger.info({
    fn: getFieldsBySectionNew,
    message: 'applicationConfigData:',
    data: applicationConfigData,
  });

  const globalSections = globalConfigData?.sections;
  const applicationSections = applicationConfigData?.sections;

  const applicationSection = applicationSections?.find(
    (s) => s.name === stepName
  );
  const globalSection = globalSections.find((s) => s.name === stepName);

  let fields = [];

  if (!applicationSection && !globalSection) {
    logger.error({
      fn: getFieldsBySectionNew,
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
      fn: getFieldsBySectionNew,
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
      fn: getFieldsBySectionNew,
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
      fn: getFieldsBySectionNew,
      message: `showing field name: ${s.name}`,
    });
    showFieldRow(s.name);
  });

  localStorage.setItem(
    `fieldsData-${programName}-${stepName}`,
    JSON.stringify(fields)
  );

  logger.info({
    fn: getFieldsBySectionNew,
    message: 'fieldsData:',
    data: fields,
  });

  return fields;
}

export function getGlobalFieldsConfig() {
  // @ts-ignore
  logger.info({ data: getGlobalConfigData() });
  return getGlobalConfigData()?.FieldsConfig?.programs?.find(
    (program) => program.name === 'ALL'
  );
}

// TODO: Remove this old func
// Still used in application.js
export function getFieldsBySectionOld(sectionName, forceRefresh = false) {
  let programName = getProgramAbbreviation();

  let generateFilterCondition = (program) =>
    program.name === 'ALL' || program.name === programName;

  // if this is for KTTP program, add additional check for KTTP JSON config
  if (programName.includes('KTTP')) {
    generateFilterCondition = (program) =>
      program.name === 'ALL' ||
      program.name === 'KTTP' ||
      program.name === programName;
  }

  if (!forceRefresh) {
    const savedData = localStorage.getItem(
      `fieldsData-${programName}-${sectionName}`
    );
    if (savedData) {
      return JSON.parse(savedData);
    }
  }

  const fieldsConfigData = getClaimConfigData()?.FieldsConfig;

  logger.info({
    fn: getFieldsBySectionOld,
    message: 'fieldsConfigData:',
    data: fieldsConfigData,
  });

  if (!fieldsConfigData || !fieldsConfigData.programs) return;

  let fields = [];

  fieldsConfigData?.programs
    .filter((program) => generateFilterCondition(program))
    .forEach((program) => {
      if (!program.sections) return;

      const programSection = program?.sections?.find(
        (section) => section?.name === sectionName
      );

      if (!programSection || !programSection.fields) return;

      const sectionFields = programSection.fields;

      sectionFields.forEach((field) => {
        if (fields && fields.length) {
          const existingFieldIndex = fields.findIndex(
            (f) => f.name === field.name
          );
          if (existingFieldIndex > -1) {
            fields.splice(existingFieldIndex, 1);
          }
        }
        showFieldRow(field.name);
        fields.push(field);
      });
    });

  localStorage.setItem(
    `fieldsData-${programName}-${sectionName}`,
    JSON.stringify(fields)
  );

  logger.info({
    fn: getFieldsBySectionOld,
    message: 'fieldsData:',
    data: fields,
  });

  return fields;
}

export function getFieldsBySection(sectionName, forceRefresh = false) {
  let programName = getProgramAbbreviation();

  // load cached results unless forceRefresh flag is passed
  if (!forceRefresh) {
    const savedData = localStorage.getItem(
      `fieldsData-${programName}-${sectionName}`
    );
    if (savedData) {
      return JSON.parse(savedData);
    }
  }

  const fieldsConfigData = getClaimConfigData()?.FieldsConfig;

  logger.info({
    fn: getFieldsBySection,
    message: 'fieldsConfigData:',
    data: fieldsConfigData,
  });

  if (!fieldsConfigData || !fieldsConfigData.programs) return;

  let fields = [];

  fieldsConfigData?.programs
    .filter((program) => program.name === programName)
    .forEach((program) => {
      if (!program.sections) return;

      const programSection = program?.sections?.find(
        (section) => section?.name === sectionName
      );

      if (!programSection || !programSection.fieldsets) return;

      const sectionFieldsets = programSection.fieldsets;

      sectionFieldsets.forEach((fieldset) => {
        if (!fieldset.name || !fieldset.fields) return;
        const fieldsetName = fieldset.name;
        const fieldsetFields = fieldset.fields;

        // if config exists for a fieldset, unhide it
        showFieldsetElement(fieldsetName);

        fieldsetFields.forEach((field) => {
          // if config exists for a field, unhide it
          showFieldRow(field.name);
          fields.push(field);
        });
      });
    });

  // cache results to avoid future processing for config
  localStorage.setItem(
    `fieldsData-${programName}-${sectionName}`,
    JSON.stringify(fields)
  );

  logger.info({ fn: getFieldsBySection, message: 'fieldsData:', data: fields });

  return fields;
}
