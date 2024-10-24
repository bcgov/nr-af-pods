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
  getFieldRow,
  getControlType,
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

  // OLD: now try getting results from state
  // load cached results unless forceRefresh flag is passed
  // if (!forceRefresh) {
  //   const savedData = localStorage.getItem(
  //     `fieldsData-${programName}-${stepName}`
  //   );
  //   if (savedData) {
  //     return JSON.parse(savedData);
  //   }
  // }

  if (!forceRefresh) {
    if (POWERPOD.loadingFieldsIntoState === false) {
      logger.info({
        fn: getFieldsBySectionApplication,
        message: `returning cached state for fields`,
        data: { fields: POWERPOD.state.fields },
      });
      return POWERPOD.state.fields;
    }
  }

  logger.info({
    fn: getFieldsBySectionApplication,
    message: `start building initial fields state loading: ${POWERPOD.loadingFieldsIntoState}`,
  });

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
    fields = mergeFieldArrays(fields, globalFields, 'name');
  }

  if (
    localStorage.getItem(
      `fieldsData-${programName}-${stepName}`,
      JSON.stringify(fields)
    )
  ) {
    localStorage.removeItem(
      `fieldsData-${programName}-${stepName}`,
      JSON.stringify(fields)
    );
  }

  localStorage.setItem(
    `fieldsData-${programName}-${stepName}`,
    JSON.stringify(fields)
  );

  fields.forEach((s) => {
    if (document.getElementById(s.name) === null) {
      logger.warn({
        fn: getFieldsBySectionApplication,
        message: `Skipping non-exist field configured in JSON s.name: ${s.name}`,
      });
      return;
    }
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
    // If elementType is not given, fill it out for future reference
    if (!s.elementType) {
      logger.info({
        fn: getFieldsBySectionApplication,
        message: `Field elementType not set, try to determine it using getControlType func for s.name: ${s.name}`,
      });
      const fieldRow = getFieldRow(s.name);
      if (!fieldRow) {
        logger.error({
          fn: getFieldsBySectionApplication,
          message: `could not find fieldRow for fieldName: ${s.name}`,
        });
      }
      const elementType = getControlType({ tr: fieldRow, controlId: s.name });
      s.elementType = elementType;
    }
    ///
    store.dispatch('addFieldData', {
      ...s,
      loading: true,
      touched: false,
      revalidate: true,
    });
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

  POWERPOD.loadingFieldsIntoState = false;

  logger.info({
    fn: getFieldsBySectionApplication,
    message: 'done loading intial field state, fieldsData:',
    data: { fields: POWERPOD.state.fields },
  });

  return POWERPOD.state.fields;
}

export function getFieldsBySectionClaim(stepName, forceRefresh = false) {
  let programName = getProgramAbbreviation();

  // OLD: now try getting results from state
  // load cached results unless forceRefresh flag is passed
  // if (!forceRefresh) {
  //   const savedData = localStorage.getItem(
  //     `fieldsData-${programName}-${stepName}`
  //   );
  //   if (savedData) {
  //     return JSON.parse(savedData);
  //   }
  // }

  if (!forceRefresh) {
    if (POWERPOD.loadingFieldsIntoState === false) {
      logger.info({
        fn: getFieldsBySectionApplication,
        message: `returning cached state for fields`,
        data: { fields: POWERPOD.state.fields },
      });
      return POWERPOD.state.fields;
    }
  }

  logger.info({
    fn: getFieldsBySectionApplication,
    message: `call getClaimConfigData() to get fields data`,
    data: { fields: POWERPOD.state.fields },
  });

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
    if (document.getElementById(s.name) === null) {
      logger.warn({
        fn: getFieldsBySectionClaim,
        message: `Skipping non-exist field configured in JSON s.name: ${s.name}`,
      });
      return;
    }
    logger.info({
      fn: getFieldsBySectionClaim,
      message: `Getting field with fieldName: ${s.name}...`,
      data: { programName, stepName, fieldName: s.name, field: s },
    });
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
    // If elementType is not given, fill it out for future reference
    if (!s.elementType) {
      logger.info({
        fn: getFieldsBySectionClaim,
        message: `Field elementType not set, try to determine it using getControlType func for s.name: ${s.name}`,
      });
      const fieldRow = getFieldRow(s.name);
      if (!fieldRow) {
        logger.error({
          fn: getFieldsBySectionClaim,
          message: `could not find fieldRow for fieldName: ${s.name}`,
        });
      }
      const elementType = getControlType({ tr: fieldRow, controlId: s.name });
      s.elementType = elementType;
    }
    store.dispatch('addFieldData', {
      ...s,
      loading: true,
      touched: false,
      revalidate: true,
    });
    if (s.relocateField) {
      logger.info({
        fn: getFieldsBySectionClaim,
        message: `relocating field name: ${s.name}`,
      });
      relocateField(s);
    }
    // if (s.visibleIf) {
    //   logger.warn({
    //     fn: getFieldsBySectionClaim,
    //     message: `NOT showing field since conditionally defined visibleIf, name: ${s.name}`,
    //   });
    //   return;
    // }
    logger.info({
      fn: getFieldsBySectionClaim,
      message: `showing field name: ${s.name}, for programName: ${programName}, stepName: ${stepName}`,
    });
    // showFieldRow(s.name);
  });

  POWERPOD.loadingFieldsIntoState = false;

  // localStorage.setItem(
  //   `fieldsData-${programName}-${stepName}`,
  //   JSON.stringify(fields)
  // );

  logger.info({
    fn: getFieldsBySectionClaim,
    message: 'done loading intial field state, fieldsData:',
    data: { fields: POWERPOD.state.fields },
  });

  return POWERPOD.state.fields;
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
  }
  // else {
  //   logger.error({
  //     fn: getFieldConfig,
  //     message: `Could not find field config in state, trying local storage`,
  //   });
  //   return;
  //   let programName = getProgramAbbreviation();
  //   let stepName = getCurrentStep();

  //   const fieldsConfig = JSON.parse(
  //     localStorage.getItem(`fieldsData-${programName}-${stepName}`)
  //   );

  //   fieldConfig = fieldsConfig.first((f) => f.name === fieldName);
  // }

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
